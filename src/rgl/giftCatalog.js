/**
 * Split gifts from Christmas Gift 2.obj — one file per gift.
 * bodyParts → roam black · ribbonParts → roam gold
 */
export const PACK_GIFTS = [
  {
    id: 'pack-flat',
    name: 'Gift · Flat',
    blurb: 'Low box from the holiday pack — roam black body, gold bow.',
    status: 'wip',
    url: '/rgl/gift-pack/gift-flat.obj',
    bodyParts: ['Cube.006', 'Cube.007'],
    ribbonParts: [
      'Cube.008', 'Cube.009',
      'Plane.008', 'Plane.009', 'Plane.010', 'Plane.011',
      'Plane.012', 'Plane.013', 'Plane.014', 'Plane.015',
    ],
  },
  {
    id: 'pack-tall',
    name: 'Gift · Tall',
    blurb: 'Large tall box from the holiday pack — roam black body, gold bow.',
    status: 'wip',
    url: '/rgl/gift-pack/gift-tall.obj',
    bodyParts: ['Cube.010', 'Cube.011'],
    ribbonParts: [
      'Cube.014', 'Cube.016',
      'Plane.016', 'Plane.017', 'Plane.018', 'Plane.019',
      'Plane.020', 'Plane.021', 'Plane.022', 'Plane.023',
    ],
  },
  {
    id: 'pack-tube',
    name: 'Gift · Tube',
    blurb: 'Cylindrical gift from the holiday pack — roam black body, gold bow.',
    status: 'wip',
    url: '/rgl/gift-pack/gift-tube.obj',
    bodyParts: ['Cylinder.016', 'Cylinder.018'],
    ribbonParts: [
      'Plane.024', 'Plane.025', 'Plane.026', 'Plane.030',
      'Plane.031', 'Plane.032', 'Plane.033', 'Plane.034',
    ],
  },
  {
    id: 'pack-square',
    name: 'Gift · Square',
    blurb: 'Upright square box from the holiday pack — roam black body, gold bow.',
    status: 'wip',
    url: '/rgl/gift-pack/gift-square.obj',
    bodyParts: ['Cube.017', 'Cube.018'],
    ribbonParts: [
      'Cube.019', 'Cube.020',
      'Plane.035', 'Plane.036', 'Plane.037', 'Plane.038',
      'Plane.039', 'Plane.040', 'Plane.041', 'Plane.042',
    ],
  },
];

export function getPackGift(id) {
  return PACK_GIFTS.find((g) => g.id === id) ?? null;
}
