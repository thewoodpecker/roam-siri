import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const BODY_SIZE = 2;
const BODY_DEPTH = 0.16;
const BODY_BEVEL = 0.04;
const LOGO_EMBED = 0.014;
const SPIN_SPEED = 0.7;
const TAP_SPIN_DURATION = 0.38;
const DRAG_SENSITIVITY = 0.01;
const VIEW_HALF = 1.22;
const MARK_TARGET_WIDTH = 1.28;
/** Portfolio AppIcon3D roam body. */
const BODY_COLOR = '#1E1D20';
/** Exponential friction on fling velocity (higher = stops sooner). */
const FLING_FRICTION = 1.85;
/** Cap fling speed so a wild swipe doesn't spin forever. */
const MAX_FLING_SPEED = 28;
/** Soft release below this just resumes idle (no coast). */
const FLING_MIN = 1.1;
/** Above idle×this, apply friction; otherwise ease back to idle. */
const COAST_RATIO = 1.35;
/** Blend rate back into idle spin after a fling (1/s). */
const IDLE_BLEND = 3.2;

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

function shadeSmooth(geo, tolerance = 1e-4) {
  geo.deleteAttribute('normal');
  const welded = mergeVertices(geo, tolerance);
  if (welded !== geo) geo.dispose();
  welded.computeVertexNormals();
  return welded;
}

function squircleShape(size, n = 5, segments = 96) {
  const shape = new THREE.Shape();
  const r = size / 2;
  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI / 2 - (i / segments) * Math.PI * 2;
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const x = r * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = r * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function useBodyGeometry() {
  return useMemo(() => {
    let geo = new THREE.ExtrudeGeometry(squircleShape(BODY_SIZE, 5, 96), {
      depth: BODY_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.045,
      bevelOffset: 0,
      bevelSegments: 8,
      curveSegments: 12,
      steps: 1,
    });
    geo.center();
    geo = shadeSmooth(geo);
    geo.computeBoundingBox();
    return geo;
  }, []);
}

function FitOrthoCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    camera.manual = true;
    camera.left = -VIEW_HALF * aspect;
    camera.right = VIEW_HALF * aspect;
    camera.top = VIEW_HALF;
    camera.bottom = -VIEW_HALF;
    camera.zoom = 1;
    camera.near = 0.1;
    camera.far = 40;
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

/** Roam planet — three offset tubular rings in shiny gold. */
function RoamRings({ faceZ, includeLights = true }) {
  const tube = 0.95;
  const rings = [
    { cx: 27, cy: 21, R: 5 },
    { cx: 24, cy: 21, R: 8 },
    { cx: 21, cy: 21, R: 11.1 },
  ];
  const s = MARK_TARGET_WIDTH / 24;
  const tubeWorld = tube * s;
  const z = faceZ - LOGO_EMBED + tubeWorld;

  return (
    <>
      {includeLights && (
        <>
          <directionalLight position={[4, 5, 6]} intensity={2.6} color="#fff8e8" />
          <directionalLight position={[-4, 2, 3]} intensity={1.5} color="#ffd78a" />
          <pointLight position={[2.4, 3.5, 4.2]} intensity={2.8} distance={18} color="#fff8e8" />
          <pointLight position={[-3, 1.5, 3.5]} intensity={1.6} distance={16} color="#ffd78a" />
          <pointLight position={[0, -2, 5]} intensity={1.2} distance={14} color="#ffffff" />
        </>
      )}
      <group position={[0, 0, z]} scale={[s, s, s]} renderOrder={1}>
        <group position={[-21, 21, 0]}>
          {rings.map((r, i) => (
            <mesh key={i} position={[r.cx, -r.cy, 0]}>
              <torusGeometry args={[r.R, tube, 24, 96]} />
              <meshPhysicalMaterial
                color="#FFD56A"
                metalness={1}
                roughness={0}
                clearcoat={1}
                clearcoatRoughness={0}
                reflectivity={1}
                ior={1.5}
                specularIntensity={1}
                emissive="#B8860B"
                emissiveIntensity={0.06}
                flatShading={false}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

function IconMesh({ drag, rotationY, spinBurst, angularVel }) {
  const group = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const bodyGeo = useBodyGeometry();
  const bodyFront = bodyGeo.boundingBox?.max.z ?? BODY_DEPTH / 2;
  const faceZ = bodyFront - BODY_BEVEL * 0.85;

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
        // Leave a little residual speed so it doesn't hard-stop after a tap
        angularVel.current = SPIN_SPEED;
      }
    } else if (drag.current.active) {
      // Rotation is 1:1 with the pointer in the drag handlers
    } else if (!reduceMotion) {
      let v = angularVel.current;
      rotationY.current += v * clampedDt;

      if (Math.abs(v) > SPIN_SPEED * COAST_RATIO) {
        // Coast with friction — inherits the fling velocity
        v *= Math.exp(-FLING_FRICTION * clampedDt);
      } else {
        // Ease back into the gentle idle spin (also catches reverse flings)
        v += (SPIN_SPEED - v) * (1 - Math.exp(-IDLE_BLEND * clampedDt));
        if (Math.abs(v - SPIN_SPEED) < 0.02) v = SPIN_SPEED;
      }
      angularVel.current = v;
    }

    group.current.rotation.y = rotationY.current;
  });

  return (
    <group rotation={[0.14, 0, 0]}>
      <group ref={group}>
        <mesh geometry={bodyGeo}>
          <meshPhysicalMaterial
            color={BODY_COLOR}
            roughness={0.12}
            metalness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.08}
            reflectivity={0.9}
            flatShading={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <RoamRings faceZ={faceZ} />
        <group rotation={[0, Math.PI, 0]}>
          <RoamRings faceZ={faceZ} includeLights={false} />
        </group>
      </group>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3.2, 4.5, 5.5]} intensity={2.2} color="#fff8f2" />
      <directionalLight position={[-3.5, 1.2, 3]} intensity={0.9} color="#b0c8ff" />
      <directionalLight position={[0, 2, -4]} intensity={0.7} />
      <directionalLight position={[-1, -2, 4]} intensity={0.55} color="#ffe8d8" />
      <pointLight position={[1.5, 2, 3]} intensity={1.1} distance={10} color="#ffffff" />
      <pointLight position={[-2, 0.5, 2.5]} intensity={0.6} distance={8} color="#c8d8ff" />
    </>
  );
}

