import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RGLLights, RGL_VIEW_HALF } from './materials';

/** Match RoamIcon3D interaction constants so gifts feel identical. */
const SPIN_SPEED = 0.7;
const TAP_SPIN_DURATION = 0.38;
const DRAG_SENSITIVITY = 0.01;
const FLING_FRICTION = 1.85;
const MAX_FLING_SPEED = 28;
const FLING_MIN = 1.1;
const COAST_RATIO = 1.35;
const IDLE_BLEND = 3.2;
/** Look back this far for fling velocity — ignore the decelerating release tip. */
const FLING_SAMPLE_WINDOW_MS = 100;
/** No motion samples within this of pointer-up → soft release to idle. */
const FLING_STALE_MS = 80;
const FLING_SAMPLE_MAX = 24;

/** Peak |ω| from recent pointer samples (rad/s). Survives a slow release at the edge. */
function flingVelocityFromSamples(samples, now) {
  if (!samples.length) return 0;
  if (now - samples[samples.length - 1].t > FLING_STALE_MS) return 0;
  const cutoff = now - FLING_SAMPLE_WINDOW_MS;
  let best = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    if (b.t < cutoff) continue;
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0 || dt > 0.064) continue;
    const v = ((b.x - a.x) * DRAG_SENSITIVITY) / dt;
    if (Math.abs(v) > Math.abs(best)) best = v;
  }
  return best;
}

/** Slight look-down — softer than before, closer to the app-icon tip. */
const CAMERA_POS = [0, 0.85, 4.5];
const CAMERA_TARGET = [0, 0, 0];
/** Gentler tip than the icon's 0.14 so gifts read more front-facing. */
const SUBJECT_TIP = 0.06;

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

/** Orthographic camera fitted to the canvas — same frustum as RoamIcon3D. */
function FitOrthoCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    camera.manual = true;
    camera.left = -RGL_VIEW_HALF * aspect;
    camera.right = RGL_VIEW_HALF * aspect;
    camera.top = RGL_VIEW_HALF;
    camera.bottom = -RGL_VIEW_HALF;
    camera.zoom = 1;
    camera.near = 0.1;
    camera.far = 40;
    camera.position.set(...CAMERA_POS);
    camera.lookAt(...CAMERA_TARGET);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

/**
 * Y-axis turntable with the same physics as RoamIcon3D:
 * idle spin, 1:1 drag, fling with friction, tap-to-spin burst.
 */
function OrbitingSubject({ children, drag, rotationY, spinBurst, angularVel }) {
  const group = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  useFrame((_, dt) => {
    if (!group.current) return;
    const clampedDt = Math.min(dt, 0.05);
    const burst = spinBurst.current;

    if (burst) {
      burst.elapsed += clampedDt;
      const t = Math.min(1, burst.elapsed / burst.duration);
      const ease = t * t * (3 - 2 * t);
      rotationY.current = burst.start + burst.delta * ease;
      if (t >= 1) {
        spinBurst.current = null;
        angularVel.current = SPIN_SPEED;
      }
    } else if (drag.current.active) {
      // Rotation is 1:1 with the pointer in the drag handlers
    } else if (!reduceMotion) {
      let v = angularVel.current;
      rotationY.current += v * clampedDt;

      if (Math.abs(v) > SPIN_SPEED * COAST_RATIO) {
        v *= Math.exp(-FLING_FRICTION * clampedDt);
      } else {
        v += (SPIN_SPEED - v) * (1 - Math.exp(-IDLE_BLEND * clampedDt));
        if (Math.abs(v - SPIN_SPEED) < 0.02) v = SPIN_SPEED;
      }
      angularVel.current = v;
    }

    group.current.rotation.y = rotationY.current;
  });

  return (
    <group rotation={[SUBJECT_TIP, 0, 0]}>
      <group ref={group}>{children}</group>
    </group>
  );
}

/**
 * Shared RGL stage — orthographic canvas, icon lighting,
 * and the same drag / fling / tap-spin physics as RoamIcon3D.
 *
 * Pass interactive={false} for map decorations (idle spin only, no grab).
 */
export default function RGLStage({
  children,
  className,
  appearSpinKey = 0,
  appearTurns = 0,
  appearDuration = 1.1,
  interactive = true,
}) {
  const reduceMotion = usePrefersReducedMotion();
  const drag = useRef({
    active: false,
    lastX: 0,
    lastT: 0,
    moved: false,
    samples: [],
  });
  const rotationY = useRef(0.35);
  const angularVel = useRef(SPIN_SPEED);
  const spinBurst = useRef(null);
  const [ready, setReady] = useState(false);

  // Appear: N full Y turns over the bounce-in window, then resume idle spin.
  useEffect(() => {
    if (!appearSpinKey || !appearTurns || reduceMotion) return;
    angularVel.current = 0;
    spinBurst.current = {
      start: rotationY.current,
      delta: Math.PI * 2 * appearTurns,
      elapsed: 0,
      duration: appearDuration,
    };
  }, [appearSpinKey, appearTurns, appearDuration, reduceMotion]);

  const onPointerDown = useCallback((e) => {
    if (!interactive) return;
    spinBurst.current = null;
    const now = performance.now();
    drag.current = {
      active: true,
      lastX: e.clientX,
      lastT: now,
      moved: false,
      samples: [{ t: now, x: e.clientX }],
    };
    angularVel.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
  }, [interactive]);

  const onPointerMove = useCallback((e) => {
    if (!interactive || !drag.current.active) return;
    const now = performance.now();
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
    if (Math.abs(dx) > 0.5) drag.current.moved = true;
    rotationY.current += dx * DRAG_SENSITIVITY;
    const samples = drag.current.samples;
    samples.push({ t: now, x: e.clientX });
    if (samples.length > FLING_SAMPLE_MAX) samples.shift();
  }, [interactive]);

  const endDrag = useCallback((e) => {
    if (!interactive || !drag.current.active) return;
    drag.current.active = false;
    let v = flingVelocityFromSamples(drag.current.samples, performance.now());
    if (!Number.isFinite(v)) v = 0;
    v = Math.max(-MAX_FLING_SPEED, Math.min(MAX_FLING_SPEED, v));
    angularVel.current = Math.abs(v) < FLING_MIN ? SPIN_SPEED : v;
    e.currentTarget.style.cursor = 'grab';
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [interactive]);

  const onClick = useCallback(
    (e) => {
      if (!interactive) return;
      if (drag.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (reduceMotion) return;
      angularVel.current = 0;
      spinBurst.current = {
        start: rotationY.current,
        delta: Math.PI * 2,
        elapsed: 0,
        duration: TAP_SPIN_DURATION,
      };
    },
    [interactive, reduceMotion],
  );

  return (
    <div
      className={className}
      style={{
        cursor: interactive ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: interactive ? 'auto' : 'none',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.45s ease-out',
      }}
      onPointerDown={interactive ? onPointerDown : undefined}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerUp={interactive ? endDrag : undefined}
      onPointerCancel={interactive ? endDrag : undefined}
      onClick={interactive ? onClick : undefined}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        orthographic
        camera={{ position: CAMERA_POS, near: 0.1, far: 40, zoom: 1 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          requestAnimationFrame(() => setReady(true));
        }}
      >
        <FitOrthoCamera />
        <RGLLights />
        <OrbitingSubject
          drag={drag}
          rotationY={rotationY}
          spinBurst={spinBurst}
          angularVel={angularVel}
        >
          {children}
        </OrbitingSubject>
      </Canvas>
    </div>
  );
}
