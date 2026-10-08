// DayPilot — 3D product film (30 s, 1920x1080, 30 fps)
// Everything is a pure function of time t, so any frame can be rendered on demand.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import * as UI from './ui.js';

const Q = new URLSearchParams(location.search);
const W = +Q.get('w') || 1920, H = +Q.get('h') || 1080;
const RENDER = Q.has('render');
const FPS = 30, DUR = 30, FOV = 32;
// every UI texture is painted at load, so fonts must be ready first
await Promise.all(['400', '450', '500', '550', '600', '650', '700'].flatMap(w => [`${w} 40px Inter`, `${w} 40px "Inter Display"`]).map(f => document.fonts.load(f)));

// ================================================================ math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inOut5: t => t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,
  out3: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  in3: t => t * t * t,
  in2: t => t * t,
  outBack: (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  // damped spring settling to 1 (t in seconds-ish units of the segment)
  spring: t => t <= 0 ? 0 : 1 - Math.exp(-7 * t) * Math.cos(11 * t),
};
const lin = x => Math.pow(clamp(x), 2.2);   // perceptual dim -> linear multiplier
const bell = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
const fade = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const DEG = Math.PI / 180;
const eul = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * DEG, y * DEG, z * DEG));

// Catmull-Rom/Hermite track over keyframes {t, v:[..], stop?}
function track(keys) {
  const n = keys[0].v.length;
  const tan = i => {
    const k = keys[i];
    if (k.stop) return new Array(n).fill(0);
    const a = keys[Math.max(0, i - 1)], b = keys[Math.min(keys.length - 1, i + 1)];
    return k.v.map((_, j) => (b.v[j] - a.v[j]) / (b.t - a.t || 1));
  };
  const tans = keys.map((_, i) => tan(i));
  return t => {
    if (t <= keys[0].t) return keys[0].v.slice();
    if (t >= keys[keys.length - 1].t) return keys[keys.length - 1].v.slice();
    let i = 0; while (t > keys[i + 1].t) i++;
    const k0 = keys[i], k1 = keys[i + 1], dt = k1.t - k0.t, u = (t - k0.t) / dt;
    const u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    return k0.v.map((_, j) => h00 * k0.v[j] + h10 * dt * tans[i][j] + h01 * k1.v[j] + h11 * dt * tans[i + 1][j]);
  };
}

// ================================================================ renderer
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;   // UI colours stay exact; only glows exceed 1.0
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const hud = new THREE.Scene();                // typography + cursor, drawn after post so it stays razor sharp
const BG = new THREE.Color('#0E0F12');
scene.background = BG;
scene.fog = new THREE.FogExp2(BG, 0.032);
const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
hud.add(camera);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// lights: warm key from upper-left, yellow rim from behind, low fill
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.35));
const key = new THREE.DirectionalLight(0xfff3e0, 1.6); key.position.set(-5, 7, 8); scene.add(key);
const rim = new THREE.DirectionalLight(0xffd43b, 2.2); rim.position.set(1, 4, -7); scene.add(rim);
const fill = new THREE.DirectionalLight(0xbfd4ff, 0.25); fill.position.set(6, -1, 5); scene.add(fill);

// ================================================================ textures
function tex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  return t;
}
const M = 0.012; // transparent margin around painted cards so edges anti-alias
function paint(w, h, ppu, fn) { const { c, ctx } = UI.canvas(w + 2 * M, h + 2 * M, ppu); ctx.translate(M, M); fn(ctx); return tex(c); }
function glowTex(stops, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col)); ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); return t;
}
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d'); ctx.filter = 'blur(22px)'; ctx.fillStyle = '#000';
  UI.rr(ctx, 48, 48, 160, 160, 26); ctx.fill();
  return new THREE.CanvasTexture(c);
}
function ringTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d'); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
  ctx.shadowColor = '#fff'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(128, 128, 100, 0, Math.PI * 2); ctx.stroke();
  return new THREE.CanvasTexture(c);
}
function streakTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.75, 'rgba(255,240,200,0.9)'); g.addColorStop(0.97, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 32);
  const v = ctx.createLinearGradient(0, 0, 0, 32); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = v; ctx.fillRect(0, 0, 512, 32);
  return new THREE.CanvasTexture(c);
}

