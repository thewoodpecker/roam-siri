import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import type { CoinMark } from "./coinMarks.ts";
import { coinMarkSvg } from "./coinMarks.ts";
import {
  buildCoinMeshes,
  COIN_SCALE,
  COIN_TILT,
  COIN_YAW,
  createRoamRings,
  edgeMaterial,
  faceMaterial,
  markZ,
  reliefMaterial,
  strikeColor,
  viewHalf,
} from "./coinMesh.ts";
import { createCoinPlus } from "./coinPlus.ts";
import { createCoinSparks } from "./coinSparks.ts";
import { emojiEmbossGeometry } from "./emojiEmboss.ts";
import type { CoinShapeId } from "./shapes.ts";

interface Props {
  shape: CoinShapeId;
  /** CSS hex color from the Nebula palette. The strike matches it, except black and white. */
  color: string;
  mark: CoinMark | undefined;
  emoji: string;
  /** Repeated around the rim. Empty hides the legend. */
  name: string;
  /** A click, once the coin bottoms out and the sparks fly. `delay` is that wait, in seconds. */
  onTap: (delay: number) => Promise<void>;
  /** A flick that sends the coin spinning. */
  onFling: () => Promise<void>;
  /**
   * Swap scale for the coin mesh only. The preview used to CSS-scale the
   * whole canvas, which shrank sparks with the coin.
   */
  presentationScaleRef?: { current: number };
}

const isMesh = (
  obj: THREE.Object3D
): obj is THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> =>
  obj instanceof THREE.Mesh;

const addLightformer = (
  scene: THREE.Scene,
  intensity: number,
  color: string,
  position: [number, number, number],
  scale: [number, number],
  rotation?: [number, number, number]
) => {
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  material.color.multiplyScalar(intensity);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.scale.set(scale[0], scale[1], 1);
  mesh.position.set(position[0], position[1], position[2]);
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  scene.add(mesh);
};

/** Studio map the coin reflects. */
const studioEnvironment = (renderer: THREE.WebGLRenderer) => {
  const env = new THREE.Scene();
  addLightformer(env, 2.4, "#fff8f2", [0, 5.5, 1], [14, 10], [Math.PI / 2, 0, 0]);
  addLightformer(env, 1.8, "#ffffff", [5.5, 2.5, 4], [8, 10], [0, -Math.PI / 3, 0]);
  addLightformer(env, 1.35, "#c5d4ff", [-5.5, 1.5, 3], [7, 9], [0, Math.PI / 3, 0]);
  addLightformer(env, 0.9, "#ffe8d8", [0, 1, -6], [12, 6]);
  const ringMat = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  ringMat.color.multiplyScalar(0.55);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.5, 64), ringMat);
  ring.position.set(0, 0, 5);
  ring.scale.setScalar(4);
  ring.lookAt(0, 0, 0);
  env.add(ring);
  addLightformer(env, 1.7, "#e7ecf6", [0.2, 1.2, 5.4], [14, 9]);

  const tone = renderer.toneMapping;
  renderer.toneMapping = THREE.NoToneMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0, 0.1, 1000).texture;
  renderer.toneMapping = tone;
  pmrem.dispose();
  env.traverse((obj: THREE.Object3D) => {
    if (!isMesh(obj)) return;
    obj.geometry.dispose();
    if (Array.isArray(obj.material)) {
      for (const material of obj.material) material.dispose();
    } else {
      obj.material.dispose();
    }
  });
  return target;
};

/** Drag, fling, and idle spin. */
const DRAG_SENSITIVITY = 0.01;
const FLING_FRICTION = 1.55;
const MAX_FLING_SPEED = 32;
const FLING_MIN = 0.85;
const COAST_RATIO = 1.35;
const IDLE_BLEND = 3.2;
const FLING_SAMPLE_MS = 140;
const FLING_IGNORE_TAIL_MS = 40;
const FLING_WINDOW_MS = 90;
const IDLE_SPIN = 0.55;
const CLICK_SLOP = 6;
/** Press in, rise through an overshoot, then settle. */
const BOUNCE_DOWN_S = 0.12;
const BOUNCE_UP_S = 0.2;
const BOUNCE_SETTLE_S = 0.24;
const BOUNCE_LOW = 0.82;
const BOUNCE_PEAK = 1.1;
const BOUNCE_END_S = BOUNCE_DOWN_S + BOUNCE_UP_S + BOUNCE_SETTLE_S;
const REVEAL_MS = 500;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const smoothStep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** 1 at rest. Presses down, eases past 1, then settles. */
const bounceScale = (t: number) => {
  if (t < BOUNCE_DOWN_S) return 1 + (BOUNCE_LOW - 1) * (t / BOUNCE_DOWN_S) ** 2;
  if (t < BOUNCE_DOWN_S + BOUNCE_UP_S) {
    const p = easeOutCubic((t - BOUNCE_DOWN_S) / BOUNCE_UP_S);
    return BOUNCE_LOW + (BOUNCE_PEAK - BOUNCE_LOW) * p;
  }
  if (t < BOUNCE_END_S) {
    const p = smoothStep((t - BOUNCE_DOWN_S - BOUNCE_UP_S) / BOUNCE_SETTLE_S);
    return BOUNCE_PEAK + (1 - BOUNCE_PEAK) * p;
  }
  return 1;
};

