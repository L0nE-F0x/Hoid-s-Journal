#include "./lib/noise.glsl"

/**
 * One recipe → one equirectangular plate. Run twice per world: uMode 0 writes
 * the albedo, uMode 1 writes (elevation, water, lights, roughness). Doing this
 * on the GPU is what buys 2048×1024 with ten octaves and no boot stall.
 *
 * The coast is cut on a smooth continental field and nothing else. Mountains
 * are added *after* that decision, faded in from the shore — put the ridged
 * noise in before the threshold and every coastline turns to gravel.
 */

uniform int   uMode;
uniform float uSeed;
uniform vec3  uLand;
uniform vec3  uLand2;
uniform vec3  uLand3;
uniform vec3  uOcean;
uniform vec3  uOceanDeep;
uniform vec3  uCap;
uniform vec3  uLightColor;
uniform float uThreshold;
uniform float uWarp;
uniform float uRidges;
uniform float uRivers;
uniform float uIce;
uniform float uLights;
uniform float uFlora;
uniform int   uBands;
uniform int   uSplit;
uniform int   uHion;
uniform int   uTerminator;
uniform int   uFain;
uniform int   uCognitive;
uniform int   uBlobCount;
uniform vec4  uBlobs[14];
uniform float uBlobW[14];
uniform int   uWedgeCount;
uniform vec3  uWedges[12];

varying vec2 vUv;

const float PI = 3.14159265359;

vec3 sphereAt(vec2 uv) {
  float lat = (uv.y - 0.5) * PI;
  float lon = uv.x * PI * 2.0;
  float cl = cos(lat);
  return vec3(cos(lon) * cl, sin(lat), sin(lon) * cl);
}

float shapeAt(vec2 uv) {
  float m = 0.0;
  for (int i = 0; i < 14; i++) {
    if (i >= uBlobCount) break;
    vec4 b = uBlobs[i];
    float du = abs(uv.x - b.x);
    du = min(du, 1.0 - du);
    float dv = (uv.y - b.y) / b.w;
    float d = (du / b.z) * (du / b.z) + dv * dv;
    m += uBlobW[i] * exp(-pow(d, 1.8) * 0.50);
  }
  return m;
}

/**
 * Smooth continental field. The coast is a level set of this and only this.
 *
 * The blobs carry the geography and must dominate, or the coastline breaks
 * into speckle and a supercontinent reads as an archipelago. The noise is
 * two bands: broad bays, then a light hand on the shoreline itself.
 */
float continent(vec2 uv, vec3 p) {
  vec3 q = p * uWarp + vec3(uSeed * 1.7);
  if (uBlobCount > 0) {
    float bays = warped(q * 0.50, 3, 0.42);
    float shore = fbm3(q * 1.8, 3, 2.05, 0.5);
    return clamp(min(1.32, shapeAt(uv)) * 0.80 + bays * 0.19 + shore * 0.075, 0.0, 1.4);
  }
  float n = warped(q * 1.25, 4, 0.5) * 0.5 + 0.5;
  return clamp(n, 0.0, 1.0);
}

/** Gas-giant zonal jets, sheared by their own turbulence. */
float jets(vec2 uv, vec3 p) {
  float shear = fbm3(vec3(p.x * 1.4, p.y * 7.0, p.z * 1.4) + uSeed, 5, 2.1, 0.55);
  float band = 0.5 + 0.5 * sin(uv.y * 26.0 + shear * 4.6 + uSeed);
  float fine = 0.5 + 0.5 * sin(uv.y * 72.0 + shear * 8.0);
  float storm = smoothstep(0.74, 0.99, fbm3(p * 4.2 + uSeed * 3.0, 4, 2.1, 0.5) * 0.5 + 0.5);
  return clamp(band * 0.70 + fine * 0.16 + storm * 0.42, 0.0, 1.0);
}

/** Dendritic valleys. Cheap: one ridged field, inverted and thresholded. */
float riverMask(vec3 p) {
  if (uRivers < 0.001) return 0.0;
  float r = ridged(p * 8.0 + uSeed * 5.0, 4, 2.1, 0.55);
  return smoothstep(0.90, 0.998, r) * uRivers;
}

