import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  COIN_SCALE,
  COIN_TILT,
  COIN_YAW,
  buildCoinMeshes,
  edgeMaterial,
  faceMaterial,
  markZ,
  reliefMaterial,
  strikeColor,
  viewHalf,
} from './coin/coinMesh.ts';
import { createCoinSparks } from './coin/coinSparks.ts';
import { COIN_MARKS, coinMarkSvg } from './coin/coinMarks.ts';

/** Coinery default gold, with the star the award coins show. */
const COIN_COLOR = '#FFCA28';
const STAR = COIN_MARKS.find((mark) => mark.id === 'star');
const SOUND_URL = '/sounds/its-a-win.mp3';

/** How far the camera pulls back so the spark burst fits around the coin. */
const SPARK_FRAME = 2.05;
/** One full turn while the coin appears. */
const FLIP_DURATION = 0.8;
const SIZE = 280;

const easeInOut = (t) => (
  t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
);

/** Hold the landed coin long enough to see the flip, then leave. */
const EXIT_START = 0.95;
const EXIT_DURATION = 0.4;
const ENTRANCE_SCALE = 0.34;
/** Scale grow + settle. Receive mode holds for 3s after this, then shrinks. */
const ENTRANCE_SETTLE = 0.42 + 0.24;
const RECEIVE_HOLD = 3;
const RECEIVE_EXIT_START = ENTRANCE_SETTLE + RECEIVE_HOLD;
/** Steady Y spin once the entrance flip has landed. One turn per this many seconds. */
const HOLD_SPIN_PERIOD = 2.2;
/** Name badge is bottom: 12px and ~28px tall; keep a 12px gap above it. */
const CAPTION_LIFT = 52;

/** Fade in, overshoot, settle, then scale back down with the exit. */
const appearScale = (t, exitStart = EXIT_START) => {
  const grow = 0.42;
  const settle = 0.24;
  if (t < grow) return ENTRANCE_SCALE + (1.12 - ENTRANCE_SCALE) * easeInOut(t / grow);
  if (t < grow + settle) return 1.12 + (1 - 1.12) * easeInOut((t - grow) / settle);
  if (t < exitStart) return 1;
  if (t < exitStart + EXIT_DURATION) {
    const p = (t - exitStart) / EXIT_DURATION;
    return 1 + (ENTRANCE_SCALE - 1) * easeInOut(p);
  }
  return ENTRANCE_SCALE;
};

const flipYaw = (t, receive = false) => {
  const p = Math.min(1, t / FLIP_DURATION);
  let yaw = COIN_YAW + Math.PI * 2 * easeInOut(p);
  if (receive && t > FLIP_DURATION) {
    yaw += ((t - FLIP_DURATION) / HOLD_SPIN_PERIOD) * Math.PI * 2;
  }
  return yaw;
};

const appearOpacity = (t, exitStart = EXIT_START) => {
  if (t < 0.2) return easeInOut(t / 0.2);
  if (t < exitStart) return 1;
  if (t < exitStart + EXIT_DURATION) return 1 - easeInOut((t - exitStart) / EXIT_DURATION);
  return 0;
};

const lifeFor = (exitStart) => exitStart + EXIT_DURATION + 0.08;

/** Coinery "+N" rise. The exit fade is ease-in-out over the coin's leave. */
const PLUS_RISE = 0.61;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const plusPose = (t, exitStart = EXIT_START) => {
  let rise = 1;
  let opacity = 1;
  if (t < PLUS_RISE) {
    const p = easeOutCubic(t / PLUS_RISE);
    rise = p;
    opacity = Math.min(1, p * 1.35);
  }
  if (t >= exitStart) {
    const p = Math.min(1, (t - exitStart) / EXIT_DURATION);
    opacity *= 1 - easeInOut(p);
  }
  return { opacity, rise };
};

let audioCtx;
let clipPromise;

