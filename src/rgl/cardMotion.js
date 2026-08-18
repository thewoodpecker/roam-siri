/** Shared open/close blend — hinge fold and yaw-to-camera use this. */
export const CARD_OPEN_STIFFNESS = 8;
/** Time to 98% with stiffness 8 — keep facing the camera this long after close starts. */
export const CARD_OPEN_SETTLE_MS = 560;
/** Open-card pointer follow — snappier than the fold so the cover tracks the cursor. */
export const HINGE_FOLLOW_STIFFNESS = 11;
/** Extra cover fold (radians) at pointer X = ±1. */
export const HINGE_FOLLOW_ANGLE = 0.46;
/** Small whole-card yaw (radians) so the spine leans toward the cursor. */
export const HINGE_FOLLOW_YAW = 0.2;
