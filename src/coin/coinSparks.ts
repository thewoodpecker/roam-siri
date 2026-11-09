import * as THREE from "three";

/** Sparks born from a single click. */
const BURST_COUNT = 168;
/** Later clicks fill free slots, so earlier sparks keep flying. */
const SPARK_COUNT = BURST_COUNT * 12;
/** Outer reach in coin radii. Twice the previous burst. */
const MAX_RADIUS = 2.92;

const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Four-point glint. Equal axes so it reads as a spark, not a streak. */
const sparkGeometry = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array([
        0, 0, 0, 0.5, 0, 0, 0.16, 0.16, 0, 0, 0.5, 0, -0.16, 0.16, 0, -0.5, 0, 0, -0.16, -0.16, 0,
        0, -0.5, 0, 0.16, -0.16, 0,
      ]),
      3
    )
  );
  geometry.setAttribute(
    "hot",
    new THREE.BufferAttribute(new Float32Array([1, 0, 0.35, 0, 0.35, 0, 0.35, 0, 0.35]), 1)
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7, 0, 7, 8, 0, 8, 1]);
  return geometry;
};

const sparkMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: `
      attribute float hot;
      varying float vHot;
      varying vec3 vColor;
      void main() {
        vHot = hot;
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(1.0);
        #endif
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vHot;
      varying vec3 vColor;
      void main() {
        vec3 col = mix(vColor, vec3(1.0), vHot * 0.9);
        float alpha = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    // Normal blending with straight alpha. Additive blending writes color
    // into a clear canvas and the page composite throws it away.
    transparent: true,
    premultipliedAlpha: false,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });

export interface CoinSparks {
  object: THREE.Object3D;
  burst: (color: string) => void;
  update: (dt: number) => void;
  dispose: () => void;
}

/** Small hard sparks. Crisp glints, not streaks or soft sprites. */
export const createCoinSparks = (): CoinSparks => {
  const geometry = sparkGeometry();
  const material = sparkMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, SPARK_COUNT);
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.renderOrder = -1;
  const color = new THREE.Color();
  mesh.setColorAt(0, color);

  const angle = new Float32Array(SPARK_COUNT);
  const drift = new Float32Array(SPARK_COUNT);
  const startR = new Float32Array(SPARK_COUNT);
  const endR = new Float32Array(SPARK_COUNT);
  const side = new Float32Array(SPARK_COUNT);
  const lifeDur = new Float32Array(SPARK_COUNT);
  const startAt = new Float32Array(SPARK_COUNT);
  const size = new Float32Array(SPARK_COUNT);
  const spin = new Float32Array(SPARK_COUNT);
  const spinSpeed = new Float32Array(SPARK_COUNT);
  const tint = new Float32Array(SPARK_COUNT * 3);
  const dummy = new THREE.Object3D();
  const fadeColor = new THREE.Color();
  let elapsed = 0;
  let playing = false;
  let cursor = 0;

  const free = (index: number) => {
    const dur = lifeDur[index] ?? 0;
    if (dur === 0) return true;
    return elapsed >= (startAt[index] ?? 0) + dur;
  };

  const takeSlot = () => {
    for (let scan = 0; scan < SPARK_COUNT; scan++) {
      const index = (cursor + scan) % SPARK_COUNT;
      if (!free(index)) continue;
      cursor = (index + 1) % SPARK_COUNT;
      return index;
    }
    const index = cursor;
    cursor = (cursor + 1) % SPARK_COUNT;
    return index;
  };

  const burst = (next: string) => {
    color.set(next);
    for (let n = 0; n < BURST_COUNT; n++) {
      const i = takeSlot();
      const glint = Math.random() < 0.18;
      const near = Math.random() < 0.4;
      angle[i] = Math.random() * Math.PI * 2;
      drift[i] = (Math.random() - 0.5) * 0.9;
      endR[i] = near ? 1.76 + Math.random() * 0.56 : 2.2 + Math.random() * 0.72;
      startR[i] = 0.55 + Math.random() * 0.4;
      if ((startR[i] ?? 0) > (endR[i] ?? 0)) startR[i] = (endR[i] ?? 1) * 0.75;
      side[i] = (Math.random() - 0.5) * 1.1;
      startAt[i] = elapsed + Math.random() * 0.32;
      lifeDur[i] = 0.7 + Math.random() * 0.8;
      // Coinery glints are ~0.016–0.08, about a pixel on this pulled-back
      // 280px canvas. Draw the same shape large enough to read as a halo.
      size[i] = glint ? 0.55 + Math.random() * 0.28 : 0.3 + Math.random() * 0.18;
      spin[i] = Math.random() * Math.PI * 2;
      spinSpeed[i] = (Math.random() - 0.5) * 3.2;
      tint[i * 3] = color.r;
      tint[i * 3 + 1] = color.g;
      tint[i * 3 + 2] = color.b;
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    playing = true;
    mesh.visible = true;
  };

  const update = (dt: number) => {
    if (!playing) return;
    elapsed += dt;
    let anyVisible = false;

    for (let i = 0; i < SPARK_COUNT; i++) {
      const start = startAt[i] ?? 0;
      const dur = lifeDur[i] ?? 0;
      const life = elapsed - start;
      if (life <= 0 || life >= dur) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, color);
        continue;
      }

      const local = life / dur;
      const eased = easeOutCubic(local);
      const theta = (angle[i] ?? 0) + (drift[i] ?? 0) * eased;
      const radius = (startR[i] ?? 0.7) + ((endR[i] ?? 1) - (startR[i] ?? 0.7)) * eased;
      const slip = (side[i] ?? 0) * eased;
      let x = Math.cos(theta) * radius - Math.sin(theta) * slip;
      let y = Math.sin(theta) * radius + Math.cos(theta) * slip;
      const dist = Math.hypot(x, y);
      if (dist > MAX_RADIUS) {
        x *= MAX_RADIUS / dist;
        y *= MAX_RADIUS / dist;
      }
      dummy.position.set(x, y, -0.22);
      dummy.rotation.set(0, 0, (spin[i] ?? 0) + local * (spinSpeed[i] ?? 0));
      const pop = Math.sin(local * Math.PI);
      const scale = (size[i] ?? 0.04) * (0.55 + pop);
      dummy.scale.set(scale, scale, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const fade = local < 0.55 ? 1 : 1 - easeInCubic((local - 0.55) / 0.45);
      fadeColor.setRGB(tint[i * 3] ?? 1, tint[i * 3 + 1] ?? 1, tint[i * 3 + 2] ?? 1);
      fadeColor.multiplyScalar(fade);
      mesh.setColorAt(i, fadeColor);
      anyVisible = true;
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.visible = anyVisible;
    if (!anyVisible) playing = false;
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
    mesh.dispose();
  };

  return { object: mesh, burst, update, dispose };
};
