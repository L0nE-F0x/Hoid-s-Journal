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
uniform float uTidal;
uniform float uRingShadow;
/** World space, both: the ring's normal and the planet's own centre. */
uniform vec3  uRingAxis;
uniform vec3  uCentre;
uniform float uRingInner;
uniform float uRingOuter;
/** Multiplies the plate. Lets worlds share a bake and still look unalike. */
uniform vec3  uTint;

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
 * The nearest bead to `q` in a jittered lattice: squared distance, and the
 * bead's cell for a stable per-bead hash. Points sit near their cell
 * centres, so the beads pack like beads rather than scatter like gravel.
 */
float beadCell(vec3 q, out vec3 id) {
  vec3 i = floor(q);
  vec3 f = fract(q);
  float best = 8.0;
  id = i;
  for (int z = -1; z <= 1; z++)
  for (int y = -1; y <= 1; y++)
  for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 c = i + g;
    vec3 o = vec3(hash13(c), hash13(c + 17.31), hash13(c + 41.7)) * 0.5 + 0.25;
    vec3 r = g + o - f;
    float d = dot(r, r);
    if (d < best) { best = d; id = c; }
  }
  return best;
}

/**
 * Cloud density over the sphere. Two advecting layers, ridged for filaments.
 *
 * Seven noise evaluations, not twenty: this runs twice per pixel (once for the
 * deck, once for the shadow it throws) over a globe that fills the frame, and
 * a domain warp in here cost more than the whole atmosphere pass.
 */
float cloudField(vec3 p, float t, float cover) {
  vec3 q = p * 2.4 + vec3(uSeed);
  vec3 flow = q + vec3(t * 0.05, 0.0, t * 0.01);
  float a = fbm3(flow, 4, 2.05, 0.5);
  float b = ridged(flow * 2.1 + 7.0, 3, 2.1, 0.55);
  float band = 0.55 + 0.45 * sin(p.y * 5.0 + a * 3.4);
  float d = ((a * 0.5 + 0.5) * 0.62 + b * 0.5) * (0.55 + 0.6 * band);
  // `cover` moves where the field is cut, so a recipe's cloud number is the
  // fraction of sky that has weather in it. It used to scale opacity instead,
  // which drew a half-transparent veil over the entire world at every value:
  // no gaps, no weather systems, and no world visible underneath.
  float lo = mix(0.86, 0.20, clamp(cover, 0.0, 1.0));
  return smoothstep(lo, lo + 0.16, d);
}