// ================================================================ geometry
const geoCache = new Map();
function slabGeo(w, h, d, r, b) {
  const k = [w, h, d, r, b].map(x => x.toFixed(3)).join();
  if (geoCache.has(k)) return geoCache.get(k);
  const iw = w - 2 * b, ih = h - 2 * b, ir = Math.max(0.005, Math.min(r - b, iw / 2, ih / 2));
  const s = new THREE.Shape(), x = -iw / 2, y = -ih / 2;
  s.moveTo(x + ir, y); s.lineTo(x + iw - ir, y); s.quadraticCurveTo(x + iw, y, x + iw, y + ir);
  s.lineTo(x + iw, y + ih - ir); s.quadraticCurveTo(x + iw, y + ih, x + iw - ir, y + ih);
  s.lineTo(x + ir, y + ih); s.quadraticCurveTo(x, y + ih, x, y + ih - ir);
  s.lineTo(x, y + ir); s.quadraticCurveTo(x, y, x + ir, y);
  const depth = Math.max(0.001, d - 2 * b);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 5 });
  g.translate(0, 0, -(depth + b));   // front face sits at z = 0
  geoCache.set(k, g);
  return g;
}
const unitPlane = new THREE.PlaneGeometry(1, 1);
function face(t, order = 3) {
  const m = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.renderOrder = order; return m;
}
function additive(t, color, order = 6) {
  const m = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial({ map: t, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
  m.renderOrder = order; return m;
}

// ================================================================ environment: backdrop, floor, glow, dust
const FLOOR_Y = -1.98;
{
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 vP;
      void main(){
        vec3 top = vec3(0.085,0.09,0.105), mid = vec3(0.06,0.063,0.075), low = vec3(0.035,0.037,0.045);
        float y = vP.y;
        vec3 c = y > 0. ? mix(mid, top, smoothstep(0.,0.7,y)) : mix(mid, low, smoothstep(0.,0.3,-y));
        float warm = pow(max(0., dot(vP, normalize(vec3(0.,0.15,-1.)))), 6.);
        c += vec3(0.06,0.045,0.015) * warm;
        gl_FragColor = vec4(pow(c, vec3(2.2)), 1.);
      }`,
  }));
  sky.renderOrder = -10; scene.add(sky);
}
const mirror = new Reflector(new THREE.PlaneGeometry(80, 80), {
  textureWidth: Math.round(W * 0.5), textureHeight: Math.round(H * 0.5), color: 0x8a8a8a, multisample: 0,
});
mirror.rotation.x = -Math.PI / 2; mirror.position.y = FLOOR_Y; scene.add(mirror);
const floorTint = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({
  map: glowTex([[0, 'rgba(14,15,18,0.55)'], [0.08, 'rgba(14,15,18,0.72)'], [0.25, 'rgba(14,15,18,0.95)'], [0.5, 'rgba(14,15,18,1)']], 512),
  transparent: true, depthWrite: false, fog: false, toneMapped: false,
}));
floorTint.rotation.x = -Math.PI / 2; floorTint.position.y = FLOOR_Y + 0.002; floorTint.renderOrder = -5; scene.add(floorTint);

const backGlow = additive(glowTex([[0, 'rgba(255,214,110,0.55)'], [0.35, 'rgba(255,200,80,0.16)'], [1, 'rgba(255,200,80,0)']], 512), new THREE.Color(1, 1, 1), -4);
backGlow.material.fog = false; scene.add(backGlow);

// dust motes — positions animate in the shader from a deterministic clock
const DUST = 700;
const dust = (() => {
  const r = rng(7), pos = new Float32Array(DUST * 3), seed = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    pos.set([(r() - 0.5) * 22, -1.8 + r() * 7, -10 + r() * 15], i * 3);
    seed.set([r(), r(), r()], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 3));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uClock: { value: 0 }, uJitter: { value: 0 }, uAlpha: { value: 1 }, uPx: { value: H } },
    vertexShader: `attribute vec3 seed; uniform float uClock, uJitter, uPx; varying float vA; varying float vS;
      void main(){
        vec3 p = position;
        p.x += sin(uClock*0.21*(0.5+seed.x) + seed.y*6.28)*0.5;
        p.y += sin(uClock*0.17*(0.5+seed.z) + seed.x*6.28)*0.35 + uClock*0.02*(seed.z-0.3);
        p.z += cos(uClock*0.13*(0.5+seed.y) + seed.z*6.28)*0.5;
        p += uJitter * 0.02 * vec3(sin(uClock*41.*seed.x), sin(uClock*37.*seed.y), 0.);
        vec4 mv = modelViewMatrix * vec4(p,1.);
        gl_Position = projectionMatrix * mv;
        float size = mix(0.012, 0.045, seed.y*seed.y);
        gl_PointSize = size * uPx * 0.9 / -mv.z;
        vA = smoothstep(26., 4., -mv.z) * smoothstep(0.6, 2.2, -mv.z) * (0.35 + 0.65*seed.z);
        vS = seed.x;
      }`,
    fragmentShader: `uniform float uAlpha; varying float vA; varying float vS;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 c = mix(vec3(1.0,0.86,0.55), vec3(1.0,0.97,0.9), vS);
        gl_FragColor = vec4(c * 1.4, a * vA * uAlpha * 0.55);
      }`,
  });
  const p = new THREE.Points(g, m); p.renderOrder = 7; p.frustumCulled = false; scene.add(p);
  return p;
})();
// precomputed integral of the dust speed curve (faster during the chaos, calmer at the end)
const dustClock = (() => {
  const step = 1 / 120, arr = [0]; let acc = 0;
  for (let t = step; t <= DUR + 1; t += step) {
    const s = 1 + 1.6 * bell(t, 5, 11.2) - 0.55 * seg(t, 23.5, 26);
    acc += s * step; arr.push(acc);
  }
  return t => arr[Math.min(arr.length - 1, Math.round(t * 120))];
})();

// ================================================================ the dashboard slab
const SW = UI.SLAB.w, SH = UI.SLAB.h, PPU = 520;
const slab = new THREE.Group(); scene.add(slab);
const slabBody = new THREE.Mesh(slabGeo(SW, SH, 0.16, 0.18, 0.035), new THREE.MeshPhysicalMaterial({
  color: 0x2a2c31, metalness: 0.9, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.2,
}));
slab.add(slabBody);
const slabFaces = {};
for (const s of ['intro', 'board', 'plan', 'final']) {
  const f = face(paint(SW, SH, PPU, ctx => UI.drawSlab(ctx, s)), 1);
  f.scale.set(SW + 2 * M, SH + 2 * M, 1); f.position.z = 0.002 + 0.0004 * Object.keys(slabFaces).length;
  slab.add(f); slabFaces[s] = f;
}
const slabShadow = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.8, toneMapped: false }));
slabShadow.rotation.x = -Math.PI / 2; slabShadow.position.set(0, FLOOR_Y + 0.004, 0.3); slabShadow.scale.set(9, 2.2, 1); slabShadow.renderOrder = -3;
scene.add(slabShadow);
const streak = additive(streakTex(), new THREE.Color(3.2, 2.6, 1.3), 8);
streak.scale.set(2.6, 0.07, 1); scene.add(streak);
const sweep = additive(glowTex([[0, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]), new THREE.Color(0.55, 0.5, 0.4), 8);
sweep.scale.set(2.2, 6, 1); slab.add(sweep);

// slab-local (u right, v down, from the top-left corner) -> slab-local xyz
const slabLocal = (u, v, z = 0) => V(u - SW / 2, SH / 2 - v, z);
const slabZ = t => -1.5 * E.inOut(seg(t, 5.3, 7.4)) + 1.5 * E.inOut(seg(t, 11.4, 13.0)) - 7 * E.inOut(seg(t, 26.1, 28.0));
const slabY = t => 0.55 * E.inOut(seg(t, 26.1, 28.0));
// perceptual brightness of the dashboard glass (squared into linear light when applied)
const slabBright = t => {
  let b = lerp(0.03, 0.3, E.out3(seg(t, 0.45, 1.6)));
  b = lerp(b, 1, E.inOut(seg(t, 3.3, 4.7)));
  b *= 1 - 0.62 * E.inOut(seg(t, 5.3, 7.4)) * (1 - E.inOut(seg(t, 11.8, 13.0)));
  b *= 1 - 0.72 * E.out3(seg(t, 26.1, 26.85));
  return b;
};

// ================================================================ cards (the user's scattered day)
const SHADOW = shadowTex();
class Item {
  constructor(o) {
    this.o = o; this.g = new THREE.Group(); scene.add(this.g);
    this.bodyMat = new THREE.MeshStandardMaterial({ color: o.body ?? 0x9F9B92, roughness: 0.55, metalness: 0.0, envMapIntensity: 0.35, transparent: true });
    this.body = new THREE.Mesh(slabGeo(o.w, o.h, o.d ?? 0.03, 0.07, 0.009), this.bodyMat);
    this.g.add(this.body);
    this.faceA = face(o.tex); this.g.add(this.faceA);
    if (o.texDone) { this.faceDone = face(o.texDone, 4); this.g.add(this.faceDone); }
    if (o.texHot) { this.faceHot = face(o.texHot, 4); this.g.add(this.faceHot); }
    if (o.morph) { this.faceB = face(o.morph.tex, 4); this.g.add(this.faceB); }
    if (o.back) { this.faceBack = face(o.back); this.faceBack.rotation.y = Math.PI; this.g.add(this.faceBack); }
    if (o.badge) {
      const c = document.createElement('canvas'); c.width = c.height = 128; UI.drawBadge(c.getContext('2d'), 128, o.badge);
      this.badge = face(tex(c), 5); this.badge.scale.setScalar(0.17); this.g.add(this.badge);
    }
    this.shadow = new THREE.Mesh(unitPlane, new THREE.MeshBasicMaterial({ map: SHADOW, transparent: true, depthWrite: false, toneMapped: false }));
    this.shadow.renderOrder = 2; slab.add(this.shadow);
    this.size = [0, 0];
  }
  // p: {pos, quat, m (morph 0..1), op, dim, done, hot, squash, badgePulse}
  apply(p) {
    const o = this.o, m = p.m ?? 0;
    const w = o.morph ? lerp(o.w, o.morph.w, m) : o.w, h = o.morph ? lerp(o.h, o.morph.h, m) : o.h;
    if (Math.abs(w - this.size[0]) > 0.004 || Math.abs(h - this.size[1]) > 0.004) {
      this.body.geometry = slabGeo(w, h, o.d ?? 0.03, Math.min(0.07, h / 3), 0.009); this.size = [w, h];
    }
    this.g.position.copy(p.pos); this.g.quaternion.copy(p.quat);
    const op = p.op ?? 1, dim = p.dim ?? 1, d = o.d ?? 0.03;
    const sq = p.squash ?? 1;
    this.body.scale.z = sq;
    this.g.visible = op > 0.002;
    this.bodyMat.opacity = op; this.bodyMat.depthWrite = op > 0.99;
    const setFace = (f, a, flip = false) => {
      if (!f) return;
      f.scale.set(w + 2 * M, h + 2 * M, 1); f.position.z = flip ? -d * sq - 0.0025 : 0.0025;
      f.material.opacity = a * op; f.material.color.setScalar(lin(dim)); f.visible = a * op > 0.002;
    };
    setFace(this.faceA, 1 - (o.morph ? E.inOut(clamp(m * 1.6 - 0.3)) : 0));
    setFace(this.faceB, E.inOut(clamp(m * 1.6 - 0.3)));
    setFace(this.faceDone, p.done ?? 0);
    setFace(this.faceHot, p.hot ?? 0);
    setFace(this.faceBack, 1, true);
    if (this.badge) {
      this.badge.position.set(w / 2 - 0.02, h / 2 - 0.02, 0.01);
      this.badge.scale.setScalar(0.17 * (1 + 0.18 * (p.badgePulse ?? 0)));
      this.badge.material.opacity = op * (p.badgeOp ?? 1); this.badge.material.color.setScalar(lin(dim));
    }
    // contact shadow on the slab when hovering just above it
    const local = slab.worldToLocal(p.pos.clone());
    const lift = Math.max(0, local.z - d);
    const sa = op * clamp(1 - lift / 1.1) * (Math.abs(local.x) < SW / 2 + 0.3 && Math.abs(local.y) < SH / 2 + 0.3 ? 1 : 0);
    this.shadow.visible = sa > 0.01;
    this.shadow.position.set(local.x + 0.05 + lift * 0.18, local.y - 0.06 - lift * 0.26, 0.004);
    this.shadow.scale.set(w * 1.6 + lift * 0.6, h * 1.6 + lift * 0.6, 1);
    this.shadow.material.opacity = sa * (0.32 + 0.1 * clamp(lift * 4)) * slabBright(this.t ?? 0);
  }
}
const CPPU = 640;
const taskTex = (k, done) => paint(UI.TASK_SIZE.w, UI.TASK_SIZE.h, CPPU, ctx => UI.drawTask(ctx, 0, 0, UI.TASK_SIZE.w, UI.TASK_SIZE.h, k, { done }));
const items = {};
const CARD_EV = { w: 1.62, h: 0.58 };
for (const k of Object.keys(UI.TASKS)) items[k] = new Item({ ...UI.TASK_SIZE, tex: taskTex(k, false), texDone: taskTex(k, true) });
{
  const n = UI.NOTE_SLOT;
  items.note = new Item({ w: n.w, h: n.h, tex: paint(n.w, n.h, CPPU, ctx => UI.drawNoteLong(ctx, 0, 0, n.w, n.h)),
    texHot: paint(n.w, n.h, CPPU, ctx => UI.drawNoteLong(ctx, 0, 0, n.w, n.h, { chipHot: 1 })),
    back: paint(n.w, n.h, CPPU, ctx => UI.drawNoteSummary(ctx, 0, 0, n.w, n.h)) });
  const i = UI.IDEA_SLOT;
  items.idea = new Item({ w: i.w, h: i.h, tex: paint(i.w, i.h, CPPU, ctx => UI.drawIdeaNote(ctx, 0, 0, i.w, i.h)) });
}
for (const k of Object.keys(UI.EVENTS)) {
  const s = UI.eventSlot(UI.EVENTS[k]);
  items[k] = new Item({ ...CARD_EV, tex: paint(CARD_EV.w, CARD_EV.h, CPPU, ctx => UI.drawEventCard(ctx, 0, 0, CARD_EV.w, CARD_EV.h, k)),
    morph: { w: s.w, h: s.h, tex: paint(s.w, s.h, CPPU, ctx => UI.drawEvent(ctx, 0, 0, s.w, s.h, k)) },
    badge: k === 'dentist' ? '!' : null });
}
const NOISE = { tabs: { w: 1.62, h: 0.7, badge: '14' }, email: { w: 1.62, h: 0.56, badge: '23' }, messages: { w: 1.62, h: 0.56, badge: '9' }, invite: { w: 1.62, h: 0.56, badge: '1' } };
for (const [k, n] of Object.entries(NOISE)) items[k] = new Item({ w: n.w, h: n.h, badge: n.badge, tex: paint(n.w, n.h, CPPU, ctx => UI.drawNoise(ctx, 0, 0, n.w, n.h, k)) });

// where each item lives on the slab (centre, slab-local)
const centre = s => slabLocal(s.x + s.w / 2, s.y + s.h / 2);
const SLOT = {};
UI.LANDING.forEach((k, i) => SLOT[k] = centre(UI.taskSlot(i)));
const RANK_SLOT = {}; UI.RANKED.forEach((k, i) => RANK_SLOT[k] = centre(UI.taskSlot(i)));
SLOT.note = centre(UI.NOTE_SLOT); SLOT.idea = centre(UI.IDEA_SLOT);
for (const k of Object.keys(UI.EVENTS)) SLOT[k] = centre(UI.eventSlot(UI.EVENTS[k]));

// the chaos: hand-placed so the important cards stay readable
const CHAOS = {
  q3:       [-2.55, 1.25, 0.9, -6, 14, -5],
  sarah:    [2.35, 1.55, -0.2, 6, -16, 5],
  mock:     [-1.15, -1.45, 1.55, 8, 10, 4],
  inv:      [2.95, -0.95, 1.0, -4, -18, -3],
  vendor:   [0.55, 2.15, -1.5, 10, 8, -4],
  note:     [-0.2, 0.2, 0.25, -4, -8, 3],
  idea:     [-3.7, -0.6, -1.4, 4, 22, 7],
  standup:  [1.95, 0.35, 1.9, -6, -10, -5],
  client:   [-3.15, 2.25, -2.6, 8, 14, 3],
  dentist:  [3.65, 2.3, -2.8, 8, -18, 6],
  tabs:     [-1.9, -2.35, -1.2, -10, 6, -4],
  email:    [1.15, -2.3, -2.2, -8, -8, 3],
  messages: [-4.6, 1.0, -3.6, 4, 20, -6],
  invite:   [4.5, 0.6, -3.4, 6, -22, 5],
};
const chaosPhase = {}; { const r = rng(42); for (const k in CHAOS) chaosPhase[k] = [r() * 6.28, r() * 6.28, r() * 6.28]; }
const chaosClock = t => t < 10.25 ? t : 10.25 + 0.42 * (1 - Math.pow(1 - seg(t, 10.25, 10.7), 2)) * 0.5;
function chaosPose(k, t) {
  const [x, y, z, rx, ry, rz] = CHAOS[k], ph = chaosPhase[k];
  const tau = chaosClock(t);
  const amp = 1 + 0.9 * seg(t, 7, 10.2);
  const pos = V(
    x + Math.sin(tau * 0.55 + ph[0]) * 0.1 * amp,
    y + Math.sin(tau * 0.47 + ph[1]) * 0.08 * amp,
    z + Math.sin(tau * 0.39 + ph[2]) * 0.14 * amp + 0.35 * seg(t, 5, 10.5));
  const jit = 0.012 * bell(t, 8.8, 10.6);
  pos.x += Math.sin(t * 47 + ph[0] * 9) * jit; pos.y += Math.sin(t * 53 + ph[1] * 9) * jit;
  const quat = eul(rx + Math.sin(tau * 0.6 + ph[1]) * 3 * amp, ry + Math.sin(tau * 0.5 + ph[2]) * 4 * amp, rz + Math.sin(tau * 0.45 + ph[0]) * 2 * amp);
  return { pos, quat };
}
const ORDER = ['mock', 'inv', 'q3', 'vendor', 'sarah', 'note', 'idea', 'standup', 'client', 'dentist'];
const LATE = { tabs: 6.9, email: 7.35, messages: 7.8, invite: 8.25 };
const REST_Z = 0.034;
const slabWorld = (local, t) => {
  // slab transform at time t (slab only translates)
  return local.clone().add(V(0, slabY(t), slabZ(t)));
};
const QI = new THREE.Quaternion();

function itemPose(k, t) {
  const p = { pos: null, quat: QI.clone(), m: 0, op: 1, dim: 1, done: 0, hot: 0, squash: 1, badgePulse: 0 };
  const isEvent = k in UI.EVENTS, isNoise = k in NOISE, isTask = k in UI.TASKS;
  // ---- phase A: before the break (baked into the slab texture)
  if (!isNoise && t < 5.0) { p.op = 0; p.pos = slabWorld(SLOT[k].clone().setZ(REST_Z), t); p.m = isEvent ? 1 : 0; return p; }
  // ---- phase B: break-off / arrival, chaos
  let pos, quat, m = 0;
  if (!isNoise) {
    const tb = 5.0 + ORDER.indexOf(k) * 0.075;
    const home = slabWorld(SLOT[k].clone().setZ(REST_Z), t);
    const lifted = home.clone().add(V(0, 0, 0.32 * E.out3(seg(t, tb, tb + 0.35))));
    const u = E.inOut(seg(t, tb + 0.22, tb + 1.9));
    const c = chaosPose(k, t);
    pos = lifted.lerp(c.pos, u); quat = QI.clone().slerp(c.quat, u);
    m = isEvent ? 1 - E.inOut(seg(t, tb + 0.2, tb + 1.1)) : 0;
  } else {
    const te = LATE[k], c = chaosPose(k, t);
    const u = E.out5(seg(t, te, te + 1.0));
    const from = c.pos.clone().add(c.pos.clone().setZ(0).normalize().multiplyScalar(7)).add(V(0, 0, 2));
    pos = from.lerp(c.pos, u); quat = eul(0, c.pos.x > 0 ? -60 : 60, 0).slerp(c.quat, u);
    p.op = seg(t, te, te + 0.25);
    p.badgePulse = Math.max(0, Math.sin((t - te) * 7)) * seg(t, te + 0.6, te + 1) * (1 - seg(t, 10.3, 10.6));
  }
  if (k === 'dentist') p.badgePulse = Math.max(0, Math.sin((t - 6) * 7)) * seg(t, 6.5, 7) * (1 - seg(t, 10.3, 10.6));
  p.badgeOp = 1 - seg(t, 13.0, 13.4);
  // dim the chaos while the command bar is in focus
  p.dim = 1 - 0.45 * seg(t, 11.0, 11.6) * (1 - seg(t, 12.9, 13.5));
  // ---- phase C: organise (fly onto the board)
  const tf = 13.0 + (isNoise ? 0 : ORDER.indexOf(k) * 0.055);
  if (t >= tf) {
    const start = chaosPose(k, tf);
    if (isNoise) {
      const u = seg(t, tf + Object.keys(NOISE).indexOf(k) * 0.05, tf + 0.75);
      pos = start.pos.clone().add(V(0, 0.4 * E.in3(u), -4 * E.in3(u)));
      quat = start.quat; p.op *= 1 - E.in2(u);
    } else {
      const target = slabWorld(SLOT[k].clone().setZ(REST_Z), t);
      const u = E.inOut(seg(t, tf, tf + 1.2));
      const ctrl = start.pos.clone().lerp(target, 0.5).add(V(0, 0.35, 1.3));
      const a = start.pos.clone().lerp(ctrl, u), b = ctrl.clone().lerp(target, u);
      pos = a.lerp(b, u);
      quat = start.quat.clone().slerp(QI, E.out3(seg(t, tf, tf + 1.0)));
      m = isEvent ? E.inOut(seg(u, 0.35, 1)) : 0;
    }
  }
  // ---- tasks: re-rank
  if (isTask && t >= 14.7) {
    const j = UI.RANKED.indexOf(k), from = SLOT[k], to = RANK_SLOT[k];
    const u = E.inOut(seg(t, 14.75 + j * 0.05, 15.45 + j * 0.05));
    const dir = Math.sign(from.y - to.y);   // moving down -> right, up -> left
    const local = from.clone().lerp(to, u).add(V(-0.16 * dir * Math.sin(Math.PI * u), 0, REST_Z + 0.22 * Math.sin(Math.PI * u)));
    pos = slabWorld(local, t);
    const di = UI.DONE.indexOf(k);
    if (di >= 0) p.done = E.out3(seg(t, 22.85 + di * 0.32, 23.0 + di * 0.32));
  }
  // ---- note: click Summarize, flip to summary
  if (k === 'note') {
    p.hot = bell(t, 17.3, 17.75) > 0 ? Math.min(1, seg(t, 17.33, 17.4)) * (1 - seg(t, 17.7, 17.8)) : 0;
    const u = seg(t, 17.55, 18.45);
    if (u > 0) {
      const e = E.inOut(u);
      quat = quat.clone().multiply(eul(0, 180 * e, 0));
      pos = pos.clone().add(V(0, 0, 0.28 * Math.sin(Math.PI * e)));
    }
  }
  // ---- calm: press flat into the dashboard, hand over to the baked texture
  if (!isNoise) {
    const pr = E.inOut(seg(t, 24.0, 24.6));
    if (pr > 0) { pos = pos.clone().add(V(0, 0, -(REST_Z - 0.0035) * pr)); p.squash = lerp(1, 0.04, pr); }
    p.op *= 1 - seg(t, 24.75, 25.15);
  }
  p.pos = pos; p.quat = quat; p.m = m;
  return p;
}

// priority tags, focus block, pops
const tags = UI.RANKED.map((k) => {
  const tg = paint(UI.TAG_SIZE.w, UI.TAG_SIZE.h, CPPU, ctx => UI.drawTag(ctx, 0, 0, UI.TASKS[k].tag));
  const f = face(tg, 5); f.scale.set(UI.TAG_SIZE.w + 2 * M, UI.TAG_SIZE.h + 2 * M, 1); scene.add(f); return f;
});
const FOCUS = { w: UI.EVENT_W, h: 0.6 - 0.024 };
const focusTimes = [];
for (let h = 14; h >= 10; h -= 0.5) focusTimes.push(h);
const fmt = h => { const hh = Math.floor(h), mm = h % 1 ? '30' : '00'; return `${hh > 12 ? hh - 12 : hh}:${mm}`; };
const ampm = h => h >= 12 ? 'PM' : 'AM';
const focusLabel = h => { const e = h + 2; return ampm(h) === ampm(e) ? `${fmt(h)} – ${fmt(e)} ${ampm(e)}` : `${fmt(h)} ${ampm(h)} – ${fmt(e)} ${ampm(e)}`; };
const focusTex = new Map();
for (const h of focusTimes) focusTex.set(h, paint(FOCUS.w, FOCUS.h, CPPU, ctx => UI.drawFocus(ctx, 0, 0, FOCUS.w, FOCUS.h, { time: focusLabel(h), conflict: h === 14 })));
focusTex.set('ok', paint(FOCUS.w, FOCUS.h, CPPU, ctx => UI.drawFocus(ctx, 0, 0, FOCUS.w, FOCUS.h, { protectedOk: true })));
const focus = new Item({ ...FOCUS, d: 0.07, body: 0xE8B820, tex: focusTex.get(14) });
const RING = ringTex();
const pops = [
  { t: 15.55, at: t => tagWorld(0, t), c: [1.6, 1.3, 0.3], s: 0.5 },
  { t: 17.38, at: t => noteChipWorld(t), c: [1.6, 1.3, 0.3], s: 0.4 },
  { t: 21.95, at: t => focusWorld(t), c: [0.2, 0.85, 0.45], s: 0.6 },
  { t: 22.85, at: t => checkWorld('sarah', t), c: [0.4, 1.6, 0.8], s: 0.45 },
  { t: 23.17, at: t => checkWorld('inv', t), c: [0.4, 1.6, 0.8], s: 0.45 },
  { t: 29.02, at: t => buttonWorld(t).setX(0), c: [0.9, 0.75, 0.2], s: 1.15 },
].map(p => { p.m = additive(RING, new THREE.Color(...p.c), 9); scene.add(p.m); return p; });
const tagWorld = (i, t) => { const s = UI.tagSlot(i); return slabWorld(slabLocal(s.x + s.w / 2, s.y + s.h / 2, REST_Z + 0.004), t); };
const checkWorld = (k, t) => { const s = UI.taskSlot(UI.RANKED.indexOf(k)); return slabWorld(slabLocal(s.x + 0.2, s.y + s.h / 2, REST_Z + 0.01), t); };
const noteChipWorld = t => { const n = UI.NOTE_SLOT; return slabWorld(slabLocal(n.x + n.w - 0.43, n.y + n.h - 0.165, REST_Z + 0.01), t); };

function focusState(t) {
  // hour position of the block's top edge
  let hr = 14, lift = 0;
  const drag = E.inOut(seg(t, 21.15, 21.85));
  hr = 14 - 4 * drag;
  const settle = t > 21.85 ? -0.09 * Math.exp(-9 * (t - 21.85)) * Math.cos(16 * (t - 21.85)) : 0;
  lift = 0.16 * E.out3(seg(t, 21.03, 21.2)) * (1 - E.inOut(seg(t, 21.85, 22.05)));
  const grow = E.outBack(seg(t, 20.25, 20.75), 1.8);
  const snapHr = Math.max(10, Math.round(hr * 2) / 2);
  return { hr: hr + settle, lift, grow, label: t > 21.95 ? 'ok' : (drag > 0 ? snapHr : 14) };
}
const focusLocal = (t, s = focusState(t)) => slabLocal(UI.EVENT_X + FOCUS.w / 2, UI.hourY(s.hr) + 0.012 + FOCUS.h / 2, 0.07 + 0.002 + s.lift);
const focusWorld = t => slabWorld(focusLocal(t), t);

// ================================================================ command bar
const bar = new THREE.Group(); scene.add(bar);
const barBody = new THREE.Mesh(slabGeo(UI.BAR.w + 0.06, UI.BAR.h + 0.06, 0.1, 0.24, 0.025), new THREE.MeshPhysicalMaterial({ color: 0x2a2c31, metalness: 0.9, roughness: 0.3, clearcoat: 0.6, transparent: true }));
bar.add(barBody);
const barCanvas = UI.canvas(UI.BAR.w + 2 * M, UI.BAR.h + 2 * M, 600);
const barTex = tex(barCanvas.c);
const barFace = face(barTex, 5); barFace.scale.set(UI.BAR.w + 2 * M, UI.BAR.h + 2 * M, 1); barFace.position.z = 0.003; bar.add(barFace);
let barKey = '';
const BAR_POS = V(0, -0.12, 3.0);
const TYPED = 'Plan my day.';
function barState(t) {
  const n = clamp(Math.floor((t - 11.85) / 0.055) + 1, 0, TYPED.length);
  const thinking = t >= 12.62 ? ((t - 12.62) / 0.55) % 1 : -1;
  const caret = t < 12.62 && (t > 11.85 && t < 12.5 ? true : Math.floor(t * 2.6) % 2 === 0) && t > 11.7;
  return { typed: TYPED.slice(0, n), caret, thinking };
}
const barWorld = t => {
  const inU = E.outExpo(seg(t, 11.0, 11.8)), outU = E.inOut(seg(t, 13.0, 13.7));
  return BAR_POS.clone().add(V(0, -0.5 * (1 - inU) + 1.7 * outU, -1.6 * (1 - inU) - 1.2 * outU));
};
const ripple = additive(RING, new THREE.Color(1.8, 1.45, 0.35), 9); scene.add(ripple);

// ================================================================ CTA objects
const CTA_Z = 0.5;
const mark = new THREE.Group(); scene.add(mark);
const MARK_S = 0.5;
const markBody = new THREE.Mesh(slabGeo(MARK_S, MARK_S, 0.16, 0.13, 0.03), new THREE.MeshPhysicalMaterial({ color: 0xFFD43B, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, envMapIntensity: 0.8 }));
mark.add(markBody);
const markFace = face(paint(MARK_S, MARK_S, 800, ctx => UI.navMark(ctx, 0, 0, MARK_S)), 5);
markFace.scale.set(MARK_S + 2 * M, MARK_S + 2 * M, 1); markFace.position.z = 0.003; mark.add(markFace);

const BTN = { w: 2.3, h: 0.54 };
const button = new THREE.Group(); scene.add(button);
const btnBody = new THREE.Mesh(slabGeo(BTN.w, BTN.h, 0.16, BTN.h / 2, 0.035), new THREE.MeshPhysicalMaterial({ color: 0xE9BC1E, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2, envMapIntensity: 0.8 }));
button.add(btnBody);
const btnTex = paint(BTN.w, BTN.h, 700, ctx => {
  UI.rr(ctx, 0.008, 0.008, BTN.w - 0.016, BTN.h - 0.016, (BTN.h - 0.016) / 2); ctx.fillStyle = UI.C.yellow; ctx.fill();
  ctx.font = `700 0.2px "Inter Display", Inter`; ctx.fillStyle = UI.C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('Try DayPilot', BTN.w / 2 - 0.12, BTN.h / 2 + 0.072);
  // arrow
  const ax = BTN.w / 2 + 0.6, ay = BTN.h / 2;
  ctx.strokeStyle = UI.C.ink; ctx.lineWidth = 0.032; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(ax - 0.1, ay); ctx.lineTo(ax + 0.1, ay); ctx.moveTo(ax + 0.02, ay - 0.08); ctx.lineTo(ax + 0.1, ay); ctx.lineTo(ax + 0.02, ay + 0.08); ctx.stroke();
});
const btnFace = new THREE.Mesh(unitPlane, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, toneMapped: false,
  uniforms: { map: { value: btnTex }, uSweep: { value: -1 }, uGlow: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D map; uniform float uSweep, uGlow; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(map, vUv);
      float band = smoothstep(0.12, 0.0, abs((vUv.x + vUv.y*0.35) - uSweep));
      c.rgb = mix(c.rgb, vec3(1.), band * 0.55 * c.a) + uGlow * 0.06;
      gl_FragColor = linearToOutputTexel(c);
    }`,
}));
btnFace.material.map = btnTex;   // lets three pick up the sRGB decode for the sampler
btnFace.renderOrder = 5; btnFace.scale.set(BTN.w + 2 * M, BTN.h + 2 * M, 1); btnFace.position.z = 0.003; button.add(btnFace);
const BTN_Y = -1.02;
function buttonState(t) {
  const rise = E.outBack(seg(t, 27.95, 28.6), 1.25);
  const hover = E.out3(seg(t, 28.72, 28.9));
  const press = t < 29.0 ? 0 : t < 29.1 ? E.out3(seg(t, 29.0, 29.1)) : 1 - E.spring(t - 29.1);
  return { y: lerp(-2.75, BTN_Y, rise), z: CTA_Z + 0.05 * hover - 0.07 * press, sq: 1 - 0.45 * press, hover, sweep: lerp(-0.4, 1.8, E.inOut(seg(t, 29.12, 29.8))) };
}
const buttonWorld = t => { const s = buttonState(t); return V(0.35, s.y - 0.04, s.z + 0.02); };

