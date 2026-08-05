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
 * Gift colorways — each has dark + light stage variants.
 * `body` = box, `accent` = ribbon/bow (metallic).
 */
export const GIFT_PALETTES = [
  {
    id: 'roam',
    name: 'Roam',
    blurb: 'Default — black / gold',
    dark: {
      body: '#2E2C28',
      accent: ROAM_GOLD,
      accentEmissive: ROAM_GOLD_EMISSIVE,
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#FFF8EC',
      accent: '#FFE9A3',
      accentEmissive: '#E8C56A',
      emissiveIntensity: 0.14,
    },
  },
  {
    id: 'navy',
    name: 'Navy',
    blurb: 'Blue / steel blue',
    dark: {
      body: '#2A3548',
      accent: '#8EB0D8',
      accentEmissive: '#4A6A8C',
      emissiveIntensity: 0.05,
    },
    light: {
      body: '#B8CCE6',
      accent: '#B8D4F0',
      accentEmissive: '#7BA3D4',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'evergreen',
    name: 'Evergreen',
    blurb: 'Forest / leaf',
    dark: {
      body: '#2A3830',
      accent: '#8FBC9A',
      accentEmissive: '#3D6B4A',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#B8D4C0',
      accent: '#B5E0C2',
      accentEmissive: '#6BB882',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    blurb: 'Burgundy / blush',
    dark: {
      body: '#3A2A30',
      accent: '#E8A8B4',
      accentEmissive: '#9A5A62',
      emissiveIntensity: 0.06,
    },
    light: {
      body: '#E8C0C8',
      accent: '#F5C8D0',
      accentEmissive: '#E090A0',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    blurb: 'Slate / ice',
    dark: {
      body: '#2C333C',
      accent: '#A8BDD0',
      accentEmissive: '#5A7290',
      emissiveIntensity: 0.05,
    },
    light: {
      body: '#C0CEDC',
      accent: '#D0E0F0',
      accentEmissive: '#9BB4CC',
      emissiveIntensity: 0.12,
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    blurb: 'Espresso / amber',
    dark: {
      body: '#3A2E26',
      accent: '#E8A86A',
      accentEmissive: '#B86A2A',
      emissiveIntensity: 0.07,
    },
    light: {
      body: '#E8D0B8',
      accent: '#FFD09A',
      accentEmissive: '#E8A050',
      emissiveIntensity: 0.14,
    },
  },
];

export function getGiftPalette(id = 'roam') {
  return GIFT_PALETTES.find((p) => p.id === id) ?? GIFT_PALETTES[0];
}

/** Resolved body/accent hexes for the active stage theme. */
export function paletteColorsFor(theme = 'dark', paletteId = 'roam') {
  const pal = getGiftPalette(paletteId);
  return theme === 'light' ? pal.light : pal.dark;
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
export function bodyMaterialPropsFor(theme = 'dark', paletteId = 'roam') {
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
export function accentMaterialPropsFor(theme = 'dark', paletteId = 'roam') {
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
export function goldMaterialPropsFor(theme = 'dark', paletteId = 'roam') {
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
