export type AwardMetal = "bronze" | "silver" | "gold";

export type AwardMetalStyle = {
  body: string;
  bodyDisabled: string;
  text: string;
  textDisabled: string;
  /** Darker rim stroke (Mario-style edge) */
  stroke: string;
  strokeDisabled: string;
  /** Roam logo rings — outer/middle/inner step lighter in-family */
  logoRingOuter: string;
  logoRingMiddle: string;
  logoRingInner: string;
  metalness: number;
  roughness: number;
  /** Optional lift — useful for bright metals without an env map */
  emissive?: string;
  emissiveIntensity?: number;
};

/** Copied from roam-awards `src/components/reaction-panel/types.ts`. */
export const AWARD_METAL_STYLES: Record<AwardMetal, AwardMetalStyle> = {
  bronze: {
    body: "#e8a04a",
    bodyDisabled: "#6a4528",
    text: "#fffaf0",
    textDisabled: "#a07850",
    stroke: "#5c3614",
    strokeDisabled: "#3d2610",
    logoRingOuter: "#6a4018",
    logoRingMiddle: "#7a4a22",
    logoRingInner: "#8e582a",
    metalness: 0.42,
    roughness: 0.45,
    emissive: "#d08030",
    emissiveIntensity: 0.24,
  },
  silver: {
    body: "#eef1f6",
    bodyDisabled: "#6e7278",
    text: "#ffffff",
    textDisabled: "#a8adb4",
    stroke: "#4a5058",
    strokeDisabled: "#3a3e46",
    logoRingOuter: "#555d66",
    logoRingMiddle: "#636b75",
    logoRingInner: "#727b86",
    metalness: 0.38,
    roughness: 0.42,
    emissive: "#c5cad4",
    emissiveIntensity: 0.2,
  },
  gold: {
    body: "#ffcc33",
    bodyDisabled: "#8a7610",
    text: "#fffef5",
    textDisabled: "#c4a84a",
    stroke: "#5c4200",
    strokeDisabled: "#3d2c00",
    logoRingOuter: "#6a4c05",
    logoRingMiddle: "#7a5a08",
    logoRingInner: "#8e6a0c",
    metalness: 0.4,
    roughness: 0.4,
    emissive: "#ffb000",
    emissiveIntensity: 0.3,
  },
};

/**
 * roam-awards grid: 5 and 10 are bronze, 25 and 50 silver, 100 and 250 gold.
 * A single Roamcoin (the map coin) is the gold piece.
 */
export function metalForAwardAmount(amount: number): AwardMetal {
  if (amount >= 100) return "gold";
  if (amount >= 25) return "silver";
  if (amount >= 5) return "bronze";
  return "gold";
}
