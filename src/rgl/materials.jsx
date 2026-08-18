/**
 * Shared RGL materials + lights — matched to RoamIcon3D / RoamglAppIcon.
 */

/** Portfolio / RoamGL app-icon body. */
export const ROAM_BLACK = '#1E1D20';

/** Light-stage body — white counterpart to roam black. */
export const ROAM_WHITE = '#FFFFFF';

/** Shiny gold used on the Roam planet rings. */
export const ROAM_GOLD = '#FFD56A';
export const ROAM_GOLD_EMISSIVE = '#B8860B';

/** Light-stage gold — brighter champagne so it holds up on white bodies. */
export const ROAM_GOLD_LIGHT = '#FFE9A3';
export const ROAM_GOLD_LIGHT_EMISSIVE = '#E8C56A';

/**
 * Burn Gold from the 3d-badge playground — the foil that actually reads as gold
 * once a studio environment is on the scene.
 */
export const BADGE_GOLD_PROPS = {
  color: '#E8B84A',
  metalness: 1,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  reflectivity: 1,
  emissive: '#8B6914',
  emissiveIntensity: 0.08,
  envMapIntensity: 1,
  flatShading: false,
};

/**
 * Gift colorways — 12 evenly spaced hues (30° steps) around the wheel.
 * Same body/accent relationship at every step so the set feels cohesive.
 * `body` = box · `accent` = ribbon/bow (metallic).
 * `gold` is the gold spoke (~60°) for brand continuity.
 */
