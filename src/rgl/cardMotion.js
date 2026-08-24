/** Shared open/close blend — hinge fold and yaw-to-camera use this. */
export const CARD_OPEN_STIFFNESS = 16;
/** Time to 98% with stiffness 8 — keep facing the camera this long after close starts. */
export const CARD_OPEN_SETTLE_MS = 280;
/** Cover-design preview: snap to the front, then hold before idle spin resumes. */
export const COVER_SNAP_MS = 380;
export const COVER_HOLD_MS = 2000;
/** Open-card pointer follow — snappier than the fold so the cover tracks the cursor. */
export const HINGE_FOLLOW_STIFFNESS = 16;
/** Extra cover fold (radians) at pointer X = ±1. */
export const HINGE_FOLLOW_ANGLE = 0.46;
/** Small whole-card yaw (radians) so the spine leans toward the cursor. */
export const HINGE_FOLLOW_YAW = 0.2;
/** Hover gleam light — follows the cursor across open-card foil. */
export const GLEAM_FOLLOW_STIFFNESS = 14;
export const GLEAM_FADE_STIFFNESS = 10;
/** Cover-edge drag: release below this openT (1 = open) finishes closing. */
export const FOLD_COMMIT_T = 0.78;
/** Closing speed (openT / sec) that commits a close even above the threshold. */
export const FOLD_FLICK_VT = 0.85;
/** Palette / foil color wash on the card. */
export const PALETTE_LERP_STIFFNESS = 8;
