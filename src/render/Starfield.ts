import * as THREE from 'three';
import starVert from '../shaders/star.vert';
import starFrag from '../shaders/star.frag';
import skyVert from '../shaders/sky.vert';
import skyFrag from '../shaders/sky.frag';

const COUNT = 24000;
/** Stars cluster toward the galactic plane, so the band has grain in it. */
const BAND_POLE = new THREE.Vector3(0.34, 0.86, -0.38).normalize();

/** Planck locus, sampled. Real stars are mostly dim and orange. */
const CLASSES: { tint: [number, number, number]; weight: number; lum: number }[] = [
  { tint: [0.62, 0.74, 1.00], weight: 0.04, lum: 1.35 }, // O / B
  { tint: [0.80, 0.87, 1.00], weight: 0.10, lum: 1.15 }, // A
  { tint: [1.00, 0.99, 0.96], weight: 0.16, lum: 1.00 }, // F
  { tint: [1.00, 0.96, 0.84], weight: 0.22, lum: 0.92 }, // G
  { tint: [1.00, 0.86, 0.66], weight: 0.26, lum: 0.78 }, // K
  { tint: [1.00, 0.72, 0.54], weight: 0.22, lum: 0.62 }, // M
];

function pickClass(r: number): { tint: [number, number, number]; lum: number } {
  let acc = 0;
  for (const c of CLASSES) {
    acc += c.weight;
    if (r <= acc) return c;
  }
  return CLASSES[CLASSES.length - 1]!;
}

export class Starfield {
  readonly points: THREE.Points;
  readonly sky: THREE.Mesh;
  private readonly material: THREE.ShaderMaterial;
  private readonly skyMaterial: THREE.ShaderMaterial;

  constructor() {
    const pos = new Float32Array(COUNT * 3);
    const color = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const bright = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);

    const v = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
      const r = 900 + Math.random() * 400;
      // Half uniform on the sphere, half pulled into the galactic band so the
      // Milky Way has individual stars in it and not just a painted glow.
      let theta = Math.random() * Math.PI * 2;
      let phi = Math.acos(2 * Math.random() - 1);
      v.set(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      if (i % 2 === 0) {
        const lat = (Math.random() + Math.random() + Math.random() - 1.5) * 0.22;
        const lon = Math.random() * Math.PI * 2;
        const a = new THREE.Vector3(0, 1, 0).cross(BAND_POLE).normalize();
        const b = BAND_POLE.clone().cross(a).normalize();
        v.copy(a).multiplyScalar(Math.cos(lon) * Math.cos(lat))
          .addScaledVector(b, Math.sin(lon) * Math.cos(lat))
          .addScaledVector(BAND_POLE, Math.sin(lat))
          .normalize();
      }
      pos[i * 3] = v.x * r;
      pos[i * 3 + 1] = v.y * r;
      pos[i * 3 + 2] = v.z * r;

      const cls = pickClass(Math.random());
      color[i * 3] = cls.tint[0];
      color[i * 3 + 1] = cls.tint[1];
      color[i * 3 + 2] = cls.tint[2];
      // Power law: a handful of bright anchors, a haze of faint ones.
      const u = Math.random();
      size[i] = 0.35 + Math.pow(u, 3.2) * 5.6;
      bright[i] = (0.16 + Math.pow(Math.random(), 2.1) * 1.05) * cls.lum;
      seed[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSizeScale: { value: 400 },
        uStarSize: { value: 1 },
        uExposure: { value: 1 },
      },
      vertexShader: starVert,
      fragmentShader: starFrag,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = -900;

    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uBandTint: { value: new THREE.Color(0xbfd3ff) },
        uDustTint: { value: new THREE.Color(0x3a2a4a) },
        uGlowTint: { value: new THREE.Color(0xffd9a8) },
        uCognitive: { value: 0 },
      },
      vertexShader: skyVert,
      fragmentShader: skyFrag,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), this.skyMaterial);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1000;
  }

  update(
    time: number, height: number, fov: number, starSize: number, exposure: number,
    cognitive = 0,
  ): void {
    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uSizeScale.value = (height * 0.5) / Math.tan((fov * Math.PI) / 360);
    u.uStarSize.value = starSize;
    u.uExposure.value = exposure;
    const s = this.skyMaterial.uniforms;
    s.uTime.value = time;
    s.uIntensity.value = exposure;
    s.uCognitive.value = cognitive;
  }
}