// ================================================================ typography
const upp = 2 * Math.tan(FOV / 2 * DEG) / 1080;    // HUD units per reference pixel at depth 1
function textPlane(str, o, scene_ = hud) {
  const SS = 2;
  const r = UI.textCanvas(str, { ...o, size: (o.size ?? 100) * SS });
  const m = face(tex(r.c), 20);
  m.material.depthTest = false; m.material.fog = false;
  m.userData = { pw: r.c.width / SS, ph: r.c.height / SS, tw: r.textW / SS, pad: r.pad / SS, size: o.size ?? 100 };
  scene_.add(m);
  return m;
}
// place a HUD text plane by its left baseline in 1920x1080 reference pixels
function hudPlace(m, x, y, { op = 1, dz = 0, scale = 1, align = 'left' } = {}) {
  const u = m.userData, D = 1 + dz;
  const k = upp * D * scale;
  m.scale.set(u.pw * k, u.ph * k, 1);
  const left = align === 'center' ? x - u.tw * scale / 2 : x;
  const cx = left - u.pad * scale + u.pw * scale / 2;
  const cy = y - u.size * scale * 1.0 - u.pad * scale + u.ph * scale / 2;  // canvas baseline sits at pad + size
  m.position.set((cx - 960) * upp * D, (540 - cy) * upp * D, -D);
  m.material.opacity = op; m.visible = op > 0.002;
  if (m.parent !== camera) camera.add(m);
}
// world-space text: em = world height of the font size
function worldPlace(m, cx, baselineY, z, em, op = 1, alignLeft = null) {
  const u = m.userData, k = em / u.size;
  m.scale.set(u.pw * k, u.ph * k, 1);
  const left = alignLeft ?? cx - u.tw * k / 2;
  // canvas baseline sits (pad + size) below the canvas top
  m.position.set(left - u.pad * k + u.pw * k / 2, baselineY + (u.pad + u.size - u.ph / 2) * k, z);
  m.material.opacity = op; m.visible = op > 0.002;
}
// intro headline (world space, flies past the lens)
const HEAD = [['Your', 'day.'], ['Sorted', 'by', 'AI.']];
const headWords = HEAD.map(line => line.map(w => textPlane(w, { size: 140, weight: 700, color: w === 'AI.' ? UI.C.yellow : '#F7F5EF', spacing: -0.025 })));
// problem captions
const capTabs = textPlane('Too many tabs.', { size: 104, weight: 700, color: '#F7F5EF', spacing: -0.025 });
const capRemember = textPlane('Too much to remember.', { size: 104, weight: 700, color: '#F7F5EF', spacing: -0.025 });
const scrim = face(glowTex([[0, 'rgba(8,9,11,0.82)'], [0.55, 'rgba(8,9,11,0.5)'], [1, 'rgba(8,9,11,0)']], 512), 19);
scrim.material.depthTest = false; scrim.material.fog = false; camera.add(scrim);
// benefit captions: one dark glass pill each, so they read over any UI
function captionPill(num, str) {
  const SS = 2, Hh = 104, pad = 30, chipW = 62, chipH = 40, gap = 22, size = 58;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `650 ${size * SS}px "Inter Display", Inter`; probe.letterSpacing = `${-0.02 * size * SS}px`;
  const tw = probe.measureText(str).width / SS;
  const Wd = Math.ceil(pad + chipW + gap + tw + pad + 6);
  const c = document.createElement('canvas'); c.width = Wd * SS; c.height = Hh * SS;
  const ctx = c.getContext('2d'); ctx.scale(SS, SS);
  UI.rr(ctx, 1, 1, Wd - 2, Hh - 2, Hh / 2 - 1); ctx.fillStyle = 'rgba(24,25,29,0.9)'; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
  UI.rr(ctx, pad, (Hh - chipH) / 2, chipW, chipH, chipH / 2); ctx.fillStyle = UI.C.yellow; ctx.fill();
  ctx.font = `700 22px Inter`; ctx.fillStyle = UI.C.ink; ctx.textAlign = 'center'; ctx.fillText(num, pad + chipW / 2, Hh / 2 + 8);
  ctx.font = `650 ${size}px "Inter Display", Inter`; ctx.letterSpacing = `${-0.02 * size}px`; ctx.textAlign = 'left'; ctx.fillStyle = '#F7F5EF';
  ctx.fillText(str, pad + chipW + gap, Hh / 2 + size * 0.36);
  const m = face(tex(c), 20); m.material.depthTest = false; m.material.fog = false;
  m.userData = { w: Wd, h: Hh }; camera.add(m);
  return m;
}
function hudBox(m, x, y, op) {          // place by top-left corner in reference pixels
  const { w, h } = m.userData;
  m.scale.set(w * upp, h * upp, 1);
  m.position.set((x + w / 2 - 960) * upp, (540 - y - h / 2) * upp, -1);
  m.material.opacity = op; m.visible = op > 0.002;
}
const BENEFITS = [
  ['01', 'Prioritize your tasks.', 13.85, 16.45],
  ['02', 'Summarize your notes.', 16.7, 19.95],
  ['03', 'Make time for focused work.', 20.15, 23.85],
].map(([n, s, a, b]) => ({ m: captionPill(n, s), a, b }));
// CTA typography (world space so it shares the camera's parallax)
const tagLess = ['Less', 'planning.'].map(w => textPlane(w, { size: 150, weight: 700, color: '#F7F5EF', spacing: -0.03 }));
const tagMore = ['More', 'doing.'].map(w => textPlane(w, { size: 150, weight: 700, color: UI.C.yellow, spacing: -0.03 }));
const wordmark = textPlane('DayPilot', { size: 120, weight: 700, color: '#F7F5EF', spacing: -0.025 });
// cursor
const cursorTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const ctx = c.getContext('2d');
  ctx.translate(30, 18); ctx.scale(2.6, 2.6);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineTo(6.5, 20); ctx.lineTo(11, 30); ctx.lineTo(15, 28.3); ctx.lineTo(10.6, 18.6); ctx.lineTo(19, 18.6); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.6; ctx.strokeStyle = '#202020'; ctx.lineJoin = 'round'; ctx.stroke();
  return tex(c);
})();
const cursor = face(cursorTex, 30); cursor.material.depthTest = false; camera.add(cursor);
const cursorRing = face(RING, 29); cursorRing.material.depthTest = false; cursorRing.material.color.set(UI.C.yellow); camera.add(cursorRing);