void main() {
  vec3 n = normalize(vNormal);
  vec4 base = texture2D(uAlbedo, vUv);
  vec3 albedo = base.rgb * uTint;
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
    float d = cloudField(cp, uTime, uClouds);
    // Shadow: read the field again a step toward the sun and darken by it.
    vec3 sunObj = normalize(cp + toSun * 0.14);
    float sh = cloudField(sunObj, uTime, uClouds);
    lit *= 1.0 - sh * 0.42 * shade;

    float cover = d;
    float cl = max(0.0, dot(n, toSun)) * 0.78 + 0.22;
    // Silver lining: clouds forward-scatter hard at grazing sun angles.
    float ms = pow(max(0.0, dot(view, -toSun)), 6.0) * 0.6;
    vec3 cloudCol = uCloudTint * (cl + ms) * uSunColor;
    lit = mix(lit, cloudCol, cover * shade * 0.92);
    // Cloud tops still lit a moment after the ground is dark.
    lit += uCloudTint * cover * smoothstep(-0.28, 0.02, geoNdl) * (1.0 - shade) * 0.22;
  }

  // ---- ice caps -------------------------------------------------------
  // There are none here on purpose. Both bakers already put the cap on the
  // plate, in the recipe's own `cap` colour, cut at `0.955 - ice * 0.13` of
  // the way to the pole. This shader used to paint a *second* cap over the
  // top of it — hardcoded blue-white, cut on |sin(lat)| at 0.78 - ice * 0.22,
  // which for Sel is 44° of latitude against the plate's 87°. That is why the
  // globe and the atlas disagreed about how much ice a world had.
  //
  // The baked cap is lit like every other surface, which is also the right
  // answer: ice in shadow is dark.

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
    //
    // All of it in world space. This used to march `vObj` — object space,
    // which turns with the planet — along `toSun`, which does not, against a
    // hardcoded (0,1,0) axis when the ring mesh is tilted 0.16 radians off it.
    // The shadow therefore rode the planet's own rotation instead of staying
    // opposite the star, and sat at the wrong inclination while it did.
    vec3 axis = normalize(uRingAxis);
    vec3 local = vWorld - uCentre;
    float denom = dot(toSun, axis);
    if (abs(denom) > 0.001) {
      float t = -dot(local, axis) / denom;
      if (t > 0.0) {
        vec3 hit = local + toSun * t;
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
    // The subastral as the books describe it. Where the Physical Realm has
    // land there is an ocean of small, translucent, dark glass beads,
    // churning in waves and tides; where it has sea there is black obsidian.
    // The only light is a small white sun low on the horizon that never
    // moves, and the souls of the living show as small flames.
    //
    // The beads used to be fbm noise at a frequency far finer than a pixel,
    // so at globe distance they averaged to a violet tint and the world read
    // as a glass ball. They are cells now, sized to resolve (four or five
    // pixels at globe framing), and each one can catch the sun.
    vec3 cold = normalize(vec3(0.42, 0.78, 0.46));
    float land = 1.0 - water;
    float ndl = max(0.0, dot(nSurf, cold));

    // Obsidian: black, smooth, one hard cold highlight and fine crazing.
    float craze = smoothstep(0.86, 0.98, ridged(vObj * 34.0 + uSeed, 3, 2.1, 0.55));
    vec3 obsidian = vec3(0.010, 0.012, 0.020) + albedo * 0.10 + vec3(0.030, 0.034, 0.050) * craze * ndl;
    obsidian += vec3(0.80, 0.86, 1.0) * min(specGGX(nSurf, view, cold, 0.16), 8.0) * 0.045;

    // Beads. Swell and tide move the glints, not the beads.
    vec3 bq = vObj * 64.0 + uSeed * 3.1;
    vec3 bid;
    float bd = sqrt(beadCell(bq, bid));
    float bpx = length(fwidth(bq));
    float resolve = 1.0 - smoothstep(0.30, 0.85, bpx);
    float baa = max(fwidth(bd), 0.02);
    float body = 1.0 - smoothstep(0.40 - baa, 0.40 + baa, bd);
    float h = hash13(bid);
    vec3 glassBead = mix(vec3(0.010, 0.009, 0.020), vec3(0.040, 0.034, 0.078), h);
    // A few beads hold colour; they are the souls of objects, after all.
    glassBead = mix(glassBead, vec3(0.10, 0.07, 0.16), step(0.94, h));
    float swell = fbm3(vObj * 5.0 + vec3(uTime * 0.035, 0.0, uTime * 0.022), 3, 2.0, 0.5) * 0.5 + 0.5;
    // Where the sun's reflection falls, every other bead flashes: a glitter
    // path, the way light lies on a choppy sea.
    float path = min(specGGX(nSurf, view, cold, 0.55), 3.0) / 3.0;
    float chance = clamp(0.02 + path * 0.45 + swell * swell * 0.12, 0.0, 0.7);
    float phase = fract(hash13(bid + 3.1) + uTime * 0.11);
    float catching = step(1.0 - chance, phase);
    float core = 1.0 - smoothstep(0.0, 0.13 + baa, bd);
    vec3 beads = mix(vec3(0.004, 0.004, 0.009), glassBead * (0.55 + 0.45 * ndl), body);
    beads += glassBead * 1.6 * path * body;
    // Every bead carries a small highlight, so the sea has the fine regular
    // grain of beads rather than a scatter of stars; some flash brighter as
    // the swell rolls them. Kept under the bloom's reach: a sea of HDR glints
    // bloomed into a grey veil over the whole world.
    float spark = 0.10 + 0.22 * ndl + 0.30 * path;
    beads += vec3(0.80, 0.85, 1.0) * core * spark * (0.55 + 0.45 * h);
    beads += vec3(0.86, 0.90, 1.0) * core * catching * (0.40 + 0.40 * path);
    // Unresolved, a bead sea is its average: dark glass and a sparkle haze.
    vec3 beadAvg = vec3(0.020, 0.018, 0.038) * (0.55 + 0.45 * ndl) + vec3(0.86, 0.90, 1.0) * chance * 0.015;
    beads = mix(beadAvg, beads, resolve);

    // Flames where people are: the night-lights mask is where they live.
    float flame = step(0.86, hash13(bid + 9.7)) * smoothstep(0.12, 0.45, lights) * land;
    float flicker = 0.75 + 0.25 * sin(uTime * 7.3 + h * 40.0);
    beads += vec3(1.0, 0.72, 0.40) * flame * flicker * (core * 2.4 * resolve + 0.06);

    // Where beads wash against the glass.
    float shore = smoothstep(0.30, 0.50, water) * (1.0 - smoothstep(0.50, 0.70, water));
    vec3 shade_ = mix(obsidian, beads, land) + vec3(0.06, 0.06, 0.09) * shore * ndl;

    // A cold rim against a black sky; no violet glow.
    shade_ += vec3(0.07, 0.08, 0.12) * fres * (0.4 + 0.6 * ndl);
    lit = mix(lit, shade_, uCognitive);
  }

  lit += uEmissiveColor * uEmissive * (fres * 2.2 + 0.10) * shade;
  gl_FragColor = vec4(max(lit, 0.0), 1.0);
}
