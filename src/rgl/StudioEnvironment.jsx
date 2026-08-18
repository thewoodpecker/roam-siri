import { Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting + softbox environment from the 3d-badge playground.
 * Direct lights stay low so metal reflections from the lightformers read.
 */
export function BadgeStudioLights({ keyLight = 2.2, envIntensity = 1 }) {
  const fill = envIntensity * 0.22;
  return (
    <>
      <ambientLight intensity={0.4 * fill} />
      <directionalLight
        position={[3.2, 4.5, 5.5]}
        intensity={keyLight}
        color="#fff8f2"
      />
      <directionalLight
        position={[-3.5, 1.2, 3]}
        intensity={0.85 * fill}
        color="#b0c8ff"
      />
      <directionalLight position={[0, 2, -4]} intensity={0.55 * fill} />
      <directionalLight
        position={[-1, -2, 4]}
        intensity={0.45 * fill}
        color="#ffe8d8"
      />
      <pointLight
        position={[1.5, 2, 3]}
        intensity={0.9 * fill}
        distance={10}
        color="#ffffff"
      />
    </>
  );
}

/** Soft studio panels — larger than studio_small_03 so metal highlights read as broad softboxes. */
export function BadgeStudioEnvironment({ intensity = 1 }) {
  return (
    <Environment resolution={256} environmentIntensity={intensity}>
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#fff8f2"
        position={[0, 5.5, 1]}
        scale={[14, 10, 1]}
        rotation-x={Math.PI / 2}
      />
      <Lightformer
        form="rect"
        intensity={1.8}
        color="#ffffff"
        position={[5.5, 2.5, 4]}
        scale={[8, 10, 1]}
        rotation-y={-Math.PI / 3}
      />
      <Lightformer
        form="rect"
        intensity={1.35}
        color="#c5d4ff"
        position={[-5.5, 1.5, 3]}
        scale={[7, 9, 1]}
        rotation-y={Math.PI / 3}
      />
      <Lightformer
        form="rect"
        intensity={0.9}
        color="#ffe8d8"
        position={[0, 1, -6]}
        scale={[12, 6, 1]}
      />
      <Lightformer
        form="ring"
        intensity={0.55}
        color="#ffffff"
        position={[0, 0, 5]}
        scale={4}
      />
    </Environment>
  );
}
