#include "./noise.glsl"

/**
 * The deep sky the Cosmere hangs in: a galactic band with dust lanes, a few
 * broad emission regions, and enough faint structure that the black between
 * the systems stops looking like a cleared buffer.
 *
 * Thirty-odd noise evaluations per pixel. Called once per texel by the baker
 * in `render/skyBake.ts`, never per frame — marching this full-screen was
 * costing more than every planet, atmosphere and post pass combined.
 */
vec3 skyField(vec3 d, vec3 bandTint, vec3 dustTint, vec3 glowTint, float cognitive) {
  // Galactic plane, tilted so it does not sit along the orrery's own ecliptic.
  vec3 pole = normalize(vec3(0.34, 0.86, -0.38));
  float lat = dot(d, pole);
  float band = exp(-lat * lat * 26.0);
  float wide = exp(-lat * lat * 5.0);

  // Structure along the band: a bulge in one direction, arms elsewhere.
  vec3 centre = normalize(vec3(-0.82, 0.16, 0.55));
  float toCore = max(0.0, dot(d, centre));
  float bulge = pow(toCore, 5.0);

  float f = warped(d * 3.1, 5, 0.9) * 0.5 + 0.5;
  float fine = fbm3(d * 11.0, 5, 2.07, 0.5) * 0.5 + 0.5;
  float lanes = ridged(d * 5.4 + 3.0, 4, 2.1, 0.55);

  float stars = band * (0.55 + 0.75 * f) * (0.35 + 0.9 * bulge);
  // Dust lanes cut the band rather than adding to it.
  float dust = smoothstep(0.55, 0.95, lanes) * band;

  vec3 col = bandTint * stars * 0.115;
  col += bandTint * wide * fine * 0.016;
  col += glowTint * bulge * band * 0.10;
  col = mix(col, col * dustTint * 0.28, dust * 0.85);

  // Two broad emission regions away from the band, so the sky is not a
  // single stripe on black.
  vec3 e1 = normalize(vec3(0.72, -0.42, 0.55));
  vec3 e2 = normalize(vec3(-0.28, 0.62, 0.73));
  float n1 = pow(max(0.0, dot(d, e1)), 9.0) * (fbm3(d * 4.2 + 21.0, 4, 2.05, 0.5) * 0.5 + 0.5);
  float n2 = pow(max(0.0, dot(d, e2)), 12.0) * (fbm3(d * 5.6 + 44.0, 4, 2.05, 0.5) * 0.5 + 0.5);
  col += vec3(0.30, 0.12, 0.42) * n1 * 0.13;
  col += vec3(0.08, 0.26, 0.40) * n2 * 0.12;

  // A low floor so the frame never reads as pure black.
  col += vec3(0.0035, 0.0048, 0.0105) * (0.7 + 0.5 * fine);

  if (cognitive > 0.001) {
    // Shadesmar's sky, as the books have it: pitch black, no moon, no stars,
    // and on the horizon a small, frail white sun that never moves. Long,
    // straight, flat clouds run directly toward it, so it sits at the end of
    // a tunnel. (Coppermind, "Rosharan subastral": Oathbringer, Rhythm of War.)
    //
    // This used to be a flat violet wash at about 0.026 linear, which put the
    // Cognitive sky brighter than the Physical one's floor by seven times: the
    // Realm read as lavender fog, not as somewhere black.
    vec3 sunDir = normalize(vec3(0.62, 0.05, -0.78));
    float toSun = dot(d, sunDir);
    float theta = acos(clamp(toSun, -1.0, 1.0));
    // Angle around the sun, so streaks are great circles that meet in it.
    vec3 ax = normalize(cross(sunDir, vec3(0.0, 1.0, 0.0)));
    vec3 ay = cross(ax, sunDir);
    float psi = atan(dot(d, ay), dot(d, ax));
    // Flat clouds lie near the horizon plane, not across the whole dome.
    float horizon = exp(-pow(d.y / 0.30, 2.0));
    // Thin lanes in psi (many, narrow) broken into lengths along theta.
    float lanes = fbm3(vec3(cos(psi) * 22.0, sin(psi) * 22.0, 3.0), 3, 2.1, 0.5) * 0.5 + 0.5;
    float lengthwise = fbm3(vec3(theta * 1.6, psi * 3.0, 11.0), 3, 2.0, 0.5) * 0.5 + 0.5;
    float clouds = smoothstep(0.56, 0.80, lanes) * smoothstep(0.38, 0.66, lengthwise);
    clouds *= horizon * smoothstep(0.04, 0.30, theta) * (1.0 - smoothstep(1.8, 2.8, theta));
    // Lit only by that sun, and dimly: it lights the land, not the sky. The
    // clouds are the one thing up there it catches.
    vec3 cog = vec3(0.0016, 0.0016, 0.0024);
    cog += vec3(0.075, 0.075, 0.092) * clouds * (0.30 + 0.70 * exp(-theta * 1.1));
    // The sun: small and frail. A hard disc and a tight glow; the plate is
    // eight-bit, so anything wider than that blooms into a lamp.
    float disc = smoothstep(0.99993, 0.99997, toSun);
    float glow = pow(max(toSun, 0.0), 2600.0) * 0.30 + pow(max(toSun, 0.0), 260.0) * 0.010;
    cog += vec3(0.96, 0.97, 1.0) * (disc + glow);
    col = mix(col, cog, cognitive);
  }

  return col;
}