const loadClip = () => {
  if (clipPromise) return clipPromise;
  clipPromise = (async () => {
    const ctx = audioCtx || new AudioContext({ latencyHint: 'interactive' });
    audioCtx = ctx;
    const response = await fetch(SOUND_URL);
    if (!response.ok) throw new Error('coin sound');
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
    const data = buffer.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i += 32) {
      const level = Math.abs(data[i]);
      if (level > peak) peak = level;
    }
    const threshold = Math.max(0.008, peak * 0.03);
    let start = 0;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) >= threshold) {
        start = i;
        break;
      }
    }
    const offset = Math.max(0, start / buffer.sampleRate - 0.02);
    return { ctx, buffer, offset };
  })().catch((err) => {
    clipPromise = null;
    throw err;
  });
  return clipPromise;
};

/** Warm the click sting before the first drop. */
export const preloadAwardSound = () => {
  if (typeof AudioContext === 'undefined') return;
  loadClip().catch(() => {});
};

const playAwardSound = async () => {
  try {
    const { ctx, buffer, offset } = await loadClip();
    if (ctx.state === 'suspended') await ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0, offset);
  } catch {
    // Playback can fail if the audio device is unavailable.
  }
};

const addLightformer = (scene, intensity, color, position, scale, rotation) => {
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
  return mesh;
};

const studioEnvironment = (renderer) => {
  const env = new THREE.Scene();
  const temps = [];
  temps.push(addLightformer(env, 2.4, '#fff8f2', [0, 5.5, 1], [14, 10], [Math.PI / 2, 0, 0]));
  temps.push(addLightformer(env, 1.8, '#ffffff', [5.5, 2.5, 4], [8, 10], [0, -Math.PI / 3, 0]));
  temps.push(addLightformer(env, 1.35, '#c5d4ff', [-5.5, 1.5, 3], [7, 9], [0, Math.PI / 3, 0]));
  temps.push(addLightformer(env, 0.9, '#ffe8d8', [0, 1, -6], [12, 6]));
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  ringMat.color.multiplyScalar(0.55);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.5, 64), ringMat);
  ring.position.set(0, 0, 5);
  ring.scale.setScalar(4);
  ring.lookAt(0, 0, 0);
  env.add(ring);
  temps.push(addLightformer(env, 1.7, '#e7ecf6', [0.2, 1.2, 5.4], [14, 9]));

  const tone = renderer.toneMapping;
  renderer.toneMapping = THREE.NoToneMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0, 0.1, 1000).texture;
  renderer.toneMapping = tone;
  pmrem.dispose();
  ring.geometry.dispose();
  ringMat.dispose();
  for (const mesh of temps) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  return target;
};

/**
 * One-shot of the coinery click: the 3D coin fades and scales in,
 * sparks burst behind it, and the click sting plays at the same moment.
 *
 * `receive` is the person who was sent the coins. The same entrance plays,
 * then the coin keeps turning and the caption stays up for RECEIVE_HOLD
 * seconds before the shared shrink. Sender bursts leave at EXIT_START.
 */
