/** Shared open/close blend — hinge fold and yaw-to-camera use this. */
export const CARD_OPEN_STIFFNESS = 16;
/** Time to 98% with stiffness 8 — keep facing the camera this long after close starts. */
export const CARD_OPEN_SETTLE_MS = 280;
/** Cover-design preview: snap to the front, then hold before idle spin resumes. */
export const COVER_SNAP_MS = 380;
export const COVER_HOLD_MS = 2000;
/** Hover gleam light — follows the cursor across open-card foil. */
export const GLEAM_FOLLOW_STIFFNESS = 14;
export const GLEAM_FADE_STIFFNESS = 10;
/** Cover-edge drag: release below this openT (1 = open) finishes closing. */
export const FOLD_COMMIT_T = 0.78;
/** Closing speed (openT / sec) that commits a close even above the threshold. */
export const FOLD_FLICK_VT = 0.85;
/** Palette / foil color wash on the card. */
export const PALETTE_LERP_STIFFNESS = 8;
/** Inner sheet turn — settle after a flick or tap. */
export const PAGE_TURN_STIFFNESS = 14;
/** Inserted sheet rests peeled into the open tent so it reads as a middle page. */
export const PAGE_REST_T = 0.2;
/** After a turn, the page sits short of the cover — not flush against it. */
export const PAGE_LEFT_REST_T = 0.72;
/** Release past this turn amount commits the page (0 = right, 1 = left). */
export const PAGE_COMMIT_T = 0.52;
/** Turn speed (flipT / sec) that commits even below the threshold. */
export const PAGE_FLICK_VT = 0.9;