export const GIFT_PALETTES = [
  {
    id: 'crimson',
    name: 'Crimson',
    blurb: '0° — red',
    dark: {
      body: '#3A2426',
      accent: '#F07878',
      accentEmissive: '#A83840',
      emissiveIntensity: 0.07,
    },
    light: {
      body: '#F2D0D0',
      accent: '#FF9A9A',
      accentEmissive: '#E06068',
      emissiveIntensity: 0.13,
    },
  },
  {
    id: 'coral',
    name: 'Coral',
    blurb: '30° — orange',
    dark: {
      body: '#3A2C26',
      accent: '#F0A070',
      accentEmissive: '#B86030',
      emissiveIntensity: 0.07,
    },
    light: {
      body: '#F2D8C8',
      accent: '#FFB890',
      accentEmissive: '#E87848',
      emissiveIntensity: 0.13,
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    blurb: '60° — gold',
    dark: {
      body: '#2E2C28',
      accent: ROAM_GOLD,
      accentEmissive: ROAM_GOLD_EMISSIVE,
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#FFF8EC',
      accent: ROAM_GOLD_LIGHT,
      accentEmissive: ROAM_GOLD_LIGHT_EMISSIVE,
      emissiveIntensity: 0.14,
    },
  },
  {
    id: 'lime',
    name: 'Lime',
    blurb: '90° — chartreuse',
    dark: {
      body: '#2C3428',
      accent: '#B8D86A',
      accentEmissive: '#688828',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#E0F0C8',
      accent: '#C8E878',
      accentEmissive: '#90C040',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    blurb: '120° — green',
    dark: {
      body: '#28342C',
      accent: '#78C888',
      accentEmissive: '#388048',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#D0ECD8',
      accent: '#98E0A8',
      accentEmissive: '#58B870',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'mint',
    name: 'Mint',
    blurb: '150° — spring',
    dark: {
      body: '#263430',
      accent: '#78D0B0',
      accentEmissive: '#388068',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#C8ECE0',
      accent: '#98E8C8',
      accentEmissive: '#58C098',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'teal',
    name: 'Teal',
    blurb: '180° — cyan',
    dark: {
      body: '#263436',
      accent: '#70C8D0',
      accentEmissive: '#308088',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#C8E8EC',
      accent: '#90DCE8',
      accentEmissive: '#50B0C0',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'azure',
    name: 'Azure',
    blurb: '210° — sky',
    dark: {
      body: '#262E38',
      accent: '#78B0E0',
      accentEmissive: '#386898',
      emissiveIntensity: 0.05,
    },
    light: {
      body: '#C8DCEC',
      accent: '#98C8F0',
      accentEmissive: '#5890C8',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'navy',
    name: 'Navy',
    blurb: '240° — blue',
    dark: {
      body: '#282A3A',
      accent: '#8898E8',
      accentEmissive: '#4050A0',
      emissiveIntensity: 0.05,
    },
    light: {
      body: '#D0D4F0',
      accent: '#A8B4F0',
      accentEmissive: '#6878D0',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'violet',
    name: 'Violet',
    blurb: '270° — purple',
    dark: {
      body: '#302838',
      accent: '#B090E8',
      accentEmissive: '#6848A0',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#E0D0F0',
      accent: '#C8B0F0',
      accentEmissive: '#9870D0',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'magenta',
    name: 'Magenta',
    blurb: '300° — fuchsia',
    dark: {
      body: '#382830',
      accent: '#E890C8',
      accentEmissive: '#A04078',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#F0D0E4',
      accent: '#F0A8D8',
      accentEmissive: '#D068A8',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    blurb: '330° — pink',
    dark: {
      body: '#3A282C',
      accent: '#F090A8',
      accentEmissive: '#A84860',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#F2D0D8',
      accent: '#FFB0C0',
      accentEmissive: '#E07088',
      emissiveIntensity: 0.12,
    },
  },
];

export function getGiftPalette(id = 'gold') {
  const key = id === 'roam' ? 'gold' : id;
  return GIFT_PALETTES.find((p) => p.id === key) ?? GIFT_PALETTES.find((p) => p.id === 'gold') ?? GIFT_PALETTES[0];
}

/** Resolved body/accent hexes for the active stage theme. */
export function paletteColorsFor(theme = 'dark', paletteId = 'gold') {
  const pal = getGiftPalette(paletteId);
  return theme === 'light' ? pal.light : pal.dark;
}

/**
 * CSS custom properties shared by gift FX, birthday ticker shine,
 * and the office BirthdayGlow — keep all three on the same palette.
 */
export function birthdayCssVars(theme = 'dark', paletteId = 'gold') {
  const { accent, accentEmissive, body } = paletteColorsFor(theme, paletteId);
  return {
    '--birthday-accent': accent,
    '--birthday-accent-emissive': accentEmissive,
    '--birthday-body': body,
  };
}

/**
 * World-space size of the Roam app icon body (RoamIcon3D BODY_SIZE).
 * Every RGL subject is normalized to this so point/directional lights
 * fall off the same way.
 */
export const RGL_SUBJECT_SIZE = 2;

/** Orthographic half-extent — same as RoamIcon3D VIEW_HALF. */
export const RGL_VIEW_HALF = 1.22;

export const bodyMaterialProps = {
  color: ROAM_BLACK,
  // Soft paper/card finish — low metal so palette tints read in the diffuse,
  // not only in specular hotspots (high metal + clearcoat crushed the color).
  roughness: 0.42,
  metalness: 0.08,
  clearcoat: 0.35,
  clearcoatRoughness: 0.35,
  reflectivity: 0.45,
  flatShading: false,
};

/** Body props for the current stage theme + gift palette. */
export function bodyMaterialPropsFor(theme = 'dark', paletteId = 'gold') {
  const { body } = paletteColorsFor(theme, paletteId);
  return {
    ...bodyMaterialProps,
    color: body,
  };
}

export const goldMaterialProps = {
  color: ROAM_GOLD,
  metalness: 1,
  roughness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0,
  reflectivity: 1,
  ior: 1.5,
  specularIntensity: 1,
  emissive: ROAM_GOLD_EMISSIVE,
  emissiveIntensity: 0.06,
  flatShading: false,
};

/** Accent (ribbon) props for the current stage theme + gift palette. */
export function accentMaterialPropsFor(theme = 'dark', paletteId = 'gold') {
  const { accent, accentEmissive, emissiveIntensity } = paletteColorsFor(
    theme,
    paletteId,
  );
  return {
    ...goldMaterialProps,
    color: accent,
    emissive: accentEmissive,
    emissiveIntensity,
  };
}

/** @deprecated Prefer accentMaterialPropsFor — kept for call-site clarity. */
export function goldMaterialPropsFor(theme = 'dark', paletteId = 'gold') {
  return accentMaterialPropsFor(theme, paletteId);
}

/**
 * Soft studio lighting — same rig for every RGL gift.
 * Keys sit farther out with long, low-decay point lamps so the light
 * reads bigger and more dispersed than the tight icon-matched defaults.
 */
export function RGLLights() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#fff8f2', '#121218', 0.55]} />
      {/* Body fill — farther / softer than the icon keys */}
      <directionalLight position={[5.5, 7.5, 8]} intensity={2.1} color="#fff8f2" />
      <directionalLight position={[-6, 2.5, 4.5]} intensity={1.0} color="#b0c8ff" />
      <directionalLight position={[0, 4, -6]} intensity={0.8} />
      <directionalLight position={[-2, -3.5, 5.5]} intensity={0.6} color="#ffe8d8" />
      <pointLight position={[3.2, 4.5, 5.5]} intensity={1.85} distance={42} decay={1} color="#ffffff" />
      <pointLight position={[-4, 1.2, 4]} intensity={1.05} distance={38} decay={1} color="#c8d8ff" />
      {/* Gold — big warm lamps, long reach so ribbons catch soft wrap */}
      <directionalLight position={[7, 8.5, 9]} intensity={2.5} color="#fff8e8" />
      <directionalLight position={[-7, 4, 4.5]} intensity={1.55} color="#ffd78a" />
      <pointLight position={[4.5, 6.5, 7]} intensity={3.0} distance={52} decay={1} color="#fff8e8" />
      <pointLight position={[-5.5, 3, 5.5]} intensity={1.85} distance={48} decay={1} color="#ffd78a" />
      <pointLight position={[0, -3.5, 7.5]} intensity={1.45} distance={44} decay={1} color="#ffffff" />
    </>
  );
}
