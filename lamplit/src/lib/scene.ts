// The scene: renderer, lamp-lit room, camera, input, navigation and the render loop.
// startScene() starts it in the host element and returns a function that stops it completely.
import * as THREE from "three";
import { Book, type FaceSpec, type SheetSpec } from "./book";
import { MediaPool, VideoPage } from "./media";
import {
  ContentsPage, backCoverTexture, blankTexture, blobTexture, closingTexture, coverTexture, edgeTexture,
  loadBrand, loadFonts, paperTexture, type PrintCopy,
} from "./pages";
import { createProps, type PropCopy } from "./props";
import { quality } from "./quality";
import { createTable } from "./table";

const BG = 0x060505;
const LAMP = { color: 0xfff1e2, intensity: 140, angle: 0.56, penumbra: 0.85, decay: 2 };
const LAMP_POS = new THREE.Vector3(-2.0, 6.3, -1.3);
const LAMP_TARGET = new THREE.Vector3(0.25, 0, -0.15);
const FOV = 21;
const ELEVATION = THREE.MathUtils.degToRad(60);
const PAGE_ASPECT = 16 / 10;
const CLICK_SLOP = 6; // px a press may move and still count as a click
const RENDER_FRAMES = 12; // frames rendered unconditionally at start

const lerp = THREE.MathUtils.lerp;
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clock = () => performance.now() / 1000;

export type SceneCase = { title: string; tag: string; start: number; src: string; poster: string };

export type SceneOptions = {
  host: HTMLElement;
  className: string;
  label: string;
  hero: HTMLElement;
  header: HTMLElement;
  cases: SceneCase[];
  brand: { logo: string; mark: string; bg: string };
  print: PrintCopy & PropCopy;
  onReady: () => void;
  onOpenChange: (open: boolean) => void;
  onError: (err: unknown) => void;
};

// 0-based case i: even cases lie on a right page, odd ones on a left page.
export const caseSpread = (i: number) => (i % 2 === 0 ? i / 2 + 1 : (i + 3) / 2);

function disposeMaterial(m: THREE.Material) {
  for (const v of Object.values(m as unknown as Record<string, unknown>)) {
    if (v instanceof THREE.Texture) v.dispose();
  }
  m.dispose();
}

// Keys typed into a field, or Space / Enter on a focused control, belong to that element.
function ownsKey(target: EventTarget | null, key: string) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest("input, textarea, select, [contenteditable]")) return true;
  return (key === " " || key === "Enter") && !!target.closest("a, button, [role='button'], summary");
}

// Shown on a case page whose poster failed to load (the failure is logged with its URL).
function unavailableTexture(title: string) {
  const c = document.createElement("canvas");
  c.width = 1280;
  c.height = 800;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#f3f2ee";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#111111";
    ctx.font = '500 64px Inter, system-ui, sans-serif';
    ctx.fillText(title, c.width / 2, c.height / 2 - 10);
    ctx.fillStyle = "#8a8984";
    ctx.font = '500 24px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText("PREVIEW UNAVAILABLE", c.width / 2, c.height / 2 + 56);
  }
  return new THREE.CanvasTexture(c);
}

export function startScene(o: SceneOptions) {
  let stopped = false;
  let cleanup: (() => void) | null = null;
  init(o, () => stopped)
    .then((c) => {
      if (stopped) c();
      else cleanup = c;
    })
    .catch((err: unknown) => {
      console.error("Lamplit: the scene failed to load.", err);
      if (!stopped) o.onError(err);
    });
  return () => {
    stopped = true;
    cleanup?.();
    cleanup = null;
  };
}