// ================================================================ camera
const K = (t, p, l, o = {}) => ({ t, stop: o.stop, v: [...p, ...l, o.roll ?? 0, ...(o.f ?? l), o.ap ?? 1] });
const SHOTS = [
  { from: 0, to: 1.5, track: track([
    K(0, [-4.05, 2.12, 1.15], [-2.5, 1.8, 0], { roll: 4, ap: 1.6 }),
    K(1.5, [-2.35, 2.06, 1.42], [-0.7, 1.72, 0], { roll: 2, ap: 1.6 }),
  ]) },
  { from: 1.5, to: 11, track: track([
    K(1.5, [0.05, 0.08, 5.6], [0, 0.04, 0], { f: [0, 0, 2.2], ap: 1.4 }),
    K(3.2, [0, 0.06, 4.75], [0, 0.03, 0], { f: [0, 0, 2.2], ap: 1.4 }),
    K(4.3, [1.2, 0.5, 7.3], [0.05, -0.05, 0], { roll: -1 }),
    K(5.2, [2.3, 0.85, 8.9], [0.1, -0.1, 0], { roll: -1.5 }),
    K(7.0, [1.6, 0.55, 8.2], [0, 0.05, 0], { roll: -2, f: [-0.2, 0.2, 0.4], ap: 1.3 }),
    K(8.6, [0.9, 0.3, 7.4], [-0.1, 0.1, 0], { roll: -3, f: [1.95, 0.35, 1.9], ap: 1.4 }),
    K(10.1, [0.45, 0.15, 6.8], [-0.1, 0.1, 0], { roll: -3.6, f: [-2.55, 1.25, 0.9], ap: 1.4 }),
    K(11, [0.4, 0.14, 6.7], [-0.1, 0.1, 0], { roll: -3.7, f: [-0.2, 0.2, 0.6], ap: 1.2 }),
  ]) },
  { from: 11, to: 30.01, track: track([
    K(11, [0.3, 0.32, 7.8], [0, -0.08, 3], { ap: 1.8 }),
    K(12.6, [0.02, 0.1, 6.95], [0, -0.1, 3], { ap: 1.8 }),
    K(13.0, [-0.2, 0.18, 7.1], [-0.1, -0.05, 2.0], { f: [0, 0, 1] }),
    K(14.4, [-2.5, 0.85, 8.4], [-0.5, -0.05, 0], { f: [-0.5, 0, 0], ap: 0.6 }),
    K(15.5, [-2.85, 0.35, 5.35], [-1.75, -0.22, 0], { f: [-1.9, -0.4, 0], ap: 0.8 }),
    K(16.5, [-2.2, 0.2, 5.1], [-1.6, -0.22, 0], { f: [-1.9, -0.4, 0], ap: 0.8 }),
    K(17.3, [-0.45, 0.3, 4.45], [0.15, 0.12, 0], { f: [0.2, 0.05, 0.3] }),
    K(19.6, [0.6, 0.15, 4.15], [0.28, 0.08, 0], { f: [0.2, 0.05, 0.1] }),
    K(20.5, [1.75, -0.85, 4.55], [2.1, -0.35, 0], { f: [2.2, -0.6, 0.1] }),
    K(21.9, [2.55, -0.7, 4.3], [2.15, -0.3, 0], { f: [2.2, -0.4, 0.1] }),
    K(23.1, [2.2, -0.05, 6.6], [1.0, -0.15, 0], { f: [0.5, 0, 0], ap: 0.6 }),
    K(24.3, [0.75, 0.3, 8.4], [0.05, 0, 0], { f: [0, 0, 0], ap: 0.5 }),
    K(25.6, [0.12, 0.12, 8.05], [0, 0, 0], { f: [0, 0, 0], ap: 0.5 }),
    K(26.6, [0, 0.12, 7.85], [0, 0.02, 0], { f: [0, 0, CTA_Z], ap: 0.6 }),
    K(28.2, [0, 0.14, 7.35], [0, -0.03, 0], { f: [0, 0, CTA_Z], ap: 0.7 }),
    K(30, [0, 0.14, 7.15], [0, -0.03, 0], { f: [0, 0, CTA_Z], ap: 0.7, stop: true }),
  ]) },
];
const shake = (t, a) => V(Math.sin(t * 1.3) * 0.6 + Math.sin(t * 2.9 + 1) * 0.3, Math.sin(t * 1.7 + 2) * 0.5 + Math.sin(t * 3.7) * 0.2, 0).multiplyScalar(a);
const camState = { focus: 5, ap: 1 };
function placeCamera(t) {
  const s = SHOTS.find(s => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const v = s.track(t);
  const amp = 0.012 + 0.03 * bell(t, 5, 11) + 0.006 * seg(t, 11, 30) - 0.01 * seg(t, 28, 30);
  const p = V(v[0], v[1], v[2]).add(shake(t, amp)), l = V(v[3], v[4], v[5]);
  camera.position.copy(p); camera.up.set(0, 1, 0); camera.lookAt(l); camera.rotateZ(v[6] * DEG);
  camera.updateMatrixWorld(true);
  const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
  camState.focus = V(v[7], v[8], v[9]).sub(p).dot(fwd);
  camState.ap = v[10];
}

// ================================================================ post
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 5, aperture: 0.002, maxblur: 0.008 });
{ const r = bokeh.render.bind(bokeh); bokeh.render = (...a) => { mirror.visible = false; dust.visible = false; r(...a); mirror.visible = true; dust.visible = true; }; }
composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.55, 0.65, 1.05);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVig: { value: 0.42 }, uGrain: { value: 0.035 }, uFade: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uVig, uGrain, uFade; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5; d.x *= 1.5;
      c.rgb *= mix(1.0 - uVig, 1.0, smoothstep(0.85, 0.2, length(d)));
      c.rgb += (h(vUv * 1000. + fract(uTime) * 61.) - 0.5) * uGrain;
      c.rgb *= 1.0 - uFade;
      gl_FragColor = c;
    }`,
});
composer.addPass(grade);

// ================================================================ frame
function update(t) {
  placeCamera(t);

  // --- slab
  slab.position.set(0, slabY(t), slabZ(t));
  const sb = slabBright(t);
  const finalU = seg(t, 24.7, 25.1);
  slabFaces.intro.material.opacity = t < 5.0 ? 1 : 0;
  slabFaces.board.material.opacity = t >= 5.0 ? 1 : 0;
  slabFaces.plan.material.opacity = seg(t, 12.9, 13.25);
  slabFaces.final.material.opacity = finalU;
  for (const f of Object.values(slabFaces)) { f.material.color.setScalar(lin(sb)); f.visible = f.material.opacity > 0.001; }
  slabBody.material.envMapIntensity = 0.3 + 0.9 * clamp(sb * 1.2);
  slabShadow.position.z = slabZ(t) + 0.3; slabShadow.material.opacity = 0.75 * clamp(sb * 1.3);
  // power-on streak along the top bevel + sweep across the glass
  const su = seg(t, 0.15, 1.45);
  streak.position.set(lerp(-4.6, 4.2, E.inOut(su)), 1.8 + slabY(t) + 0.0, slabZ(t) + 0.02);
  streak.material.opacity = bell(t, 0.15, 1.5);
  sweep.position.set(lerp(-5, 5, E.inOut(seg(t, 0.75, 2.0))), 0, 0.006);
  sweep.rotation.z = -0.35; sweep.material.opacity = bell(t, 0.75, 2.0) * 0.8;
  backGlow.position.set(0, 0.3 + slabY(t), slabZ(t) - 2.2);
  backGlow.scale.set(15, 9, 1);
  backGlow.material.opacity = 0.1 + 0.32 * E.out3(seg(t, 0.4, 2.2)) - 0.25 * bell(t, 5, 12.5) + 0.1 * seg(t, 24, 26);
  // rim light swells with the reveal
  rim.intensity = 0.4 + 2.2 * E.out3(seg(t, 0.2, 1.6));
  key.intensity = 0.4 + 1.2 * E.out3(seg(t, 0.4, 1.8));

  // --- cards
  for (const k of Object.keys(items)) { items[k].t = t; items[k].apply(itemPose(k, t)); }

  // --- tags
  tags.forEach((m, i) => {
    const k = UI.RANKED[i], ta = 15.55 + i * 0.17;
    const u = seg(t, ta, ta + 0.32);
    const pr = E.inOut(seg(t, 24.0, 24.6));
    const w = tagWorld(i, t).add(V(0, 0, 0.003 - (REST_Z - 0.0035) * pr));
    m.position.copy(w);
    m.scale.set((UI.TAG_SIZE.w + 2 * M) * lerp(1.9, 1, E.outBack(u, 2)), (UI.TAG_SIZE.h + 2 * M) * lerp(1.9, 1, E.outBack(u, 2)), 1);
    m.material.opacity = E.out3(seg(t, ta, ta + 0.12)) * (1 - seg(t, 24.75, 25.15));
    m.visible = m.material.opacity > 0.002;
  });

  // --- focus block
  {
    const s = focusState(t);
    const p = { pos: slabWorld(focusLocal(t, s), t), quat: QI, op: E.out3(seg(t, 20.25, 20.45)) * (1 - seg(t, 24.75, 25.15)), squash: Math.max(0.02, s.grow) };
    const pr = E.inOut(seg(t, 24.0, 24.6));
    if (pr > 0) { p.pos.z -= (0.072 - 0.0035) * pr; p.squash = lerp(1, 0.02, pr); }
    focus.faceA.material.map = focusTex.get(s.label);
    focus.t = t; focus.apply(p);
  }

  // --- pops
  for (const p of pops) {
    const u = seg(t, p.t, p.t + 0.55);
    p.m.visible = u > 0 && u < 1;
    if (!p.m.visible) continue;
    p.m.position.copy(p.at(t)).add(V(0, 0, 0.01));
    p.m.scale.setScalar(p.s * lerp(0.25, 1, E.out3(u)));
    p.m.material.opacity = (1 - u) * 0.9;
  }

  // --- command bar
  {
    const vis = seg(t, 11.0, 11.25) * (1 - seg(t, 13.25, 13.7));
    bar.visible = vis > 0.001;
    if (bar.visible) {
      bar.position.copy(barWorld(t));
      const enter = bell(t, 12.58, 12.75);
      bar.scale.setScalar(1 - 0.03 * enter);
      bar.rotation.x = -0.06 + 0.12 * E.inOut(seg(t, 13.0, 13.6));
      barBody.material.opacity = vis; barFace.material.opacity = vis;
      const st = barState(t);
      const keyStr = `${st.typed}|${st.caret}|${st.thinking >= 0 ? st.thinking.toFixed(2) : -1}`;
      if (keyStr !== barKey) {
        const { c, ctx } = barCanvas;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
        ctx.setTransform(600, 0, 0, 600, M * 600, M * 600);
        UI.drawBar(ctx, st); barTex.needsUpdate = true; barKey = keyStr;
      }
    }
    const ru = seg(t, 12.92, 13.75);
    ripple.visible = ru > 0 && ru < 1;
    ripple.position.copy(BAR_POS).add(V(0, 0, -0.05));
    ripple.scale.setScalar(lerp(0.6, 14, E.out3(ru)));
    ripple.material.opacity = (1 - ru) * 0.8;
  }

  // --- CTA objects
  {
    const mu = seg(t, 27.25, 28.05);
    mark.visible = mu > 0;
    const row = 1.22;
    const u = wordmark.userData, em = 0.42, wmW = u.tw * em / u.size;
    const rowW = MARK_S + 0.16 + wmW, left = -rowW / 2;
    mark.position.set(left + MARK_S / 2, row + 0.02, CTA_Z);
    mark.rotation.set(0, (1 - E.outBack(mu, 1.6)) * 70 * DEG, 0);
    markBody.scale.z = Math.max(0.02, E.out3(mu));
    markFace.material.opacity = E.out3(seg(t, 27.25, 27.5)); markBody.material.opacity = 1;
    worldPlace(wordmark, 0, row - 0.13, CTA_Z, em, E.out3(seg(t, 27.45, 28.0)), left + MARK_S + 0.16 + 0.25 * (1 - E.out5(seg(t, 27.45, 28.1))));
    const lineY = [0.42, -0.2];
    [tagLess, tagMore].forEach((line, li) => {
      const em2 = 0.5, gap = 0.13;
      const widths = line.map(m => m.userData.tw * em2 / m.userData.size);
      let x = -(widths.reduce((a, b) => a + b, 0) + gap * (line.length - 1)) / 2;
      line.forEach((m, wi) => {
        const ta = 26.65 + (li * 2 + wi) * 0.13;
        const e = E.out5(seg(t, ta, ta + 0.8));
        worldPlace(m, 0, lineY[li] - 0.12 * (1 - e), CTA_Z - 1.4 * (1 - e), em2, seg(t, ta, ta + 0.35), x);
        x += widths[wi] + gap;
      });
    });
    const b = buttonState(t);
    button.visible = t > 27.9;
    button.position.set(0, b.y, b.z);
    btnBody.scale.z = b.sq;
    btnFace.position.z = 0.003 + 0.16 * (b.sq - 1);
    btnFace.material.uniforms.uSweep.value = b.sweep;
    btnFace.material.uniforms.uGlow.value = b.hover;
  }

  // --- intro headline (world space)
  headWords.forEach((line, li) => {
    const em = 0.27, gap = 0.08, z0 = 2.2;
    const widths = line.map(m => m.userData.tw * em / m.userData.size);
    let x = -(widths.reduce((a, b) => a + b, 0) + gap * (line.length - 1)) / 2;
    line.forEach((m, wi) => {
      const idx = li * 2 + wi, ta = 1.55 + idx * 0.16;
      const e = E.out5(seg(t, ta, ta + 0.9));
      const fly = E.in3(seg(t, 3.2 + idx * 0.05, 4.05 + idx * 0.05));
      const cx = x + widths[wi] / 2;
      const z = z0 - 1.6 * (1 - e) + 6.5 * fly;
      const left = x + cx * 1.8 * fly;
      const y = (li === 0 ? 0.17 : -0.2) + (li === 0 ? 0.35 : -0.35) * fly;
      const near = clamp((camera.position.z - z - 0.6) / 1.2);
      worldPlace(m, 0, y - 0.1 * (1 - e), z, em, seg(t, ta, ta + 0.4) * near, left);
      x += widths[wi] + gap;
    });
  });

  // --- HUD captions
  {
    const a = fade(t, 7.0, 7.35, 10.75, 11.0), b = fade(t, 9.5, 9.85, 10.75, 11.0);
    const ea = E.out5(seg(t, 7.0, 7.7)), eb = E.out5(seg(t, 9.5, 10.2));
    scrim.position.set(0, 0, -1.02); scrim.scale.set(1920 * upp * 1.02 * 1.05, 1080 * upp * 1.02 * 0.95, 1);
    scrim.material.opacity = Math.max(a, b) * 0.9;
    hudPlace(capTabs, 960, 525 + 30 * (1 - ea), { op: a, align: 'center', scale: 1 + 0.06 * (1 - ea) });
    hudPlace(capRemember, 960, 655 + 30 * (1 - eb), { op: b, align: 'center', scale: 1 + 0.06 * (1 - eb) });
    for (const c of BENEFITS) {
      const v = fade(t, c.a, c.a + 0.3, c.b - 0.25, c.b);
      const e = E.out5(seg(t, c.a, c.a + 0.8));
      hudBox(c.m, 88 - 40 * (1 - e), 72, v);
    }
  }

  // --- cursor
  {
    const s = cursorPath(t);
    cursor.visible = s.op > 0.002;
    const sz = 64 * (1 - 0.12 * s.press);
    // hotspot (arrow tip) is at (30,18) of a 128px texture
    const cx = s.x + (64 - 30) * sz / 128, cy = s.y + (64 - 18) * sz / 128;
    cursor.position.set((cx - 960) * upp * 0.6, (540 - cy) * upp * 0.6, -0.6);
    cursor.scale.set(sz * upp * 0.6, sz * upp * 0.6, 1);
    cursor.material.opacity = s.op;
    const ru = seg(t, s.clickT ?? -9, (s.clickT ?? -9) + 0.45);
    cursorRing.visible = ru > 0 && ru < 1 && s.op > 0;
    cursorRing.position.set((s.x - 960) * upp * 0.601, (540 - s.y) * upp * 0.601, -0.601);
    cursorRing.scale.setScalar(lerp(20, 90, E.out3(ru)) * upp * 0.601);
    cursorRing.material.opacity = (1 - ru) * 0.9;
  }

  // --- atmosphere + post
  dust.material.uniforms.uClock.value = dustClock(t);
  dust.material.uniforms.uJitter.value = bell(t, 8.5, 10.8);
  dust.material.uniforms.uAlpha.value = 0.5 + 0.5 * E.out3(seg(t, 0.3, 2)) - 0.3 * seg(t, 11, 11.5) * (1 - seg(t, 12.8, 13.4));
  bokeh.uniforms.focus.value = camState.focus;
  bokeh.uniforms.aperture.value = 0.0022 * camState.ap;
  bokeh.uniforms.maxblur.value = 0.009;
  bloom.strength = 0.5 + 0.25 * bell(t, 0.2, 1.8) + 0.2 * bell(t, 12.8, 13.8) + 0.15 * bell(t, 29, 29.8);
  grade.uniforms.uTime.value = t * 7.31;
  grade.uniforms.uFade.value = 1 - E.out3(seg(t, 0, 0.35));
  scene.fog.density = 0.03 + 0.012 * bell(t, 5, 12);
}

// screen-space cursor choreography
const project = v => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * 1920, y: (1 - p.y) / 2 * 1080 }; };
function moveBetween(t, a, b, ta, tb, arc = 40) {
  const u = E.inOut(seg(t, ta, tb));
  const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u);
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  return { x: x + (-dy / L) * arc * Math.sin(Math.PI * u), y: y + (dx / L) * arc * Math.sin(Math.PI * u) };
}
function cursorPath(t) {
  const off = (p, dx, dy) => ({ x: p.x + dx, y: p.y + dy });
  if (t >= 11.15 && t < 12.1) {
    const target = project(barWorld(t).add(V(-UI.BAR.w / 2 + 0.75, -0.02, 0.06)));
    const p = moveBetween(t, { x: 1560, y: 900 }, target, 11.2, 11.62);
    return { ...p, op: fade(t, 11.15, 11.3, 11.85, 12.05), press: bell(t, 11.66, 11.78), clickT: 11.68 };
  }
  if (t >= 16.8 && t < 18.4) {
    const chipP = project(noteChipWorld(Math.min(t, 17.5)));
    const p = t < 17.45 ? moveBetween(t, { x: 1500, y: 930 }, chipP, 16.85, 17.3) : moveBetween(t, chipP, off(chipP, 90, 120), 17.5, 18.1, 10);
    return { ...p, op: fade(t, 16.8, 16.95, 18.1, 18.35), press: bell(t, 17.32, 17.44), clickT: 17.36 };
  }
  if (t >= 20.65 && t < 22.6) {
    const grip = project(focusWorld(t).add(V(0.35, -0.05, 0.03)));
    let p;
    if (t < 21.03) p = moveBetween(t, { x: 1680, y: 980 }, grip, 20.7, 21.0);
    else if (t < 22.0) p = grip;
    else p = moveBetween(t, project(focusWorld(22.0).add(V(0.35, -0.05, 0.03))), off(project(focusWorld(22.0)), 260, 120), 22.0, 22.45, 10);
    return { ...p, op: fade(t, 20.65, 20.8, 22.35, 22.55), press: t > 21.03 && t < 21.95 ? 1 : 0, clickT: 21.03 };
  }
  if (t >= 28.2) {
    const target = project(buttonWorld(t));
    const p = t < 29.4 ? moveBetween(t, { x: 1600, y: 1000 }, target, 28.25, 28.78) : moveBetween(t, project(buttonWorld(29.4)), off(project(buttonWorld(29.4)), 70, 60), 29.4, 29.9, 8);
    return { ...p, op: seg(t, 28.2, 28.35), press: bell(t, 28.98, 29.14), clickT: 29.0 };
  }
  return { x: 0, y: 0, op: 0, press: 0 };
}

function render(t) {
  update(t);
  renderer.autoClear = true;
  composer.render();
  renderer.autoClear = false;
  renderer.setRenderTarget(null);
  renderer.clearDepth();
  renderer.render(hud, camera);
}

// ================================================================ boot
window.renderFrame = f => render(f / FPS);
window.__ready = true;

if (!RENDER) {
  const ui = document.getElementById('ui');
  ui.hidden = false;
  const scrub = document.getElementById('scrub'), label = document.getElementById('time');
  let playing = true, t0 = performance.now(), base = 0;
  const now = () => playing ? (base + (performance.now() - t0) / 1000) % DUR : base;
  scrub.oninput = () => { base = +scrub.value; t0 = performance.now(); };
  addEventListener('keydown', e => {
    if (e.code === 'Space') { base = now(); playing = !playing; t0 = performance.now(); }
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') { base = clamp(now() + (e.code === 'ArrowRight' ? 1 / FPS : -1 / FPS), 0, DUR); t0 = performance.now(); }
  });
  (function loop() { const t = now(); render(t); scrub.value = t; label.textContent = `${t.toFixed(2)}s · f${Math.round(t * FPS)}`; requestAnimationFrame(loop); })();
}