/** Interactive spinning Roam app icon — ported from portfolio AppIcon3D. */
export default function RoamIcon3D({
  className,
  size = 84,
  fadeDelay = 0,
  reveal = true,
  draggable = true,
}) {
  const reduceMotion = usePrefersReducedMotion();
  const drag = useRef({
    active: false,
    lastX: 0,
    lastT: 0,
    moved: false,
    /** Instantaneous angular velocity sample during drag (rad/s). */
    sampleV: 0,
  });
  const rotationY = useRef(0);
  const angularVel = useRef(SPIN_SPEED);
  const spinBurst = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const visible = canvasReady && reveal;

  const onPointerDown = useCallback((e) => {
    if (!draggable) return;
    // Grab mid-flight — kill tap burst / coast, take over from current speed
    spinBurst.current = null;
    drag.current = {
      active: true,
      lastX: e.clientX,
      lastT: performance.now(),
      moved: false,
      sampleV: angularVel.current,
    };
    angularVel.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
  }, [draggable]);

  const onPointerMove = useCallback((e) => {
    if (!draggable || !drag.current.active) return;
    const now = performance.now();
    const dx = e.clientX - drag.current.lastX;
    const dtMs = now - drag.current.lastT;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
    if (Math.abs(dx) > 0.5) drag.current.moved = true;
    rotationY.current += dx * DRAG_SENSITIVITY;
    // Track velocity from recent samples (ignore huge gaps / stalls)
    if (dtMs > 0 && dtMs < 64) {
      const instant = (dx * DRAG_SENSITIVITY) / (dtMs / 1000);
      drag.current.sampleV = drag.current.sampleV * 0.65 + instant * 0.35;
    }
  }, [draggable]);

  const endDrag = useCallback((e) => {
    if (!draggable || !drag.current.active) return;
    drag.current.active = false;
    // Fling: hand the tracked velocity to the physics loop
    let v = drag.current.sampleV;
    if (!Number.isFinite(v)) v = 0;
    v = Math.max(-MAX_FLING_SPEED, Math.min(MAX_FLING_SPEED, v));
    // Soft release → resume idle; a real fling coasts with friction
    angularVel.current = Math.abs(v) < FLING_MIN ? SPIN_SPEED : v;
    e.currentTarget.style.cursor = 'grab';
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [draggable]);

  const onClick = useCallback((e) => {
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
  }, [reduceMotion]);

  return (
    <div
      role="img"
      aria-label="Roam logo"
      className={className}
      style={{
        width: size,
        height: size,
        cursor: draggable ? 'grab' : undefined,
        touchAction: draggable ? 'none' : undefined,
        userSelect: 'none',
        opacity: visible ? 1 : 0,
        transition: `opacity 0.6s ease-out ${fadeDelay}ms`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={onClick}
    >
      <Canvas
        className="sc-roam-icon-canvas"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        orthographic
        camera={{ position: [0, 0, 10], near: 0.1, far: 40 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          requestAnimationFrame(() => setCanvasReady(true));
        }}
      >
        <FitOrthoCamera />
        <Lights />
        <IconMesh
          drag={drag}
          rotationY={rotationY}
          spinBurst={spinBurst}
          angularVel={angularVel}
        />
      </Canvas>
    </div>
  );
}
