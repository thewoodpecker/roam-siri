import { Environment, Lightformer } from '@react-three/drei';

/**
 * IBL environments for the RGL stage. `softbox` is the custom lightformer
 * rig; the rest are drei HDR presets.
 */
export const STAGE_ENVIRONMENTS = [
  { id: 'softbox', name: 'Softbox', blurb: 'Studio panels', swatch: '#FFF8F2' },
  { id: 'studio', name: 'Studio', blurb: 'Neutral HDR', swatch: '#E8E4DC' },
  { id: 'warehouse', name: 'Warehouse', blurb: 'Hard industrial', swatch: '#C4B89A' },
  { id: 'apartment', name: 'Apartment', blurb: 'Warm interior', swatch: '#F0DCC8' },
  { id: 'lobby', name: 'Lobby', blurb: 'Bright interior', swatch: '#E8DCC0' },
  { id: 'city', name: 'City', blurb: 'Overcast urban', swatch: '#9AA8B8' },
  { id: 'park', name: 'Park', blurb: 'Open daylight', swatch: '#8FBF70' },
  { id: 'forest', name: 'Forest', blurb: 'Green canopy', swatch: '#3D6B4A' },
  { id: 'sunset', name: 'Sunset', blurb: 'Golden hour', swatch: '#FF9A5C' },
  { id: 'dawn', name: 'Dawn', blurb: 'Cool morning', swatch: '#C8D8F0' },
  { id: 'night', name: 'Night', blurb: 'Low blue light', swatch: '#2A3450' },
];

export function getStageEnvironment(id = 'softbox') {
  return STAGE_ENVIRONMENTS.find((e) => e.id === id) ?? STAGE_ENVIRONMENTS[0];
}

/** Soft studio panels — keys sit off-camera so faces get falloff, not a flat wash. */
export function BadgeStudioEnvironment({ intensity = 1.35 }) {
  return (
    <Environment resolution={128} frames={1} environmentIntensity={intensity}>
      <Lightformer
        form="rect"
        intensity={4}
        color="#ffffff"
        position={[0, 8, 0]}
        scale={[12, 12, 1]}
        rotation-x={Math.PI / 2}
      />
      <Lightformer
        form="rect"
        intensity={3.2}
        color="#ffffff"
        position={[0, 2, 8]}
        scale={[10, 8, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#e8e8ee"
        position={[-7, 2, 2]}
        scale={[6, 8, 1]}
        rotation-y={Math.PI / 2}
      />
    </Environment>
  );
}

const DREI_PRESETS = new Set(
  STAGE_ENVIRONMENTS.filter((e) => e.id !== 'softbox').map((e) => e.id),
);

/** IBL for the RGL canvas — custom softboxes or a drei HDR preset. */
export function StageEnvironment({ id = 'softbox' }) {
  if (id === 'softbox' || !DREI_PRESETS.has(id)) {
    return <BadgeStudioEnvironment />;
  }
  return <Environment preset={id} frames={1} resolution={128} environmentIntensity={1} />;
}
