#include "./lib/noise.glsl"

uniform sampler2D uAlbedo;
/** r: elevation, g: water mask, b: night-light mask, a: roughness bias. */
uniform sampler2D uData;
uniform vec2  uTexel;
uniform vec3  uSunPos;
uniform vec3  uSunColor;
uniform vec3  uAtmosphere;
uniform float uTime;
uniform float uHighstorm;
uniform float uCognitive;
uniform float uEmissive;
uniform vec3  uEmissiveColor;
uniform float uNightLights;
uniform float uClouds;
uniform vec3  uCloudTint;
uniform float uCloudSpin;
uniform float uRelief;
uniform float uSpecular;
uniform float uDetail;
uniform float uSeed;
uniform float uIce;
uniform float uTidal;
uniform float uRingShadow;
uniform vec3  uRingAxis;
uniform float uRingInner;
uniform float uRingOuter;

varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vObj;

const float PI = 3.14159265359;

float heightAt(vec2 uv) {
  return texture2D(uData, uv).r;
}

/** GGX, trimmed to what a planet needs: one light, no IBL. */
float specGGX(vec3 n, vec3 v, vec3 l, float rough) {
  vec3 h = normalize(v + l);
  float a = max(0.002, rough * rough);
  float a2 = a * a;
  float ndh = max(dot(n, h), 0.0);
  float ndv = max(dot(n, v), 0.0001);
  float ndl = max(dot(n, l), 0.0);
  float d = ndh * ndh * (a2 - 1.0) + 1.0;
  d = a2 / (PI * d * d);
  float k = a * 0.5;
  float gv = ndv / (ndv * (1.0 - k) + k);
  float gl = ndl / (ndl * (1.0 - k) + k);
  return d * gv * gl;
}

/**
 * Cloud density over the sphere. Two advecting layers, ridged for filaments.
 *
 * Seven noise evaluations, not twenty: this runs twice per pixel (once for the
 * deck, once for the shadow it throws) over a globe that fills the frame, and
 * a domain warp in here cost more than the whole atmosphere pass.
 */
float cloudField(vec3 p, float t) {
  vec3 q = p * 2.4 + vec3(uSeed);
  vec3 flow = q + vec3(t * 0.05, 0.0, t * 0.01);
  float a = fbm3(flow, 4, 2.05, 0.5);
  float b = ridged(flow * 2.1 + 7.0, 3, 2.1, 0.55);
  float band = 0.55 + 0.45 * sin(p.y * 5.0 + a * 3.4);
  float d = (a * 0.5 + 0.5) * 0.62 + b * 0.5;
  d = smoothstep(0.42, 0.86, d * (0.55 + 0.6 * band));
  return d;
}