export default function AwardCoinBurst({
  x,
  y,
  count = 1,
  onDone,
  receive = false,
  caption = '',
  captionHost = null,
}) {
  const hostRef = useRef(null);
  const labelRef = useRef(null);
  const captionRef = useRef(null);
  const captionHostRef = useRef(captionHost);
  captionHostRef.current = captionHost;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let frame = 0;
    let disposed = false;
    const owned = [];

    const finish = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      onDoneRef.current?.();
    };

    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      const canvas = renderer.domElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.opacity = '0';
      host.appendChild(canvas);

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(ratio);
      renderer.setSize(SIZE, SIZE, false);

      const half = viewHalf() * SPARK_FRAME;
      const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 40);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);

      const scene = new THREE.Scene();
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

      const sparks = createCoinSparks();
      const sparkRoot = new THREE.Group();
      sparkRoot.scale.set(COIN_SCALE, COIN_SCALE / Math.cos(COIN_TILT), COIN_SCALE);
      sparkRoot.add(sparks.object);
      tilt.add(sparkRoot);

      const spin = new THREE.Group();
      spin.rotation.y = COIN_YAW;
      spin.scale.setScalar(COIN_SCALE * 0.34);
      tilt.add(spin);

      const face = faceMaterial(COIN_COLOR);
      const edge = edgeMaterial();
      const relief = reliefMaterial();
      relief.color.set(strikeColor(COIN_COLOR));
      const envMap = studioEnvironment(renderer);
      scene.environment = envMap;
      for (const material of [face, edge, relief]) {
        material.envMap = envMap;
        material.needsUpdate = true;
      }

      const svg = STAR ? coinMarkSvg(STAR) : undefined;
      const data = buildCoinMeshes('circle', svg, '');
      owned.push(data.body, data.reeds, data.rim);
      if (data.mark) owned.push(data.mark);
      if (data.legend) owned.push(data.legend);
      const addCoin = (mesh) => {
        mesh.renderOrder = 1;
        spin.add(mesh);
      };
      addCoin(new THREE.Mesh(data.body, face));
      addCoin(new THREE.Mesh(data.reeds, face));
      addCoin(new THREE.Mesh(data.rim, edge));
      if (data.mark) {
        const place = (flip) => {
          const group = new THREE.Group();
          group.position.y = data.markOffsetY;
          group.scale.set(data.markScale, data.markScale, 1);
          if (flip) group.rotation.y = Math.PI;
          const mesh = new THREE.Mesh(data.mark, relief);
          mesh.renderOrder = 1;
          mesh.position.z = markZ(data.faceZ, data.mark);
          group.add(mesh);
          spin.add(group);
        };
        place(false);
        place(true);
      }

      sparks.burst(strikeColor(COIN_COLOR));
      playAwardSound();

      const exitStart = receive ? RECEIVE_EXIT_START : EXIT_START;
      const life = lifeFor(exitStart);
      let last = performance.now();
      const started = last;
      const tick = (now) => {
        if (disposed) return;
        if (document.hidden) {
          last = now;
          frame = requestAnimationFrame(tick);
          return;
        }
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = (now - started) / 1000;
        spin.rotation.y = flipYaw(t, receive);
        spin.scale.setScalar(COIN_SCALE * appearScale(t, exitStart));
        const opacity = appearOpacity(t, exitStart);
        canvas.style.opacity = String(opacity);
        const label = labelRef.current;
        if (label) {
          const pose = plusPose(t, exitStart);
          const bottom = 10 + 62 * pose.rise;
          label.style.opacity = String(pose.opacity);
          label.style.transform = `translate(-50%, calc(-100% - ${bottom}px))`;
        }
        const captionEl = captionRef.current;
        const tile = captionHostRef.current;
        if (captionEl && tile) {
          const rect = tile.getBoundingClientRect();
          captionEl.style.opacity = String(opacity);
          captionEl.style.left = `${rect.left + rect.width / 2}px`;
          captionEl.style.bottom = `${window.innerHeight - rect.bottom + CAPTION_LIFT}px`;
        }
        sparks.update(dt);
        renderer.render(scene, camera);
        if (t >= life) {
          finish();
          return;
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);

      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        for (const geo of owned) geo.dispose();
        face.dispose();
        edge.dispose();
        relief.dispose();
        sparks.dispose();
        envMap.dispose();
        renderer.dispose();
        canvas.remove();
      };
    } catch (err) {
      console.error('[award coin]', err);
      const exitStart = receive ? RECEIVE_EXIT_START : EXIT_START;
      const timer = window.setTimeout(finish, lifeFor(exitStart) * 1000);
      return () => {
        disposed = true;
        window.clearTimeout(timer);
      };
    }
  }, [receive]);

  return (
    <div
      ref={hostRef}
      className="awards-burst"
      style={{ left: x - SIZE / 2, top: y - SIZE / 2, width: SIZE, height: SIZE }}
      aria-hidden="true"
    >
      <div ref={labelRef} className="awards-plus">{`+${count}`}</div>
      {receive && caption ? (
        <div ref={captionRef} className="gesture-waiting-message awards-receive-caption">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
