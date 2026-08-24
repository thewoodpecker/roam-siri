import { useSyncExternalStore } from 'react';
import { OPEN_CARD_LIGHTS, STUDIO_LIGHTS } from './materials';

function cloneLights(list) {
  return list.map((light) => ({
    ...light,
    position: light.position ? light.position.slice() : undefined,
  }));
}

let snapshot = {
  studio: cloneLights(STUDIO_LIGHTS),
  open: cloneLights(OPEN_CARD_LIGHTS),
};

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeLightRig(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getLightRig() {
  return snapshot;
}

export function useLightRig() {
  return useSyncExternalStore(subscribeLightRig, getLightRig);
}

const SPAN_X = 8.2;
const SPAN_Z = 7.4;

export function moveLight(group, id, x, z) {
  const nextX = Math.max(-SPAN_X, Math.min(SPAN_X, x));
  const nextZ = Math.max(-SPAN_Z, Math.min(SPAN_Z, z));
  const key = group === 'studio' ? 'studio' : 'open';
  let changed = false;
  const nextList = snapshot[key].map((light) => {
    if (light.id !== id || !light.position) return light;
    const [, y] = light.position;
    if (light.position[0] === nextX && light.position[2] === nextZ) return light;
    changed = true;
    return { ...light, position: [nextX, y, nextZ] };
  });
  if (!changed) return;
  snapshot = { ...snapshot, [key]: nextList };
  emit();
}
