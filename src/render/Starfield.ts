import * as THREE from 'three';
import starVert from '../shaders/star.vert';
import starFrag from '../shaders/star.frag';

const COUNT = 9000;

export class Starfield {
  readonly points: THREE.Points;
  private readonly material: THREE.ShaderMaterial;

  constructor() {
    const pos = new Float32Array(COUNT * 3);
    const color = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const bright = new Float32Array(COUNT);
    const seed = new Float32Array(COUNT);

    const tints = [
      [1, 1, 1],
      [0.82, 0.88, 1],
      [1, 0.94, 0.82],
      [0.9, 0.86, 1],
    ];

    for (let i = 0; i < COUNT; i++) {
      // Shell of distant stars — no parallax, a painted infinity.
      const r = 900 + Math.random() * 400;
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const t = tints[i % tints.length]!;
      color[i * 3] = t[0]!;
      color[i * 3 + 1] = t[1]!;
      color[i * 3 + 2] = t[2]!;
      size[i] = Math.random() * 2.4 + 0.6;
      bright[i] = Math.random() * 0.7 + 0.35;
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
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
  }

  update(time: number, height: number, fov: number, starSize: number, exposure: number): void {
    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uSizeScale.value = (height * 0.5) / Math.tan((fov * Math.PI) / 360);
    u.uStarSize.value = starSize;
    u.uExposure.value = exposure;
  }
}
