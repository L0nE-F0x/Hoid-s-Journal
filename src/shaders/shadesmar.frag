/**
 * One system's bead ocean, seen from above.
 *
 * Shadesmar's geography is inverted: land over there is a sea of obsidian
 * beads, ocean is solid black glass. So each system is an island of beads
 * ringed by glass, and the dark between systems is genuinely dark — not a
 * floor. An earlier version drew one enormous plane under the whole Cosmere
 * and it cost more than every planet, nebula and post pass together, for a
 * surface nobody was looking at.
 */

uniform float uTime;
uniform vec3  uGlass;
uniform vec3  uBead;
uniform vec3  uTint;
uniform float uRadius;
uniform float uOpacity;
/** (viewport height / 2) / tan(fov / 2): pixels per world unit at unit depth. */
uniform float uPxScale;
/** r: swell. g: crazing. b: bead spheres. a: per-bead brightness. Tiles. */
uniform sampler2D uGlassPlate;

varying vec3 vWorld;
varying vec2 vLocal;

void main() {
  // The disc geometry is unit-radius and scaled by the model matrix, so the
  // local position is 0..1 across it. Everything below wants world units.
  float r = length(vLocal);
  if (r > 1.0) discard;
  vec2 p = vLocal * uRadius;

  vec3 view = cameraPosition - vWorld;
  float dist = max(length(view), 0.001);
  vec3 rd = view / dist;
  float graze = clamp(abs(rd.y), 0.0, 1.0);
  float sheen = pow(1.0 - graze, 5.0);


  // The swell drifts; the crazing does not.
  float swell = texture2D(uGlassPlate, p * 0.19 + vec2(uTime * 0.004, 0.0)).r;
  float facet = smoothstep(0.82, 0.99, texture2D(uGlassPlate, p * 0.62).g);

  // Beads in the middle, glass at the rim, haze past that.
  float bead = smoothstep(0.86, 0.42, r);
  float edge = smoothstep(1.0, 0.42, r);

  // Black glass, and it is black. An earlier pass lit this like a lavender
  // slab and every landmark standing on it disappeared into the glare.
  //
  // The base is flat on purpose. This surface is dark enough that the tone
  // curve's toe turns a quarter-stop of noise across it into a field of soft
  // ovals; the swell belongs on the highlights, where it is already faint.
  vec3 col = uGlass;
  col += vec3(0.16, 0.13, 0.30) * facet * (0.20 + 0.80 * graze) * 0.22;
  col += vec3(0.14, 0.12, 0.28) * sheen * (0.55 + 0.55 * swell);

  if (bead > 0.002) {
    // Obsidian spheres, packed in staggered rows. Cell size is fixed in world
    // units and the pattern fades out once a cell is smaller than a pixel —
    // without that it turns into a moiré of polka dots at Cosmere distance.
    vec2 cell = p * 2.4;
    cell.x += 0.5 * mod(floor(cell.y), 2.0);
    float px = max(fwidth(cell.x), fwidth(cell.y));
    float detail = smoothstep(0.85, 0.30, px);
    vec2 f = fract(cell) - 0.5;
    float sphere = (1.0 - smoothstep(0.24, 0.46, length(f))) * detail;
    float lit = fract(sin(dot(floor(cell), vec2(127.1, 311.7))) * 43758.5453);
    float roll = (0.5 + 0.5 * sin(uTime * 0.5 + lit * 30.0)) * (0.55 + 0.75 * swell);
    vec3 beads = uBead * (0.34 + 0.46 * lit);
    beads += vec3(0.58, 0.48, 0.94) * sphere * (0.14 + 0.55 * lit * roll);
    col = mix(col, beads, bead * 0.92);
  }

  // The system's own light lying on the surface.
  col += uTint * (0.06 + 0.50 * sheen) * smoothstep(1.0, 0.15, r) * 0.32;

  // Coverage, not brightness. Deriving alpha from the colour let the swell
  // modulate opacity, and a twenty-percent alpha ripple on a dark overlay
  // reads as a field of soft ovals lying across the disc.
  float a = uOpacity * edge * (0.52 + 0.34 * bead);
  if (a < 0.006) discard;
  gl_FragColor = vec4(col, a);
}