type PointerSample = { t: number; x: number };

const flingVelocity = (samples: PointerSample[]) => {
  const latest = samples[samples.length - 1];
  const earliest = samples[0];
  if (!latest || !earliest || samples.length < 2) return 0;
  const endCutoff = latest.t - FLING_IGNORE_TAIL_MS;
  let end = latest;
  for (let i = samples.length - 1; i >= 0; i--) {
    const sample = samples[i];
    if (sample && sample.t <= endCutoff) {
      end = sample;
      break;
    }
  }
  const startCutoff = end.t - FLING_WINDOW_MS;
  let start = earliest;
  for (const sample of samples) {
    if (sample.t <= startCutoff) start = sample;
    else break;
  }
  const dt = (end.t - start.t) / 1000;
  if (dt < 0.012) return 0;
  return ((end.x - start.x) * DRAG_SENSITIVITY) / dt;
};

const pruneSamples = (samples: PointerSample[], now: number) => {
  const cutoff = now - FLING_SAMPLE_MS;
  while (samples.length > 1) {
    const oldest = samples[0];
    if (!oldest || oldest.t >= cutoff) break;
    samples.shift();
  }
};

const coast = (velocity: number, dt: number) => {
  const coastThreshold = Math.max(Math.abs(IDLE_SPIN), 0.05) * COAST_RATIO;
  if (Math.abs(velocity) > coastThreshold) return velocity * Math.exp(-FLING_FRICTION * dt);
  const next = velocity + (IDLE_SPIN - velocity) * (1 - Math.exp(-IDLE_BLEND * dt));
  return Math.abs(next - IDLE_SPIN) < 0.02 ? IDLE_SPIN : next;
};

