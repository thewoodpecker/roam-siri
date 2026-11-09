import * as THREE from "three";
import { COIN_SCALE } from "./coinMesh.ts";

/** Rise, hold, and fade from the award send, in seconds. */
const RISE_S = 0.61;
const HOLD_S = 0.69;
const FADE_S = 0.27;
const END_S = RISE_S + HOLD_S + FADE_S;

/** Award scene units, scaled onto this coin. The label clears the rim at the top. */
const START_Y = 0.06 * COIN_SCALE;
const END_Y = 1.18 * COIN_SCALE;
const START_Z = -0.22 * COIN_SCALE;
const END_Z = 0.16 * COIN_SCALE;
const TEXT_HEIGHT = 0.36 * COIN_SCALE;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const EXTRUSION = [6, 5, 4, 3, 2, 1] as const;

const paintLabel = (doc: Document, label: string) => {
  const canvas = doc.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return { canvas, aspect: 2.2 };

  const font = "700 160px Possibility, sans-serif";
  context.font = font;
  const measured = context.measureText(label);
  const pad = 36;
  canvas.width = Math.ceil(measured.width + pad * 2);
  canvas.height = 240;
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  const x = canvas.width / 2;
  const y = canvas.height / 2 - 6;
  for (const step of EXTRUSION) {
    context.fillStyle = step > 3 ? "#5c4200" : "#b87400";
    context.fillText(label, x + step * 1.5, y + step * 1.7);
  }
  context.fillStyle = "#ffcc33";
  context.fillText(label, x, y);
  return { canvas, aspect: canvas.width / canvas.height };
};

export interface CoinPlus {
  object: THREE.Object3D;
  play: () => void;
  update: (dt: number) => void;
  dispose: () => void;
}

/** "+N" rises from behind the coin, holds, then fades. Same motion as an award send. */
export const createCoinPlus = (doc: Document, amount: number): CoinPlus => {
  const label = `+${amount}`;
  const painted = paintLabel(doc, label);
  const texture = new THREE.CanvasTexture(painted.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    premultipliedAlpha: false,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.visible = false;
  sprite.renderOrder = 2;
  sprite.center.set(0.5, 0.5);

  sprite.scale.set(TEXT_HEIGHT * painted.aspect, TEXT_HEIGHT, 1);

  let elapsed = -1;

  const play = () => {
    elapsed = 0;
    sprite.visible = true;
    material.opacity = 0;
    sprite.position.set(0, START_Y, START_Z);
  };

  const update = (dt: number) => {
    if (elapsed < 0) return;
    elapsed += dt;
    if (elapsed >= END_S) {
      elapsed = -1;
      sprite.visible = false;
      return;
    }

    const holdEnd = RISE_S + HOLD_S;
    const pose = () => {
      if (elapsed < RISE_S) {
        const p = easeOutCubic(elapsed / RISE_S);
        return {
          opacity: Math.min(1, p * 1.35),
          y: START_Y + (END_Y - START_Y) * p,
          z: START_Z + (END_Z - START_Z) * p,
        };
      }
      if (elapsed < holdEnd) return { opacity: 1, y: END_Y, z: END_Z };
      const p = (elapsed - holdEnd) / FADE_S;
      return { opacity: 1 - p, y: END_Y, z: END_Z };
    };
    const { opacity, y, z } = pose();
    sprite.position.set(0, y, z);
    material.opacity = opacity;
    sprite.visible = opacity > 0.02;
  };

  const dispose = () => {
    material.dispose();
    texture.dispose();
  };

  return { object: sprite, play, update, dispose };
};