void main() {
  vec3 n = normalize(vNormal);
  vec4 base = texture2D(uAlbedo, vUv);
  vec3 albedo = base.rgb;
  vec4 data = texture2D(uData, vUv);
  float water = data.g;
  float lights = data.b;

  vec3 toSun = normalize(uSunPos - vWorld);
  vec3 view = normalize(cameraPosition - vWorld);
  float fres = 0.0;

  // ---- surface normal -------------------------------------------------
  // East / north frame on the sphere. Poles degenerate; the cos(lat) guard
  // below stops the gradient exploding there.
  vec3 up = abs(n.y) > 0.995 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
  vec3 east = normalize(cross(up, n));
  vec3 north = cross(n, east);

  float cosLat = max(0.18, sqrt(max(0.0, 1.0 - n.y * n.y)));
  float hL = heightAt(vUv - vec2(uTexel.x, 0.0));
  float hR = heightAt(vUv + vec2(uTexel.x, 0.0));
  float hD = heightAt(vUv - vec2(0.0, uTexel.y));
  float hU = heightAt(vUv + vec2(0.0, uTexel.y));
  vec2 grad = vec2((hR - hL) / cosLat, (hU - hD));

  // High-frequency relief the baked plate cannot hold. Costs three extra
  // noise evaluations and is what makes a close globe stop looking painted.
  if (uDetail > 0.01) {
    float e = 0.0035;
    vec3 dp = vObj * 34.0 + vec3(uSeed * 3.1);
    float c0 = fbm3(dp, 4, 2.05, 0.5);
    float cx = fbm3(dp + east * e * 34.0, 4, 2.05, 0.5);
    float cy = fbm3(dp + north * e * 34.0, 4, 2.05, 0.5);
    float land = 1.0 - water;
    grad += vec2(cx - c0, cy - c0) * (34.0 * uDetail * (0.35 + 0.65 * land));
  }

  float relief = uRelief * (0.35 + 0.65 * (1.0 - water));
  vec3 nSurf = normalize(n - (east * grad.x + north * grad.y) * relief);

  // ---- direct light ---------------------------------------------------
  float ndl = dot(nSurf, toSun);
  float geoNdl = dot(n, toSun);
  // Soft terminator: a planet's edge of night is a gradient, not a crease.
  float shade = smoothstep(-0.14, 0.16, geoNdl);
  float diff = max(0.0, ndl) * shade;
  // A little wrap keeps the dark side from going pure black on a rough world.
  float wrap = (max(0.0, ndl) * 0.86 + 0.14) * shade;

  float rough = mix(0.34, 0.92, clamp(data.a + (1.0 - water) * 0.55, 0.0, 1.0));
  vec3 lit = albedo * wrap * uSunColor;
  // Starlight and the system's own scattered light. Without a floor the dark
  // hemisphere is a hole in the frame and the world reads as a crescent.
  lit += albedo * vec3(0.030, 0.040, 0.072) * (1.0 - shade * 0.72);

  // Ocean glint. Only water, only near the specular lobe, and killed on the
  // night side so a bloom pass cannot find it there.
  float sea = water * uSpecular;
  if (sea > 0.001) {
    // Clamped: an unbounded GGX peak is a single blown pixel that the bloom
    // and streak passes then smear into a bar across the whole equator.
    float s = min(specGGX(nSurf, view, toSun, 0.30 + 0.20 * (1.0 - sea)), 2.6);
    lit += uSunColor * s * sea * 0.26 * shade;
  }
  // Broad sheen on land, so mountains catch the low sun.
  lit += uSunColor * min(specGGX(nSurf, view, toSun, rough), 3.0) * (1.0 - water) * 0.06 * shade;

  // ---- clouds ---------------------------------------------------------
  if (uClouds > 0.001) {
    vec3 cp = vObj;
    float ca = uCloudSpin;
    cp = vec3(cp.x * cos(ca) + cp.z * sin(ca), cp.y, -cp.x * sin(ca) + cp.z * cos(ca));
    float d = cloudField(cp, uTime);
    // Shadow: read the field again a step toward the sun and darken by it.
    vec3 sunObj = normalize(cp + toSun * 0.14);
    float sh = cloudField(sunObj, uTime);
    lit *= 1.0 - sh * uClouds * 0.42 * shade;

    float cover = d * uClouds;
    float cl = max(0.0, dot(n, toSun)) * 0.78 + 0.22;
    // Silver lining: clouds forward-scatter hard at grazing sun angles.
    float ms = pow(max(0.0, dot(view, -toSun)), 6.0) * 0.6;
    vec3 cloudCol = uCloudTint * (cl + ms) * uSunColor;
    lit = mix(lit, cloudCol, cover * shade * 0.92);
    // Cloud tops still lit a moment after the ground is dark.
    lit += uCloudTint * cover * smoothstep(-0.28, 0.02, geoNdl) * (1.0 - shade) * 0.22;
  }

  // ---- ice caps -------------------------------------------------------
  if (uIce > 0.001) {
    float lat = abs(n.y);
    float cap = smoothstep(0.78 - uIce * 0.22, 0.94, lat + fbm3(vObj * 6.0 + uSeed, 3, 2.05, 0.5) * 0.12);
    lit = mix(lit, vec3(0.90, 0.95, 1.02) * wrap * uSunColor, cap * uIce);
  }

  // ---- night side -----------------------------------------------------
  float night = 1.0 - shade;
  // Only the dark side pays for city lights, and only where there are any.
  if (uNightLights > 0.001 && night > 0.02 && lights > 0.001) {
    // Settlement clumps, not a smear: threshold a noise field against the
    // baked light mask so cities read as points from orbit.
    float grid = fbm3(vObj * 90.0 + uSeed * 7.0, 3, 2.07, 0.5) * 0.5 + 0.5;
    float city = smoothstep(0.52, 0.78, grid) * lights;
    float twinkle = 0.86 + 0.14 * sin(uTime * 2.1 + hash13(vObj * 40.0) * 40.0);
    lit += uEmissiveColor * uNightLights * city * night * twinkle * 0.85;
    lit += uEmissiveColor * uNightLights * lights * night * 0.06;
  }

  // ---- Roshar: the highstorm front ------------------------------------
  if (uHighstorm > 0.001) {
    float lon = vUv.x + uTime * 0.022;
    float dx = abs(fract(lon) - 0.5);
    float turb = fbm3(vObj * 9.0 + vec3(uTime * 0.25, 0.0, 0.0), 4, 2.05, 0.5) * 0.5 + 0.5;
    float band = smoothstep(0.022, 0.002, dx + turb * 0.008);
    float wall = smoothstep(0.006, 0.0, abs(dx - 0.003 - turb * 0.002));
    float latFade = smoothstep(0.06, 0.20, vUv.y) * smoothstep(0.94, 0.78, vUv.y);
    float front = band * latFade * uHighstorm;
    lit = mix(lit, vec3(0.36, 0.46, 0.63) * (0.22 + 0.85 * shade), front * 0.80);
    lit += vec3(0.52, 0.70, 0.92) * front * 0.16 * (0.2 + 0.8 * shade);
    lit += vec3(0.86, 0.93, 1.0) * wall * latFade * uHighstorm * 0.24 * (0.25 + 0.75 * shade);
    // Stormlight in the wall, flickering where the turbulence peaks.
    float flash = smoothstep(0.80, 0.97, turb) * band * latFade;
    lit += vec3(0.68, 0.86, 1.0) * flash * uHighstorm * 0.30;
  }

  // ---- tidally locked worlds ------------------------------------------
  if (uTidal > 0.001) {
    // Taldain and Canticle: the story is the terminator, so make it burn.
    float band = 1.0 - abs(geoNdl);
    lit += vec3(1.0, 0.55, 0.18) * pow(max(0.0, band), 8.0) * uTidal * 0.5;
  }

  // ---- ring shadow ----------------------------------------------------
  if (uRingShadow > 0.001) {
    // Project the surface point along the sun direction onto the ring plane.
    vec3 axis = normalize(uRingAxis);
    float denom = dot(toSun, axis);
    if (abs(denom) > 0.001) {
      vec3 local = vWorld - (uSunPos - uSunPos); // world-local: mesh sits at origin of its own frame
      float t = -dot(vObj, axis) / denom;
      if (t > 0.0) {
        vec3 hit = vObj + toSun * t;
        float r = length(hit - axis * dot(hit, axis));
        float inRing = step(uRingInner, r) * step(r, uRingOuter);
        float dens = inRing * (0.55 + 0.45 * sin(r * 60.0));
        lit *= 1.0 - dens * uRingShadow * shade;
      }
    }
  }

  // ---- limb -----------------------------------------------------------
  fres = pow(1.0 - max(0.0, dot(n, view)), 3.2);
  // Only the lit limb glows: a rim light on the night side is a giveaway.
  lit += uAtmosphere * fres * (0.18 + 0.82 * shade) * 0.22;

  // ---- Shadesmar ------------------------------------------------------
  if (uCognitive > 0.001) {
    // No sun over there — a small cold light that never moves, and a realm
    // that reads by its own glow. Land is a bead ocean; sea is black glass.
    vec3 cold = normalize(vec3(0.42, 0.78, 0.46));
    float key = max(0.0, dot(nSurf, cold)) * 0.58 + 0.34;
    vec3 flat_ = albedo * key;

    // Beads: obsidian spheres, a few of them catching the light at a time.
    float beadField = fbm3(vObj * 150.0 + uSeed, 3, 2.07, 0.5) * 0.5 + 0.5;
    float bead = smoothstep(0.58, 0.92, beadField) * (1.0 - water);
    flat_ += vec3(0.44, 0.33, 0.78) * bead * 0.30;
    flat_ *= 1.0 - (1.0 - water) * 0.18;

    // Glass plains. Clamped hard: an unbounded highlight here put a blown
    // white crater in the middle of every world in the Realm.
    float glass = min(specGGX(nSurf, view, cold, 0.30), 2.0) * water;
    flat_ += vec3(0.42, 0.52, 0.82) * glass * 0.16;

    // Souls: the lights of everything that thinks, seen through the surface.
    float souls = smoothstep(0.80, 0.99, fbm3(vObj * 26.0 + uSeed * 3.0, 3, 2.05, 0.5) * 0.5 + 0.5);
    flat_ += vec3(0.82, 0.74, 1.0) * souls * (1.0 - water) * 0.30
      * (0.7 + 0.3 * sin(uTime * 1.6 + hash13(vObj * 12.0) * 30.0));

    flat_ += vec3(0.30, 0.22, 0.58) * fres * 0.55;
    lit = mix(lit, flat_, uCognitive);
  }

  lit += uEmissiveColor * uEmissive * (fres * 2.2 + 0.10) * shade;
  gl_FragColor = vec4(max(lit, 0.0), 1.0);
}
