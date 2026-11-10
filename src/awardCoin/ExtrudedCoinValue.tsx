import { useEffect, useMemo, useState } from "react";
import * as opentypeImport from "opentype.js";
import * as THREE from "three";
import { AWARD_METAL_STYLES, type AwardMetal } from "./types";

const FONT_URL = "/fonts/Possibility-Bold.otf";
const EXTRUDE_DEPTH = 0.055;

// Next/webpack interop can nest the module under `.default`
const opentype =
  typeof (opentypeImport as { parse?: unknown }).parse === "function"
    ? opentypeImport
    : ((opentypeImport as unknown as { default: typeof opentypeImport }).default ??
      opentypeImport);

type Font = opentype.Font;

let fontPromise: Promise<Font> | null = null;

function loadFont() {
  if (!fontPromise) {
    fontPromise = fetch(FONT_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch font (${res.status})`);
        return res.arrayBuffer();
      })
      .then((buf) => {
        if (typeof opentype.parse !== "function") {
          throw new Error("opentype.parse is unavailable");
        }
        return opentype.parse(buf);
      });
  }
  return fontPromise;
}

function pathToShapes(path: opentype.Path): THREE.Shape[] {
  const shapePath = new THREE.ShapePath();
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case "M":
        shapePath.moveTo(cmd.x, -cmd.y);
        break;
      case "L":
        shapePath.lineTo(cmd.x, -cmd.y);
        break;
      case "C":
        shapePath.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y);
        break;
      case "Q":
        shapePath.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
        break;
      case "Z":
        shapePath.currentPath?.closePath();
        break;
      default:
        break;
    }
  }
  return shapePath.toShapes();
}

function createExtrudedTextGeometry(
  font: Font,
  text: string,
  fontSize: number,
): THREE.ExtrudeGeometry {
  const path = font.getPath(text, 0, 0, fontSize * 100);
  const shapes = pathToShapes(path);
  if (shapes.length === 0) {
    throw new Error(`No shapes for text "${text}"`);
  }
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: EXTRUDE_DEPTH * 100,
    bevelEnabled: true,
    bevelThickness: 2.2,
    bevelSize: 1.6,
    bevelSegments: 3,
    curveSegments: 8,
  });

  geo.scale(0.01, 0.01, 0.01);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const cx = (bb.min.x + bb.max.x) / 2;
  const cy = (bb.min.y + bb.max.y) / 2;
  geo.translate(-cx, -cy, 0);
  geo.computeVertexNormals();
  return geo;
}

const geoCache = new Map<string, THREE.ExtrudeGeometry>();

function geometryFor(font: Font, text: string, fontSize: number) {
  const key = `${text}:${fontSize}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = createExtrudedTextGeometry(font, text, fontSize);
    geoCache.set(key, geo);
  }
  return geo;
}

function useAwardFont() {
  const [font, setFont] = useState<Font | null>(null);

  useEffect(() => {
    let alive = true;
    loadFont()
      .then((f) => {
        if (alive) setFont(f);
      })
      .catch((err) => {
        console.error("Failed to load Possibility Bold", err);
      });
    return () => {
      alive = false;
    };
  }, []);

  return font;
}

loadFont().catch((err) => {
  console.error("Failed to load Possibility Bold", err);
});

type ExtrudedTextProps = {
  text: string;
  metal: AwardMetal;
  fontSize: number;
  disabled?: boolean;
  hovered?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** 0–1, animated by parent (e.g. success +N) */
  opacity?: number;
  scale?: number;
};

export function ExtrudedText({
  text,
  metal,
  fontSize,
  disabled,
  hovered = false,
  position = [0, 0, 0],
  rotation = [0, Math.PI, 0],
  opacity = 1,
  scale = 1,
}: ExtrudedTextProps) {
  const font = useAwardFont();
  const style = AWARD_METAL_STYLES[metal];

  const geometry = useMemo(() => {
    if (!font) return null;
    try {
      return geometryFor(font, text, fontSize);
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [font, text, fontSize]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: disabled ? style.strokeDisabled : style.stroke,
        metalness: disabled ? 0.25 : 0.2,
        roughness: disabled ? 0.55 : 0.35,
        emissive: disabled ? "#000000" : style.stroke,
        emissiveIntensity: disabled ? 0 : hovered ? 1.65 : 0.95,
        transparent: true,
        opacity: disabled ? 0.55 : 1,
      }),
    [disabled, hovered, style],
  );

  useEffect(() => {
    material.opacity = disabled ? 0.55 : opacity;
    material.needsUpdate = true;
  }, [material, opacity, disabled]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  if (!geometry) return null;

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
    />
  );
}

type ExtrudedCoinValueProps = {
  value: number;
  metal: AwardMetal;
  disabled?: boolean;
  hovered?: boolean;
};

export function ExtrudedCoinValue({ value, metal, disabled, hovered = false }: ExtrudedCoinValueProps) {
  const fontSize = value >= 100 ? 0.55 : 0.7;
  return (
    <ExtrudedText
      text={String(value)}
      metal={metal}
      fontSize={fontSize}
      disabled={disabled}
      hovered={hovered}
      position={[0, 0, -0.14]}
    />
  );
}