void main() {
  vec2 uv = vUv;
  vec3 p = sphereAt(uv);
  float thr = uBlobCount > 0 ? 0.50 : uThreshold;

  float c = uBands == 1 ? jets(uv, p) : continent(uv, p);
  float coast = uBands == 1 ? 0.10 : 0.008;
  float water = uBands == 1 ? 0.0 : 1.0 - smoothstep(thr - coast, thr + coast, c);
  float land = 1.0 - water;

  // Height above sea level, 0 at the shore. Ridges ride on top of it and fade
  // out over the first stretch of coastal plain.
  // Elevation is its own field, not a rescaling of the coastline mask. Derive
  // it from the mask and the interior is one flat slab: the mask saturates a
  // little way inland and has nothing left to say about terrain.
  vec3 q = p * uWarp + vec3(uSeed * 1.7);
  float inland = smoothstep(0.0, 0.11, c - thr);
  float rolling = fbm3(q * 0.95 + 41.0, 5, 2.05, 0.5) * 0.5 + 0.5;
  // Ranges want to be continental, not a craquelure. Low frequency, cubed so
  // the field is mostly plain with a few spines standing out of it.
  float chain = ridged(q * 0.72 + 13.0, 4, 2.07, 0.52);
  float spur = ridged(q * 2.10 + 29.0, 3, 2.10, 0.50);
  float ranges = pow(chain, 6.0) + pow(spur, 7.0) * 0.35;
  float up = inland * (0.05 + rolling * 0.24 + ranges * uRidges * 3.4);
  up = clamp(up, 0.0, 1.2);
  // Sea floor: ridges and abyssal plains, so an ocean is not one flat colour.
  float floorH = fbm3(q * 1.6 + 77.0, 4, 2.05, 0.5) * 0.5 + 0.5;

  float river = riverMask(p) * land * smoothstep(0.02, 0.16, up);
  float polar = abs(uv.y - 0.5) * 2.0;
  // Caps: near the poles, and on anything high enough anywhere.
  float capMask = 0.0;
  if (uIce > 0.001) {
    float edge = 0.955 - uIce * 0.13;
    float wobble = (warped(p * 3.6 + uSeed, 3, 0.5)) * 0.055;
    capMask = smoothstep(edge, edge + 0.05, polar + wobble);
    float snow = smoothstep(0.58, 0.88, up) * land * smoothstep(0.18, 0.62, polar) * uIce * 0.85;
    capMask = clamp(max(capMask, snow), 0.0, 1.0);
  }

  if (uMode == 1) {
    // Elevation shaped so land relief reads far stronger than the sea floor.
    float h = land > 0.5
      ? 0.5 + clamp(up, 0.0, 1.0) * 0.5
      : 0.5 - clamp((thr - c) * 1.2, 0.0, 1.0) * 0.35 - (1.0 - floorH) * 0.10;
    h = clamp(h - river * 0.10, 0.0, 1.0);
    // Population proxy: lowland, near a coast, off the ice.
    float low = smoothstep(0.01, 0.09, up) * smoothstep(0.46, 0.14, up);
    float lights = uLights * land * low * (1.0 - capMask);
    float rough = mix(0.06, 0.90, land) * (1.0 - capMask * 0.45);
    gl_FragColor = vec4(h, water, clamp(lights, 0.0, 1.0), rough);
    return;
  }

  vec3 col;

  if (uBands == 1) {
    vec3 a = mix(uOcean, uLand, smoothstep(0.10, 0.58, c));
    col = mix(a, uLand3, smoothstep(0.58, 0.95, c));
    col = mix(col, uLand2, smoothstep(0.08, 0.34, 1.0 - c) * 0.55);
  } else if (uSplit == 1) {
    // Taldain: one hemisphere is white sand, the other has never seen the sun.
    float day = smoothstep(0.40, 0.60, 1.0 - abs(fract(uv.x + 0.25) - 0.5) * 2.0);
    vec3 dayCol = mix(uLand, uLand3, smoothstep(0.05, 0.60, up));
    vec3 nightCol = mix(uOcean, uOceanDeep, c * 0.7);
    col = mix(nightCol, dayCol, day);
  } else if (uTerminator == 1) {
    float heat = exp(-pow(fract(uv.x + 0.45) - 0.5, 2.0) * 40.0);
    vec3 molten = mix(uLand2, uLand3, smoothstep(0.05, 0.5, up));
    col = mix(uLand, molten, heat);
    col = mix(col, uOcean, smoothstep(0.5, 0.05, heat) * 0.6);
  } else if (uWedgeCount > 0) {
    // Lumar: twelve spore seas, one under each geostationary moon. The
    // boundaries are where two kinds of spore meet in the water, so they
    // wander and bleed — hard stripes turn the planet into a beach ball.
    float drift = warped(p * 1.5 + uSeed * 3.0, 4, 0.8) * 0.10;
    float w = (uv.x + drift) * float(uWedgeCount);
    int i0 = int(floor(mod(w, float(uWedgeCount))));
    int i1 = int(mod(float(i0 + 1), float(uWedgeCount)));
    vec3 sea = uWedges[0];
    vec3 seaN = uWedges[0];
    for (int k = 0; k < 12; k++) {
      if (k == i0) sea = uWedges[k];
      if (k == i1) seaN = uWedges[k];
    }
    // A wide blend, so each sea is strongest under its own lunagree and
    // gives way over the third of the arc between them.
    sea = mix(sea, seaN, smoothstep(0.34, 1.0, fract(w)));
    // Spore texture: the sea is not liquid, it is a dust of living crystal.
    float grain = fbm3(p * 22.0 + uSeed, 4, 2.1, 0.5) * 0.5 + 0.5;
    float swirl = warped(p * 6.0 + uSeed * 2.0, 4, 0.9) * 0.5 + 0.5;
    sea *= 0.70 + 0.38 * grain + 0.22 * swirl;
    vec3 rock = mix(uLand, uLand3, smoothstep(0.05, 0.5, up));
    col = mix(sea, rock, land);
  } else {
    // Bathymetry: shelf, slope, abyss.
    float deep = clamp((thr - c) * 2.0, 0.0, 1.0) * (0.55 + 0.75 * (1.0 - floorH));
    vec3 sea = mix(uOcean, uOceanDeep, clamp(deep, 0.0, 1.0));
    sea = mix(mix(uOcean, uLand, 0.34), sea, smoothstep(0.0, 0.06, thr - c));
    // Hypsometric ramp: plain → upland → peak, with the plain getting room.
    vec3 ground = mix(uLand, uLand2, smoothstep(0.02, 0.30, up));
    ground = mix(ground, uLand3, smoothstep(0.52, 0.95, up));
    // Broad climate bands, so a continent is not one tone end to end.
    float dry = warped(q * 0.42 + 91.0, 3, 0.5) * 0.5 + 0.5;
    ground *= 0.84 + 0.30 * dry;
    if (uFlora > 0.001) {
      float veg = warped(p * 4.2 + uSeed * 2.0, 4, 0.7) * 0.5 + 0.5;
      float wet = smoothstep(0.92, 0.20, polar) * smoothstep(0.70, 0.10, up);
      ground = mix(ground, ground * vec3(0.62, 1.26, 0.68), smoothstep(0.24, 0.74, veg) * uFlora * wet);
    }
    // Sediment: a paler wash where the land has been worn flat.
    ground = mix(ground, ground * vec3(1.14, 1.07, 0.93), smoothstep(0.12, 0.0, up) * 0.7);
    ground = mix(ground, mix(uOcean, uLand, 0.55), river * 0.85);
    col = mix(sea, ground, land);
  }

  if (uFain == 1) {
    // Fain life: the pale green crust that is not quite plant.
    float f = warped(p * 5.0 + uSeed * 4.0, 4, 0.8) * 0.5 + 0.5;
    col = mix(col, vec3(0.53, 0.94, 0.65), smoothstep(0.50, 0.82, f) * land * 0.6);
  }
  if (uHion == 1) {
    // Hion lines: a lattice of magenta and cyan strung across the dark.
    vec3 g = abs(fract(p * 6.0 + uSeed) - 0.5);
    float line = smoothstep(0.030, 0.0, min(g.x, g.z));
    vec3 tint = uv.x < 0.5 ? vec3(0.13, 0.83, 0.93) : vec3(0.91, 0.47, 0.98);
    col = mix(col, tint, line * 0.9);
  }

  if (capMask > 0.001) {
    float crack = smoothstep(0.88, 0.99, ridged(p * 18.0 + uSeed, 3, 2.1, 0.5));
    col = mix(col, mix(uCap, uCap * 0.74, crack), capMask);
  }

  if (uCognitive == 1) {
    // Shadesmar reads the same landmass the other way: land is a bead ocean
    // of obsidian spheres, sea is a plain of black glass.
    float t = clamp(abs(c - thr) * 2.4, 0.0, 1.0);
    float bead = hash13(floor(p * 300.0));
    // Obsidian, not lavender. These are linear values written into an sRGB
    // plate, so they display about twice as bright as they read here.
    vec3 beads = mix(vec3(0.008, 0.006, 0.020), vec3(0.048, 0.028, 0.098), t);
    beads = mix(beads, vec3(0.34, 0.26, 0.62), step(0.964, bead) * 0.9);
    vec3 glass = mix(vec3(0.085, 0.105, 0.155), vec3(0.026, 0.034, 0.062), t);
    float sheen = smoothstep(0.58, 0.92, fbm3(p * 11.0 + uSeed, 4, 2.05, 0.5) * 0.5 + 0.5);
    glass = mix(glass, vec3(0.20, 0.27, 0.44), sheen * 0.5);
    // Veins of light in the glass where the land above it meets the sea.
    float seam = smoothstep(0.055, 0.0, abs(c - thr));
    glass = mix(glass, vec3(0.30, 0.36, 0.66), seam * 0.55);
    col = mix(glass, beads, land);
  }

  gl_FragColor = vec4(col, 1.0);
}