async function init(o: SceneOptions, isStopped: () => boolean): Promise<() => void> {
  // 1. Canvas
  const canvas = document.createElement("canvas");
  canvas.className = o.className;
  canvas.setAttribute("aria-label", o.label);
  canvas.setAttribute("role", "img");
  o.host.appendChild(canvas);
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 2. Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  let pixelRatio = Math.min(devicePixelRatio, quality.maxPixelRatio);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  // 3. Scene and camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  const fog = new THREE.Fog(BG, 10, 26);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);

  // 4. Lights: a warm desk lamp above-left, a dim sky, a cool rim and a soft fill.
  const lamp = new THREE.SpotLight(LAMP.color, LAMP.intensity, 0, LAMP.angle, LAMP.penumbra, LAMP.decay);
  lamp.position.copy(LAMP_POS);
  lamp.target.position.copy(LAMP_TARGET);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(quality.shadowMap, quality.shadowMap);
  lamp.shadow.camera.near = 2;
  lamp.shadow.camera.far = 16;
  lamp.shadow.bias = -0.0003;
  lamp.shadow.normalBias = 0.012;
  lamp.shadow.radius = 6;
  scene.add(lamp, lamp.target);
  scene.add(new THREE.HemisphereLight(0xd9cbb8, 0x000000, 0.22));
  const rim = new THREE.DirectionalLight(0xaabbe0, 0.35);
  rim.position.set(3, 2.2, -5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffeedd, 0.75);
  fill.position.set(3.5, 2.5, 3.5);
  scene.add(fill);

  const disposeScene = () => {
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry.dispose();
      const mats: THREE.Material[] = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(disposeMaterial);
    });
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };

  // 5. Table
  scene.add(createTable(renderer, { anisotropy, pxPerUnit: quality.tablePx }));

  // 6. Brand, posters and fonts
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  let loaded: [Awaited<ReturnType<typeof loadBrand>>, THREE.Texture[], void];
  try {
    loaded = await Promise.all([
      loadBrand(o.brand).catch(() => {
        throw new Error(`Logo or mark failed to load: ${o.brand.logo}, ${o.brand.mark}`);
      }),
      // A missing poster costs its page, not the whole book.
      Promise.all(o.cases.map((c) => loader.loadAsync(c.poster).catch(() => {
        console.warn(`Poster failed to load: ${c.poster}`);
        return unavailableTexture(c.title);
      }))),
      loadFonts(),
    ]);
  } catch (err) {
    disposeScene();
    throw err;
  }
  const [brand, posters] = loaded;
  if (isStopped()) {
    posters.forEach((t) => t.dispose());
    disposeScene();
    return () => {};
  }
  for (const t of posters) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = anisotropy;
  }

  // 7. Video pages
  const videoPages = o.cases.map((c, i) => new VideoPage(c, posters[i], anisotropy));
  const pool = new MediaPool(videoPages, quality.loadedVideos);

  // 8. The book and the props
  const print = o.print;
  const boardAspect = Book.boardAspect(PAGE_ASPECT);
  const turnIn = Book.turnIn(PAGE_ASPECT);
  const contents = new ContentsPage(o.cases, brand.logo, print, boardAspect, { turnIn, spine: "right" });
  const faces: FaceSpec[] = videoPages.map((video) => ({ video }));
  let backInner = closingTexture(brand, print, boardAspect, { turnIn, spine: "left" });
  if (faces.length % 2 === 1) {
    // Odd count: the closing note takes the last page, the back board's inside stays blank.
    backInner.dispose();
    faces.push({ map: closingTexture(brand, print, PAGE_ASPECT) });
    backInner = blankTexture(boardAspect, { turnIn, spine: "left" });
  }
  const sheets: SheetSpec[] = [];
  for (let i = 0; i < faces.length; i += 2) sheets.push({ front: faces[i], back: faces[i + 1] });
  const covers = {
    frontOuter: coverTexture(brand, boardAspect),
    frontInner: contents.texture,
    backInner,
    backOuter: backCoverTexture(brand, boardAspect, print),
  };
  Object.values(covers).forEach((t) => (t.anisotropy = anisotropy));
  const paper = paperTexture();
  const book = new Book({ aspect: PAGE_ASPECT, sheets, covers, edge: edgeTexture(), paper });
  scene.add(book.root);
  scene.add(createProps({ brand, paper, renderer, copy: print }));

  // 9. Contact shadow under the book
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, opacity: 0.7, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.0015;
  book.inner.add(blob);

  // ------------------------------------------------------------ rendering

  let renderFrames = RENDER_FRAMES;
  const invalidate = (n = 2) => {
    renderFrames = Math.max(renderFrames, n);
  };

  // ------------------------------------------------------------ layout

  const size = { w: 0, h: 0 };
  const bounds = { closedTop: 0, openTop: 0 };
  let viewShift = NaN;
  let measure = false;

  const resize = (force = false) => {
    const w = innerWidth, h = innerHeight;
    if (!force && !measure && w === size.w && h === size.h) return;
    measure = false;
    size.w = w;
    size.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const heroBottom = o.hero.offsetTop + o.hero.offsetHeight;
    bounds.closedTop = Math.min(h * 0.55, heroBottom + 32);
    bounds.openTop = o.header.getBoundingClientRect().bottom + 24;
    viewShift = NaN;
    invalidate();
  };
  // The headline reflows once its font arrives.
  document.fonts.ready.then(() => {
    measure = true;
  });

  // ------------------------------------------------------------ camera

  const cam = { open: 0 };
  const tilt = { yaw: 0, pitch: 0 };
  const lastCam = new THREE.Vector3(Infinity, Infinity, Infinity);
  let lastYaw = book.root.rotation.y;

  const placeCamera = (dt: number) => {
    const { w, h } = size;
    cam.open = damp(cam.open, book.openness, 3.5, dt);
    const open = cam.open;
    const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const share = w < 700 ? lerp(0.62, 0.94, open) : lerp(0.56, 0.86, open);
    const halfW = book.Wc + 0.08;
    const halfD = (book.Hc / 2) * Math.sin(ELEVATION) + 0.06;
    const stage = { top: lerp(bounds.closedTop, bounds.openTop, open), bottom: h - 24 };
    const shift = Math.round(h / 2 - (stage.top + stage.bottom) / 2);
    if (shift !== viewShift) {
      viewShift = shift;
      camera.setViewOffset(w, h, 0, shift, w, h);
    }
    const stageH = Math.max(120, stage.bottom - stage.top);
    const dist = Math.max((halfW * h) / (share * w * vt), (halfD * h) / (0.8 * stageH * vt));

    // POV tilt: the camera orbits a little toward the mouse.
    const px = pointer.inside && !press ? pointer.x : 0;
    const py = pointer.inside && !press ? pointer.y : 0;
    tilt.yaw = damp(tilt.yaw, calm ? 0 : px * 0.13, 2.5, dt);
    tilt.pitch = damp(tilt.pitch, calm ? 0 : -py * 0.07, 2.5, dt);
    const el = ELEVATION + tilt.pitch;
    camera.position.set(
      Math.sin(tilt.yaw) * Math.cos(el) * dist,
      Math.sin(el) * dist,
      Math.cos(tilt.yaw) * Math.cos(el) * dist,
    );
    camera.lookAt(0, 0, 0);
    fog.near = dist + 3;
    fog.far = dist + 18;
    // The closed book sits turned and straightens as it opens.
    book.root.rotation.y = damp(book.root.rotation.y, 0.12 * (1 - open), 4, dt);

    const moved = camera.position.distanceToSquared(lastCam) > 1e-10 || Math.abs(book.root.rotation.y - lastYaw) > 1e-6;
    lastCam.copy(camera.position);
    lastYaw = book.root.rotation.y;
    return moved;
  };

  // ------------------------------------------------------------ navigation

  const onSpreadChange = () => {
    try {
      history.replaceState(null, "", book.target ? `#${book.target}` : location.pathname + location.search);
    } catch {
      // sandboxed frames may refuse
    }
  };

  const go = (n: number) => {
    if (book.goTo(n, clock())) onSpreadChange();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented || ownsKey(e.target, e.key)) return;
    let n: number;
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
        n = book.target + 1;
        break;
      case "ArrowLeft":
      case "PageUp":
        n = book.target - 1;
        break;
      case "Home":
        n = 0;
        break;
      case "End":
        n = book.NI;
        break;
      default:
        return;
    }
    e.preventDefault();
    go(n);
  };

  const onHash = () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (Number.isFinite(n)) go(n);
  };

  const onVisibility = () => {
    if (document.hidden) pool.suspend();
  };

  // ------------------------------------------------------------ input

  const pointer = { x: 0, y: 0, inside: false };
  let lastEvent: { clientX: number; clientY: number } | null = null;
  let press: {
    id: number; x: number; y: number; side: number; hit: THREE.Vector3 | null; entry: number;
    moved: boolean; dragging: boolean;
  } | null = null;
  let hoveredFace = -1;

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const localRay = new THREE.Ray();
  const toLocal = new THREE.Matrix4();
  const topPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const trackPointer = (e: { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  // Point on the book's top plane, in book space, or null. Leaves the world ray in `raycaster`.
  const toBook = (e: { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    camera.updateMatrixWorld();
    raycaster.setFromCamera(ndc, camera);
    book.inner.updateWorldMatrix(true, false);
    toLocal.copy(book.inner.matrixWorld).invert();
    localRay.copy(raycaster.ray).applyMatrix4(toLocal);
    topPlane.constant = -book.T;
    return localRay.intersectPlane(topPlane, new THREE.Vector3());
  };

  // +1 right half, -1 left half, 0 off the book.
  const sideAt = (hit: THREE.Vector3 | null) => {
    if (!hit) return 0;
    const fp = book.footprint();
    if (Math.abs(hit.z) > book.Hc / 2 + 0.05) return 0;
    if (hit.x < fp.left - 0.05 || hit.x > fp.right + 0.05) return 0;
    return hit.x >= 0 ? 1 : -1;
  };

  // Contents entry under the ray toBook just cast (spread 1 only), or -1.
  const contentsEntry = () => {
    if (book.target !== 1 || book.busy) return -1;
    book.frontCover.updateWorldMatrix(true, false);
    const hit = raycaster.intersectObject(book.frontCover, false).find((i) => i.face?.materialIndex === 3);
    if (!hit?.uv) return -1;
    return contents.hitTest(1 - hit.uv.x, hit.uv.y);
  };

  const hover = () => {
    if (press || !pointer.inside || !lastEvent) return;
    const hit = toBook(lastEvent);
    const side = sideAt(hit);
    const entry = side < 0 ? contentsEntry() : -1;
    if (entry !== contents.hover) {
      contents.draw(entry);
      invalidate();
    }
    hoveredFace = side && !book.busy ? book.faceOn(side) : -1;
    if (hit && side && entry < 0 && !book.busy) {
      const k = side > 0 ? book.target : book.target - 1;
      const edge = Math.min(1, Math.abs(hit.x) / book.W);
      const lift = book.items[k]?.kind === "cover"
        ? 0.3 + 0.7 * THREE.MathUtils.smoothstep(edge, 0.3, 0.95) // a closed cover opens a crack anywhere on it
        : THREE.MathUtils.smoothstep(edge, 0.62, 0.97); // a page peels only near its outer edge
      if (k >= 0 && k < book.NI && lift > 0) book.setHover(k, lift, side);
      else book.setHover(-1);
    } else book.setHover(-1);
    canvas.style.cursor = entry >= 0 ? "pointer" : side ? "grab" : "default";
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || press) return;
    trackPointer(e);
    lastEvent = { clientX: e.clientX, clientY: e.clientY };
    const hit = toBook(e);
    const side = sideAt(hit);
    const entry = side < 0 ? contentsEntry() : -1;
    press = { id: e.pointerId, x: e.clientX, y: e.clientY, side, hit, entry, moved: false, dragging: false };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // capture is a nicety
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    pointer.inside = true;
    trackPointer(e);
    lastEvent = { clientX: e.clientX, clientY: e.clientY };
    if (!press || e.pointerId !== press.id) return;
    if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > CLICK_SLOP) {
      press.moved = true;
      if (press.side && press.hit) {
        const k = press.side > 0 ? book.target : book.target - 1;
        if (book.beginDrag(k, press.side, press.hit.x, press.hit.z, clock())) {
          press.dragging = true;
          hoveredFace = -1;
          canvas.style.cursor = "grabbing";
        }
      }
    }
    if (press.dragging) {
      const hit = toBook(e);
      if (hit) book.dragTo(hit.x, clock());
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!press || e.pointerId !== press.id) return;
    const p = press;
    press = null;
    if (p.dragging) {
      book.endDrag(clock());
      onSpreadChange();
      canvas.style.cursor = "grab";
    } else if (!p.moved && e.type === "pointerup") {
      if (p.entry >= 0) go(caseSpread(p.entry));
      else if (p.side) go(book.target + p.side);
    }
  };

  const onPointerLeave = () => {
    pointer.inside = false;
    hoveredFace = -1;
    if (!press) book.setHover(-1);
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("keydown", onKey);
  window.addEventListener("hashchange", onHash);
  document.addEventListener("visibilitychange", onVisibility);

  // ------------------------------------------------------------ media

  const updateMedia = () => {
    const visible = book.visibleFaces();
    const wanted = new Set<number>();
    for (let s = book.target - 1; s <= book.target + 1; s++) book.spreadFaces(s).forEach((id) => wanted.add(id));
    const playing = canHover ? new Set(hoveredFace >= 0 ? [hoveredFace] : []) : visible;
    pool.update(visible, wanted, playing);
  };

  // ------------------------------------------------------------ governor

  // Over every 90 rendered frames, drop the pixel ratio if frames run slow.
  const gov = { frames: 0, time: 0 };
  const govern = (dt: number) => {
    if (pixelRatio <= 1 || dt > 0.25) return;
    gov.frames++;
    gov.time += dt;
    if (gov.frames < 90) return;
    const avg = gov.time / gov.frames;
    gov.frames = 0;
    gov.time = 0;
    if (avg > 0.024) {
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      resize(true);
    }
  };

  // ------------------------------------------------------------ loop

  let isOpen = false;
  let raf = 0;
  let last = clock();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const t = clock();
    const dt = Math.min(0.05, t - last);
    last = t;

    resize();
    updateMedia();
    const bookChanged = book.update(t, dt);
    hover();

    const fp = book.footprint();
    blob.position.x = (fp.left + fp.right) / 2;
    blob.scale.set((fp.right - fp.left) * 1.28 + 0.1, book.Hc * 1.6, 1);

    const open = (book.target > 0 && book.target < book.NI) || book.openness > 0.5;
    if (open !== isOpen) {
      isOpen = open;
      o.onOpenChange(open);
    }

    const cameraMoved = placeCamera(dt);
    const videoPlaying = videoPages.some((v) => v.playing && v.ready);
    if (bookChanged || cameraMoved || videoPlaying || renderFrames > 0) {
      renderer.render(scene, camera);
      renderFrames = Math.max(0, renderFrames - 1);
      govern(dt);
    }
  };

  // 10. Deep link, first frame, ready
  const n = parseInt(location.hash.slice(1), 10);
  if (Number.isFinite(n) && n > 0) {
    book.jump(n);
    cam.open = book.openness;
  }
  onSpreadChange();
  resize();
  book.update(clock(), 0);
  frame();
  o.onReady();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", onHash);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    pool.dispose();
    contents.texture.dispose();
    disposeScene();
  };
}