/** Extruded coin. Drag spins it, and a flick keeps going. */
export const CoinStage = ({
  shape,
  color,
  mark,
  emoji,
  name,
  onTap,
  onFling,
  presentationScaleRef,
}: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({
    shape,
    color,
    mark,
    emoji,
    name,
    onTap,
    onFling,
    presentationScaleRef,
  });
  const kickRef = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    propsRef.current = {
      shape,
      color,
      mark,
      emoji,
      name,
      onTap,
      onFling,
      presentationScaleRef,
    };
    kickRef.current();
  }, [color, emoji, mark, name, onFling, onTap, presentationScaleRef, shape]);

  useEffect(() => {
    const host = hostRef.current;
    const win = host?.ownerDocument.defaultView;
    if (!host || !win) return;

    let frame = 0;
    let disposed = false;
    const yaw = { y: COIN_YAW };
    let velocity = IDLE_SPIN;
    let dragging = false;
    let pointerId = -1;
    const samples: PointerSample[] = [];
    let visible = true;
    let motionUntil = 0;
    const reduceMq = win.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reduceMq.matches;
    if (reduce) velocity = 0;
    let kick = () => {};

    const fail = () => {
      if (!disposed) setFailed(true);
    };

    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      const canvas = renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.opacity = "0";
      canvas.style.transition = `opacity ${REVEAL_MS}ms ease`;
      host.appendChild(canvas);

      const half = viewHalf();
      const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 40);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      const scene = new THREE.Scene();
      // Fill lights stay dim so the studio map reads.
      const envIntensity = 1;
      const fillScale = envIntensity * 0.22;
      scene.environmentIntensity = envIntensity;

      scene.add(new THREE.AmbientLight(0xffffff, 0.4 * fillScale));
      const key = new THREE.DirectionalLight(0xfff8f2, 2.2);
      key.position.set(3.2, 4.5, 5.5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xb0c8ff, 0.85 * fillScale);
      fill.position.set(-3.5, 1.2, 3);
      scene.add(fill);
      const back = new THREE.DirectionalLight(0xffffff, 0.55 * fillScale);
      back.position.set(0, 2, -4);
      scene.add(back);
      const bounce = new THREE.DirectionalLight(0xffe8d8, 0.45 * fillScale);
      bounce.position.set(-1, -2, 4);
      scene.add(bounce);
      const point = new THREE.PointLight(0xffffff, 0.9 * fillScale, 10);
      point.position.set(1.5, 2, 3);
      scene.add(point);

      const tilt = new THREE.Group();
      tilt.rotation.x = COIN_TILT;
      scene.add(tilt);
      const sparks = createCoinSparks({ spread: "glitter" });
      const plus = createCoinPlus(host.ownerDocument, 100);
      const sparkRoot = new THREE.Group();
      // Undo the stage tilt so a circular burst stays circular on screen.
      sparkRoot.scale.set(COIN_SCALE, COIN_SCALE / Math.cos(COIN_TILT), COIN_SCALE);
      sparkRoot.add(sparks.object);
      tilt.add(sparkRoot);
      tilt.add(plus.object);
      const spin = new THREE.Group();
      spin.rotation.y = yaw.y;
      spin.scale.setScalar(COIN_SCALE);
      tilt.add(spin);

      const face = faceMaterial(propsRef.current.color);
      const edge = edgeMaterial();
      const relief = reliefMaterial();
      const owned: THREE.BufferGeometry[] = [];

      let builtKey = "";

      const resize = () => {
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        const ratio = Math.min(win.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(ratio);
        renderer.setSize(width, height, false);
        const aspect = width / height;
        const rootPx = Number.parseFloat(getComputedStyle(host).fontSize) || 16;
        const coinBox = 15 * rootPx;
        const view = viewHalf() * (height / coinBox);
        camera.left = -view * aspect;
        camera.right = view * aspect;
        camera.top = view;
        camera.bottom = -view;
        camera.updateProjectionMatrix();
        const headerPx = Math.max(0, height - coinBox);
        tilt.position.y = -((headerPx / 2) * (2 * view)) / height;
      };

      const rebuild = () => {
        const next = propsRef.current;
        const signature = `${next.shape}|${next.mark?.id ?? ""}|${next.emoji}|${next.name}`;
        face.color.set(next.color);
        relief.color.set(strikeColor(next.color));
        if (signature === builtKey && spin.children.length) return;
        builtKey = signature;
        spin.clear();
        for (const geo of owned) geo.dispose();
        owned.length = 0;

        const roam = next.mark?.id === "roam" && !next.emoji;
        const svg = next.emoji || !next.mark || roam ? undefined : coinMarkSvg(next.mark);
        const data = buildCoinMeshes(next.shape, svg, next.name);
        const emojiGeo = next.emoji ? emojiEmbossGeometry(next.emoji, host.ownerDocument) : null;
        owned.push(data.body, data.reeds, data.rim);
        if (data.mark) owned.push(data.mark);
        if (emojiGeo) owned.push(emojiGeo);
        if (data.legend) owned.push(data.legend);

        spin.add(new THREE.Mesh(data.body, face));
        spin.add(new THREE.Mesh(data.reeds, face));
        spin.add(new THREE.Mesh(data.rim, edge));

        if (roam) {
          const placeRings = (flip: boolean) => {
            const { root, geos } = createRoamRings(
              data.faceZ,
              data.markScale,
              data.markOffsetY,
              relief
            );
            for (const geo of geos) owned.push(geo);
            if (!flip) {
              spin.add(root);
              return;
            }
            const backFace = new THREE.Group();
            backFace.rotation.y = Math.PI;
            backFace.add(root);
            spin.add(backFace);
          };
          placeRings(false);
          placeRings(true);
        }

        const strike = data.mark ?? emojiGeo;
        if (strike) {
          const place = (flip: boolean) => {
            const group = new THREE.Group();
            group.position.y = data.markOffsetY;
            group.scale.set(data.markScale, data.markScale, 1);
            if (flip) group.rotation.y = Math.PI;
            const mesh = new THREE.Mesh(strike, relief);
            mesh.position.z = markZ(data.faceZ, strike);
            group.add(mesh);
            spin.add(group);
          };
          place(false);
          place(true);
        }

        if (data.legend) {
          const front = new THREE.Mesh(data.legend, relief);
          front.position.z = data.faceZ;
          spin.add(front);
          const backFace = new THREE.Group();
          backFace.rotation.y = Math.PI;
          const backLegend = new THREE.Mesh(data.legend, relief);
          backLegend.position.z = data.faceZ;
          backFace.add(backLegend);
          spin.add(backFace);
        }
      };

      const observer = new win.ResizeObserver(resize);
      observer.observe(host);
      resize();
      const envMap = studioEnvironment(renderer);
      scene.environment = envMap;
      for (const material of [face, edge, relief]) {
        material.envMap = envMap;
        material.needsUpdate = true;
      }
      rebuild();

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let coinPress = false;
      let pressX = 0;
      let pressY = 0;
      let bounceT = -1;
      let sparked = false;

      const hitCoin = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObject(spin, true).length > 0;
      };

      const startBounce = () => {
        bounceT = 0;
        sparked = false;
      };

      const onDown = (event: PointerEvent) => {
        if (dragging) return;
        dragging = true;
        kick();
        velocity = 0;
        pointerId = event.pointerId;
        coinPress = hitCoin(event);
        pressX = event.clientX;
        pressY = event.clientY;
        const now = performance.now();
        samples.length = 0;
        samples.push({ t: now, x: event.clientX });
        try {
          host.setPointerCapture(event.pointerId);
        } catch {
          // The pointer may already be gone. Window listeners still track the flick.
        }
      };
      const onMove = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        if (Math.hypot(event.clientX - pressX, event.clientY - pressY) > CLICK_SLOP) {
          coinPress = false;
        }
        const now = performance.now();
        const last = samples[samples.length - 1];
        if (last) yaw.y += (event.clientX - last.x) * DRAG_SENSITIVITY;
        samples.push({ t: now, x: event.clientX });
        pruneSamples(samples, now);
      };
      const onUp = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        pointerId = -1;
        const now = performance.now();
        samples.push({ t: now, x: event.clientX });
        pruneSamples(samples, now);
        let next = flingVelocity(samples);
        if (!Number.isFinite(next)) next = 0;
        next = Math.max(-MAX_FLING_SPEED, Math.min(MAX_FLING_SPEED, next));
        velocity = Math.abs(next) < FLING_MIN ? IDLE_SPIN : next;
        const tapped = coinPress && event.type !== "pointercancel";
        if (tapped) {
          velocity = IDLE_SPIN;
          startBounce();
          propsRef.current.onTap(BOUNCE_DOWN_S).catch(() => {
            // Playback can fail if the audio device is unavailable.
          });
        } else if (Math.abs(velocity) >= FLING_MIN) {
          propsRef.current.onFling().catch(() => {
            // Playback can fail if the audio device is unavailable.
          });
        }
        coinPress = false;
        if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
      };
      host.addEventListener("pointerdown", onDown);
      win.addEventListener("pointermove", onMove);
      win.addEventListener("pointerup", onUp);
      win.addEventListener("pointercancel", onUp);

      let last = performance.now();
      let revealed = false;
      const tick = (now: number) => {
        if (disposed) return;
        const away = document.hidden || !visible;
        if (away && revealed) {
          frame = 0;
          last = now;
          return;
        }
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        try {
          rebuild();
          if (!dragging && !reduce) {
            yaw.y += velocity * dt;
            velocity = coast(velocity, dt);
          }
          if (bounceT >= 0) {
            bounceT += dt;
            if (!sparked && bounceT >= BOUNCE_DOWN_S) {
              sparked = true;
              sparks.burst(strikeColor(propsRef.current.color));
              motionUntil = performance.now() + 1700;
            }
            if (bounceT >= BOUNCE_END_S) bounceT = -1;
          }
          const presentation = propsRef.current.presentationScaleRef?.current ?? 1;
          const bounce = bounceT >= 0 ? bounceScale(bounceT) : 1;
          spin.scale.setScalar(COIN_SCALE * bounce * presentation);
          sparks.update(dt);
          plus.update(dt);
          spin.rotation.y = yaw.y;
          renderer.render(scene, camera);
          if (!revealed) {
            revealed = true;
            win.requestAnimationFrame(() => {
              if (!disposed) canvas.style.opacity = "1";
            });
          }
        } catch {
          fail();
          return;
        }
        const quiet = reduce && !dragging && bounceT < 0 && performance.now() > motionUntil;
        frame = away || quiet ? 0 : win.requestAnimationFrame(tick);
      };
      kick = () => {
        if (disposed || frame) return;
        last = performance.now();
        frame = win.requestAnimationFrame(tick);
      };
      kickRef.current = kick;

      const io = new win.IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
      }, { rootMargin: "180px 0px" });
      io.observe(host);
      const onReduce = () => {
        reduce = reduceMq.matches;
        if (reduce) velocity = 0;
        kick();
      };
      reduceMq.addEventListener("change", onReduce);
      const onPage = () => {
        if (!document.hidden) kick();
      };
      document.addEventListener("visibilitychange", onPage);
      kick();

      return () => {
        disposed = true;
        kickRef.current = () => {};
        win.cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        reduceMq.removeEventListener("change", onReduce);
        document.removeEventListener("visibilitychange", onPage);
        host.removeEventListener("pointerdown", onDown);
        win.removeEventListener("pointermove", onMove);
        win.removeEventListener("pointerup", onUp);
        win.removeEventListener("pointercancel", onUp);
        for (const geo of owned) geo.dispose();
        face.dispose();
        edge.dispose();
        relief.dispose();
        sparks.dispose();
        plus.dispose();
        scene.environment?.dispose();
        renderer.dispose();
        canvas.remove();
      };
    } catch {
      fail();
    }
  }, []);

  return (
    <div className="coinery-stage-host" ref={hostRef} aria-hidden={failed}>
      {failed ? <div className="coinery-stage-fallback" style={{ background: color }} /> : null}
    </div>
  );
};
