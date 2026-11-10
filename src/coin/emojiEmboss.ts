import * as THREE from "three";

const RES = 112;
const MARK_DEPTH = 0.045;
const MARK_SIZE = 1.28;

const channel = (pixels: Uint8ClampedArray, index: number) => pixels[index] ?? 0;

const sample = (values: Float32Array, index: number) => values[index] ?? 0;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const blur = (src: Float32Array) => {
  const out = new Float32Array(src.length);
  for (let y = 0; y < RES; y++) {
    for (let x = 0; x < RES; x++) {
      let sum = 0;
      let weight = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= RES || yy >= RES) continue;
          sum += sample(src, yy * RES + xx);
          weight++;
        }
      }
      out[y * RES + x] = weight ? sum / weight : 0;
    }
  }
  return out;
};

/** Raised relief of an emoji glyph, sized to the coin mark. */
export const emojiEmbossGeometry = (
  emoji: string,
  doc: Document,
  depth = MARK_DEPTH,
  size = MARK_SIZE
): THREE.BufferGeometry | null => {
  if (!emoji) return null;
  const canvas = doc.createElement("canvas");
  canvas.width = RES;
  canvas.height = RES;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, RES, RES);
  ctx.font = `${Math.round(RES * 0.72)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, RES / 2, RES / 2 + RES * 0.05);
  const pixels = ctx.getImageData(0, 0, RES, RES).data;
  const alpha = new Float32Array(RES * RES);
  const luma = new Float32Array(RES * RES);
  for (let i = 0; i < RES * RES; i++) {
    const r = channel(pixels, i * 4) / 255;
    const g = channel(pixels, i * 4 + 1) / 255;
    const b = channel(pixels, i * 4 + 2) / 255;
    const a = channel(pixels, i * 4 + 3) / 255;
    alpha[i] = a;
    luma[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
  }
  const soft = blur(alpha);
  const height = new Float32Array(RES * RES);
  let minX = RES;
  let minY = RES;
  let maxX = 0;
  let maxY = 0;
  for (let i = 0; i < RES * RES; i++) {
    const cover = sample(soft, i);
    if (cover < 0.1) continue;
    const bevel = smoothstep(0.1, 0.34, cover);
    const plateau = smoothstep(0.34, 0.62, cover);
    const profile = bevel * 0.42 + plateau * 0.58;
    const tone = Math.min(1, sample(luma, i) / Math.max(sample(alpha, i), 0.001));
    height[i] = profile * (0.5 + 0.5 * Math.pow(tone, 0.65));
    const x = i % RES;
    const y = (i / RES) | 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  if (maxX <= minX || maxY <= minY) return null;

  const relief = Math.max(depth, 0.02) * 2.4;
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const positions: number[] = [];
  const indices: number[] = [];
  const indexOf = new Map<number, number>();
  const vertex = (x: number, y: number) => {
    const key = y * RES + x;
    const existing = indexOf.get(key);
    if (existing !== undefined) return existing;
    const px = ((x - (minX + maxX) / 2) / span) * size;
    const py = (((minY + maxY) / 2 - y) / span) * size;
    const id = positions.length / 3;
    positions.push(px, py, sample(height, key) * relief);
    indexOf.set(key, id);
    return id;
  };

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const h00 = sample(height, y * RES + x);
      const h10 = sample(height, y * RES + x + 1);
      const h01 = sample(height, (y + 1) * RES + x);
      const h11 = sample(height, (y + 1) * RES + x + 1);
      if (h00 + h10 + h01 + h11 < 0.12) continue;
      const a = vertex(x, y);
      const b = vertex(x + 1, y);
      const c = vertex(x + 1, y + 1);
      const d = vertex(x, y + 1);
      indices.push(a, d, b, b, d, c);
    }
  }
  if (!indices.length) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
};
