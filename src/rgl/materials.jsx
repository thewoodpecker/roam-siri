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
  roughness: 0.05,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  reflectivity: 1,
  specularIntensity: 1,
  emissive: '#8B6914',
  emissiveIntensity: 0.08,
  envMapIntensity: 1.15,
  flatShading: false,
};

export const BADGE_SILVER_PROPS = {
  color: '#C8CED6',
  metalness: 1,
  roughness: 0.04,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  reflectivity: 1,
  specularIntensity: 1,
  emissive: '#2E3238',
  emissiveIntensity: 0.03,
  envMapIntensity: 1.35,
  flatShading: false,
};

export const BADGE_BLACK_FOIL_PROPS = {
  color: '#0B0B0D',
  metalness: 1,
  roughness: 0.02,
  clearcoat: 1,
  clearcoatRoughness: 0,
  reflectivity: 1,
  ior: 1.5,
  specularIntensity: 1,
  emissive: '#000000',
  emissiveIntensity: 0,
  envMapIntensity: 1.65,
  flatShading: false,
};

export const FOIL_METALS = [
  {
    id: 'gold',
    name: 'Gold',
    swatch: '#E8B84A',
    ink: '#E8B84A',
    gradient: 'linear-gradient(145deg, #FFF3C4 0%, #E8B84A 46%, #9A6E22 100%)',
    props: BADGE_GOLD_PROPS,
  },
  {
    id: 'silver',
    name: 'Silver',
    swatch: '#C5CAD3',
    ink: '#C8CED6',
    gradient: 'linear-gradient(145deg, #FFFFFF 0%, #C8CED6 48%, #7E848C 100%)',
    props: BADGE_SILVER_PROPS,
  },
  {
    id: 'black',
    name: 'Black',
    swatch: '#111114',
    ink: '#0B0B0D',
    gradient: 'linear-gradient(145deg, #8A8A92 0%, #1C1C20 36%, #050506 70%, #4A4A52 100%)',
    props: BADGE_BLACK_FOIL_PROPS,
  },
];

export function getFoilMetal(id = 'gold') {
  return FOIL_METALS.find((m) => m.id === id) ?? FOIL_METALS[0];
}

/**
 * Gift colorways — Black & Silver plus hues around the wheel.
 * `body` = card / box · `accent` = foil / ribbon.
 */
export const GIFT_PALETTES = [
  {
    id: 'gold',
    name: 'Black & Silver',
    blurb: 'Roam black + silver foil',
    dark: {
      body: '#000000',
      accent: '#C8CED6',
      accentEmissive: '#8A9098',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#000000',
      accent: '#E4E7EC',
      accentEmissive: '#C8CED6',
      emissiveIntensity: 0.14,
    },
  },
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
  const key = id === 'roam' || id === 'black' ? 'gold' : id;
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
  roughness: 0.18,
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
 * Textbook scene lights — ambient fill + key/fill directionals.
 * Intensities use Math.PI so they match R3F / Three physical units.
 * Positions are world-space; the sidebar plot can drag lamps that have `id`.
 */
export const STUDIO_LIGHTS = [
  { kind: 'ambient', intensity: Math.PI },
  { kind: 'directional', id: 'key', label: 'Key', position: [4, 6, 8], intensity: Math.PI, color: '#ffffff' },
  { kind: 'directional', id: 'fill', label: 'Fill', position: [-5, 3, 5], intensity: Math.PI * 0.5, color: '#ffffff' },
];

/** Extra open-card lamps — none; the stage rig stays on. Gleam is separate. */
export const OPEN_CARD_LIGHTS = [];

/** Hover point light — world XZ from NDC, Z drops closer as the card opens. */
export const GLEAM_LIGHT = {
  spanX: 1.4,
  spanY: 1.1,
  yBias: 0.12,
  zClosed: 1.9,
  zOpenDrop: 0.7,
  intensity0: 9,
  intensityOpen: 15,
  distance: 4.6,
  decay: 2,
};

export function RGLLights({ lights = STUDIO_LIGHTS }) {
  return lights.map((light, i) => {
    if (light.kind === 'ambient') {
      return <ambientLight key={light.id || i} intensity={light.intensity} />;
    }
    if (light.kind === 'hemisphere') {
      return (
        <hemisphereLight
          key={light.id || i}
          args={[light.color || '#ffffff', light.ground || '#444444', light.intensity]}
        />
      );
    }
    if (light.kind === 'point') {
      return (
        <pointLight
          key={light.id || i}
          position={light.position}
          intensity={light.intensity}
          distance={light.distance}
          color={light.color}
        />
      );
    }
    return (
      <directionalLight
        key={light.id || i}
        position={light.position}
        intensity={light.intensity}
        color={light.color}
      />
    );
  });
}
