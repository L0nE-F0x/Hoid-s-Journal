import * as THREE from 'three';
import { COSMERE, bodyById, onTheMap, perpAt } from '../data/index.ts';
import { uvOnBody } from '../layout/surface.ts';
import type { Orrery } from './Orrery.ts';
import sunVert from '../shaders/sun.vert';
import pinFrag from '../shaders/pin.frag';

const _off = new THREE.Vector3();
const _n = new THREE.Vector3();
const _view = new THREE.Vector3();
const _quad = new THREE.PlaneGeometry(2, 2);

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** A perpendicularity: a bright ring, because it is a door, not a place. */
function perpTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 96;
  const ctx = c.getContext('2d')!;
  ctx.strokeStyle = 'rgba(196,181,253,0.95)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(48, 48, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(48, 48, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(233,213,255,0.95)';
  ctx.beginPath();
  ctx.arc(48, 48, 7, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function labelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '600 34px Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#eaf4ff';
  ctx.fillText(text, 256, 48);
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function pinMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: 0.2 },
      uColor: { value: new THREE.Color(color) },
      uFacing: { value: 1 },
      uOpacity: { value: 1 },
      uHot: { value: 0 },
    },
    vertexShader: sunVert,
    fragmentShader: pinFrag,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
}

/**
 * Location markers on the focused globe. They are the same rows the atlas
 * panel draws, so a pin on the map and a pin on the world are one place.
 *
 * They used to be camera-facing discs of solid colour — confetti stuck on
 * the planet, full-bright at the limb, and a few centimetres of radius
 * enough to peek around the far side. They are beads now: a lit hemisphere
 * on a billboard, faded by the planet's own n·v so the globe occludes them
 * and they never stick out into space.
 */
export class Pins {
  readonly group = new THREE.Group();
  private readonly markers: THREE.Mesh[] = [];

  private readonly label: THREE.Sprite;
  private labelId: string | null = null;
  private readonly perps: { at: string; sprite: THREE.Sprite }[] = [];

  constructor() {
    for (const loc of COSMERE.locations) {
      const mesh = new THREE.Mesh(_quad, pinMaterial(loc.color));
      mesh.userData = { kind: 'location', id: loc.id, body: loc.body };
      mesh.renderOrder = 2;
      this.group.add(mesh);
      this.markers.push(mesh);
    }

    const perpMap = perpTexture();
    for (const p of COSMERE.perps) {
      if (!p.at) continue;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: perpMap, transparent: true, opacity: 0.95,
        depthTest: true, depthWrite: false,
      }));
      sprite.visible = false;
      sprite.renderOrder = 2;
      this.group.add(sprite);
      this.perps.push({ at: p.at, sprite });
    }

    this.label = new THREE.Sprite(new THREE.SpriteMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }));
    this.label.visible = false;
    this.group.add(this.label);
  }

  /** Where a marker ended up this frame. Used by the interaction test. */
  markerPosition(id: string): THREE.Vector3 | undefined {
    const mesh = this.markers.find((m) => m.userData.id === id);
    return mesh?.visible ? mesh.position : undefined;
  }

  update(
    orrery: Orrery,
    camera: THREE.Camera,
    progress: Record<string, number>,
    focusedBody: string | null,
    scale: string,
    hot: string | null,
    realm = 'physical',
    showPerps = true,
    era = 3,
  ): void {
    const show = scale === 'globe' || scale === 'surface' || scale === 'city';
    this.group.visible = show;
    if (!show) return;

    let hotPos: THREE.Vector3 | null = null;
    let hotName: string | null = null;
    for (const p of this.perps) p.sprite.visible = false;

    for (const mesh of this.markers) {
      const loc = COSMERE.locations.find((l) => l.id === mesh.userData.id);
      if (!loc) { mesh.visible = false; continue; }
      const body = bodyById[loc.body];
      const origin = orrery.bodyPosition(loc.body);
      const door = perpAt(loc.id);
      const side = realm === 'cognitive'
        ? loc.realm === 'cognitive' || (!!door && onTheMap(door, progress, era))
        : loc.realm !== 'cognitive';
      const vis = !!body && !!origin && onTheMap(loc, progress, era) && side &&
        (!focusedBody || focusedBody === loc.body);
      if (!vis || !body || !origin) { mesh.visible = false; continue; }

      uvOnBody(loc.u, loc.v, body.radius * 1.015, orrery.bodySpin(loc.body), _off);
      mesh.position.copy(origin).add(_off);

      // Planet-space facing, not billboard facing. A pin on the far side
      // has n·v < 0; one on the limb is near 0 and would stick out of the
      // silhouette if we drew it at full size.
      _n.copy(_off).normalize();
      _view.copy(camera.position).sub(mesh.position).normalize();
      const facing = _n.dot(_view);
      if (facing < 0.04) { mesh.visible = false; continue; }
      mesh.visible = true;

      const fade = smoothstep(0.04, 0.38, facing);
      const d = camera.position.distanceTo(mesh.position);
      const isHot = loc.id === hot;
      const size = Math.min(
        Math.min(1.2, Math.max(0.03, d * 0.017)),
        body.radius * 0.055,
      );
      const dim = scale === 'city' && !!hot && loc.id !== hot;
      const mat = mesh.material as THREE.ShaderMaterial;
      mat.uniforms.uSize.value = size * (isHot ? 1.7 : 1) * (0.78 + 0.22 * fade);
      mat.uniforms.uFacing.value = fade;
      mat.uniforms.uOpacity.value = dim ? 0.28 : 1;
      mat.uniforms.uHot.value = isHot ? 1 : 0;
      if (isHot) {
        hotPos = mesh.position;
        hotName = loc.name;
      }
      const perp = this.perps.find((p) => p.at === loc.id);
      const perpRow = door;
      if (perp && showPerps && perpRow && onTheMap(perpRow, progress, era)) {
        perp.sprite.visible = true;
        perp.sprite.position.copy(mesh.position);
        perp.sprite.scale.setScalar(size * 3.4 * (0.78 + 0.22 * fade));
        (perp.sprite.material as THREE.SpriteMaterial).opacity = 0.95 * fade;
      }
    }

    if (hotName && hotPos) {
      if (this.labelId !== hot) {
        this.labelId = hot;
        const mat = this.label.material as THREE.SpriteMaterial;
        mat.map?.dispose();
        mat.map = labelTexture(hotName);
        mat.needsUpdate = true;
      }
      const d = camera.position.distanceTo(hotPos);
      const s = Math.max(0.2, Math.min(14, d * 0.26));
      this.label.scale.set(s, s * 0.19, 1);
      this.label.position.copy(hotPos);
      this.label.position.y += s * 0.13 + d * 0.012;
      this.label.visible = true;
    } else {
      this.label.visible = false;
    }
  }
}
