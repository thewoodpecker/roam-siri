# virtual-offices — mobile feature visual playbook

Patterns established while polishing the homepage / mobile feature page. Apply these when adapting any other feature page (or new section) to mobile.

Mobile breakpoint everywhere: `@media (max-width: 768px)`.

## 0. Two surfaces, parallel selectors

There are **two** surfaces with sectioned visuals, and they use different class names — **don't conflate them, write parallel rules**:

| Surface | Section visual class | Hero visual class | CSS file |
|---|---|---|---|
| Homepage (`#/`) | `.sc-feature-visual` (+ `-left` mirror) | `.miniRoamOS .sc-window` | `ShowcaseMap.css` |
| Feature pages (`#/feature/*`, `#/pricing`) | `.fp-section-visual` | `.fp-hero-stage` | `FeaturePage.css` |

Every recipe below was authored against the homepage selectors first. When you bring it to a feature page, **mirror the rule onto `.fp-section-visual` and `.fp-hero-stage`**. Don't try to reuse the homepage rules as-is — they're scoped to selectors the feature page doesn't have.

The two files are independent: `FeaturePage.css` does NOT inherit `ShowcaseMap.css` mobile rules. New mobile work on a feature page goes in the `@media (max-width: 768px)` block at the bottom of `FeaturePage.css`.

## 0a. Scale, don't resize (the load-bearing rule)

The single most important rule in this playbook: **app windows keep their desktop intrinsic size on mobile, then shrink visually with `transform: scale(...)`. Never resize them with `width`/`height` overrides.**

Why: the windows have JS layout calcs (CrowdGrid avatars-per-room, BigMeeting tile counts, MeetingWindow aspect-ratio bodies, map floor-plan layouts) that read `offsetWidth`/`offsetHeight`. Resizing the window squashes capacity calculations, breaks tile counts, and clips toolbars. Scaling preserves the layout and just renders it smaller.

Applies to: `.meeting-win`, `.theater-win`, `.ainbox-window`, `.mm-win`, `.lb-win`, `.mc-win`, `.sc-onit-window`, `.onair-window`, AND the embedded ShowcaseMap `.sc-window` inside `.fp-map-preview`. The MapPreview is a special case because the desktop `.fp-map-preview .sc-window` rule sets `position: absolute; width: 100%; height: 100%` which IS resizing — on mobile we override to `position: relative; width: 1120px; height: 630px; transform: scale(0.75); transform-origin: top center` and let it crop sides via the visual's `overflow: hidden`. See `FeaturePage.css` mobile block.

If you ever find yourself writing `width: 360px` or similar on a mobile window override, stop — that's resizing. Restore the desktop size and add `transform: scale(...)` instead.

**For windows whose desktop "intrinsic" size is a `width: calc(...)` (grid-column based) rather than a fixed pixel value** — e.g. `.fp-wb-window`, `.fp-mb-window`, `.fp-mm-preview` — pick a fixed pixel width that matches the desktop *look* (945, 1120, etc., depending on the window's aspect-ratio numerator) and force it on mobile via `width: Xpx !important`. THEN apply `transform: scale(0.75)` from `top left`. The visual frame uses `height: auto` and `padding: 32px 0 32px 32px` so the right side overflows off-screen and the visual height adapts to the scaled content. **Do NOT use `width: 100%` on these — that's resize.** The user has corrected this multiple times.

### 0a-h. Default wrapping for ANY meeting-style window on a feature page

When a section visual contains a window from the meeting-win family — `.meeting-win`, `.theater-win`, `.ainbox-window`, `.mm-win`, `.lb-win`, plus the existing wrappers (`.fp-as-preview`, `.fp-big-meeting`) — and the user wants:
- Window scales like the others (not resized)
- Pinned to the left with 32px padding
- Visual hugs the window height

…the answer is **always** to wrap the preview in `.fp-knock-preview.fp-roamoji-preview > .fp-lock-frame`:

```jsx
function MyPreview() {
  return (
    <div className="fp-knock-preview fp-roamoji-preview">
      <div className="fp-lock-frame">
        <TheaterWindow ... /> {/* or MeetingWindow, AInbox, etc. */}
      </div>
    </div>
  );
}
```

This gets the canonical layout=render recipe automatically — no per-component CSS needed. It works for: TheaterPreview, KrispPreview, RaisedHandsPreview, LockedRoomPreview, RoamojiReactionsPreview, ClosedCaptionsPreview, MagicMinutesPreview, BigMeetingPreview, ActiveSpeakerPreview.

**Do this PROACTIVELY** whenever you add a new meeting-style preview component or whenever the user reports "the window isn't scaling like the others / isn't pinned to the left / the visual container isn't hugging." This recurring complaint always has the same fix; the user has called it out 3+ times now.

The line-up of which previews use this wrapper currently lives in TheaterPreview, BigMeetingPreview, ActiveSpeakerPreview, KrispNoiseCancellationPreview, RaisedHandsPreview wrapper logic (LockedRoomPreview shares the same `.fp-knock-preview.fp-roamoji-preview` outer), MagicMinutesPreview, RoamojiReactionsPreview, ClosedCaptionsPreview. New entries should follow suit.

### 0a-i. The Layout = Render trick (for parents that auto-size to content)

`transform: scale()` doesn't affect layout. A 780×580 element scaled to 0.75 still occupies 780×580 in the box model — it just RENDERS at 585×435. When the parent auto-sizes to its content (e.g. a flex container, a `height: auto` visual frame), it sizes to the unscaled 780×580 and you get extra empty space below/right of the visible scaled content.

The homepage hero map fixes this with negative margins (`margin-bottom: -158px` for a 630-tall scaled .sc-window). That works when the parent is fixed-size, not auto.

**For parents that auto-size, the cleaner trick is to make the OUTER WRAPPER the scaled-visible size and put the transform on an INNER element that's absolutely positioned at the desktop intrinsic size:**

```css
/* Outer wrapper takes the scaled visible dimensions — layout = render */
.fp-big-meeting {
  position: relative !important;
  width: 585px !important;
  height: 435px !important;
  flex-shrink: 0 !important;
  display: block !important;
}
/* Inner element keeps desktop intrinsic dimensions, scales visually */
.fp-big-meeting > .meeting-win {
  position: absolute !important;
  top: 0 !important; left: 0 !important;
  right: auto !important; bottom: auto !important;
  width: 780px !important;
  height: 580px !important;
  transform: scale(0.75) !important;
  transform-origin: top left !important;
}
```

Now the parent (visual frame) hugs 585×435 perfectly. No margin tricks, no overflow workarounds. This is the canonical recipe — use it whenever the visual height should "hug the app window".

If you reach for `margin-bottom: -Npx` to compensate for the scale overhang, stop and use the layout=render pattern instead. It's been corrected multiple times.

## 1. Feature visual frame

The per-section card that wraps the desktop window mock. On mobile:

- `width: 100%`, `overflow: hidden`, `position: relative`, `pointer-events: none`.
- Visual height **hugs the inner window with 32px vertical padding**. Don't use a single global height.
- Border: `box-shadow: 0 0 0 1px var(--border)` on the visual frame itself. Don't put it on the wallpaper — the visual's `overflow: hidden` clips outward shadows on children.

Heights per window kind (same numbers on both surfaces):
- 780×580 windows scaled 0.75 (Meeting, Theater, AInbox, Magic Minutes, Lobby, On-Air-as-scaled, **and the Drop-In knock frame**): **499px**, top-pinned with `padding: 32px 0 0; align-items: flex-start; justify-content: center`. The 32px top + 32px bottom (= 499 - 435) reads as wallpaper above and below the scaled window.
- Magicast / On-It / On-Air (fill-width treatment): `height: auto` + `aspect-ratio: 780 / 1080`.
- Drop-In and Virtual Office (embedded ShowcaseMap): **537px** (= 472 rendered + 64).
- Recordings (`.fp-desktop`) and calendar (`.fp-cal-preview`): `height: auto`, `padding: 0`.

Why top-pin instead of center: every window with `transform: scale(0.75); transform-origin: top center` keeps its top edge in place during scaling. If the visual uses `align-items: center` (the desktop default), the unscaled 580-tall box centers vertically inside a 499-tall frame — its top sits at -40px and the visible scaled output overflows the visual top. `align-items: flex-start; padding-top: 32px` makes the top edge land at 32px and the scaled window read flush with 32px wallpaper above and below.

Use `:has()` to scope. Homepage:

```css
.sc-feature-visual:has(.meeting-win),
.sc-feature-visual-left:has(.meeting-win),
/* …theater-win, ainbox-window, mm-win, lb-win, onair-window… */
{
  height: 499px;
}
```

Feature pages — same heights, mirrored onto `.fp-section-visual` and `.fp-hero-stage`:

```css
.fp-section-visual:has(.meeting-win),
.fp-hero-stage:has(.meeting-win),
/* … */ {
  height: 499px;
  padding: 0;
}
```

## 2. Window placement inside the wallpaper

```css
.sc-feature-wallpaper {
  width: 100%;            /* not 760px overflow */
  align-items: flex-start;
  justify-content: center;
  padding: 32px;
}
```

Then keep the desktop intrinsic size + scale:

```css
.sc-feature-visual .meeting-win, /* + theater, mm, ainbox, onair */ {
  width: 780px !important;
  height: 580px !important;
  flex-shrink: 0;          /* CRITICAL — flex parent will otherwise shrink it */
  transform: scale(0.75);
  transform-origin: top center;
}
```

Variants:

- **Lobby** (Scheduling): same but `transform-origin: top left` and wallpaper `justify-content: flex-start`. Pins the settings window 32px from the left.
- **AInbox** (Group Chat): same as Lobby — pinned to the left.
- **Magicast / On-It / On-Air**: fill-width, no scale.
  ```css
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  aspect-ratio: 780 / 1080;
  transform: none !important;
  border-radius: var(--radius-xl) !important;
  corner-shape: superellipse(1.6) !important;
  overflow: hidden !important;
  ```
- **Drop-In map** on homepage (`.sc-feature-visual-map:not(.sc-feature-visual-left)`): wallpaper `width: 100%`, host `justify-content: center; align-items: flex-start; padding: 32px 0 0`, `.sc-window` keeps its hero-rule `transform: scale(0.75)` but with `transform-origin: top center !important`.
- **Virtual Office map** on homepage (`.sc-feature-visual-left.sc-feature-visual-map`): unchanged — keeps the desktop top-left peek.
- **MapPreview on feature pages** (`.fp-section-visual .fp-map-preview` / `.fp-hero-stage .fp-map-preview`): the desktop rule pins the inner `.sc-window` to `position: absolute; width:100%; height:100%` — that's resizing, which we don't want. On mobile, override to scale instead. Default placement is **pinned to the left** with `padding: 32px 0 32px 32px` (32px left + 32px vertical, 0 right) — the scaled window's right edge overflows past the visual and is cropped via `overflow: hidden`. Don't add right padding; the off-screen crop is the intended look (matches the homepage virtual-office hero alignment). Sections that want a centered map opt in with `data-map-align="center"` on the `.fp-section-visual` / `.fp-hero-stage` element.
  ```css
  /* Default — left-pinned, 32px left + 32px vertical, 0 right.
     Don't use flex layout here because .miniRoamOS is absolutely
     positioned with `inset: 0` in the desktop rule, which ignores
     .fp-map-preview's padding entirely. Override .miniRoamOS to inset
     by the same padding amounts — that becomes the positioning
     context for .sc-window. */
  .fp-section-visual .fp-map-preview,
  .fp-hero-stage .fp-map-preview {
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: auto !important;
    border-radius: 0 !important;
    padding: 32px 0 32px 32px !important;
    overflow: hidden;
  }
  .fp-section-visual .fp-map-preview .miniRoamOS,
  .fp-hero-stage .fp-map-preview .miniRoamOS {
    position: absolute !important;
    top: 32px !important;
    left: 32px !important;
    right: 0 !important;
    bottom: 32px !important;
    width: auto !important;
    height: auto !important;
  }
  /* WARNING: do not add `inset: auto !important` to defeat the desktop
     `inset: 0` rule. CSS shorthand order matters — a later `inset` (even
     with `auto`) overrides earlier longhand top/left/right/bottom and
     collapses the .miniRoamOS to width/height: auto, hiding the map. The
     longhand `top/left/right/bottom !important` already beats `inset: 0`
     by source order. */
  /* Scale the embedded ShowcaseMap window — keep desktop intrinsic size. */
  .fp-section-visual .fp-map-preview .sc-window,
  .fp-hero-stage .fp-map-preview .sc-window {
    position: relative !important;
    top: auto !important; left: auto !important;
    right: auto !important; bottom: auto !important;
    width: 1120px !important;
    height: 630px !important;
    aspect-ratio: 16 / 9;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    flex-shrink: 0;
    transform: scale(0.75) !important;
    transform-origin: top left !important;
  }
  /* Opt-in — centered alignment for sections that need it. */
  .fp-section-visual[data-map-align="center"] .fp-map-preview,
  .fp-hero-stage[data-map-align="center"] .fp-map-preview {
    justify-content: center;
    padding: 32px 0 !important;
  }
  .fp-section-visual[data-map-align="center"] .fp-map-preview .sc-window,
  .fp-hero-stage[data-map-align="center"] .fp-map-preview .sc-window {
    transform-origin: top center !important;
  }
  ```
- **Knock frame** on feature pages (`.fp-section-visual .fp-knock-frame`): the frame normally has a 10/12-col `width: calc(...)` and the inner `.meeting-win` is `width: 100%`. On mobile force frame to `width: 100%; aspect-ratio: 780/580`, then keep the `meeting-win` at `width: 100%; height: 100%; transform: none` (it inherits the frame's size, not the desktop intrinsic 780). This is the **one exception** to "always scale" — the frame is itself the scaled box, the meeting-win fills it.

## 3. Hide on mobile (existing components, no JSX changes)

- `.mc-bubble` — Magicast floating PiP bubble.
- `.onair-colors` — On-Air side color picker.
- `.onair-tools` — On-Air right toolbar.
- `.onit-replay` — On-It "Replay" button (cramped at narrow width).

## 4. Type ramp adjustments inside scaled / fill-width windows

The chrome scales but text inside doesn't always. Force smaller sizes on mobile.

On-It (`.sc-feature-visual .sc-onit-window …`):
- chat bubbles `.mc-msg-bubble p`: 13 → **11px / 15 line**
- header `.onit-summary`/`.onit-summary-text`: → **12px / 16 line**
- step list / card name `.onit-step`, `.onit-card-name`: 12 → **11px / 14 line**
- composer input: 14 → **12px**

On-Air (`.sc-feature-visual .onair-window …`):
- container `.onair-center` → `width: calc(100% - 32px)` to fill the window with 16px gutters.
- `.onair-input` → **11px / 14 line**, `.onair-input-title` → **16px / 20 line**, `.onair-host-label` → **11px**
- The visible text comes from the `<input>` (not the field container) — target `.onair-input*`, never `.onair-field`.
- `.onair-field` inner padding → **6px 10px**.

Drop-In knock icon (story bubble): on mobile drop `filter: brightness(10)` and let the SVG's white fills + alpha layers render natively; bumped to 24px on mobile so the alpha layers survive the embedded-map's 0.75 scale-down.

## 5. Native mobile views (rendered inside `MobileWindow`, not as desktop wraps)

Add a prop to `MobileWindow`, render an absolutely positioned overlay inside `.mw-screen` covering everything below the status bar (`top: 38px`). All three exist already:

- `MobileKnockSequence` (`autoKnock` prop) — Drop-In Meetings demo. Static knock dialog over the mobile map. Knock icon uses the **mask-tint pattern** (mask-image + `background: var(--icon-primary)`) so it picks up theme color, with the same rocking pulse keyframes as the desktop knock dialog.
- `MobileElevatorOverview` (`elevator` prop) — Switch Floors. Bottom sheet sliding up via IntersectionObserver on the parent (`.mw-content.mw-map`), `top: 44px` (6px below the status bar), `var(--bg-surface-elevated-primary)` bg, top-rounded `var(--radius-2xl)`, `padding: 8px`. Floor cards inside use `var(--background-primary)`, `padding: 12px`, `border-radius: 16px`. Cells: `background-primary`, `4.873px` gap/padding/radius, **19.493px** avatars (matches Figma). Theater cells get a 41px stage rect on top + audience-seat `dock` pattern. **Disable scroll** on the floors container (`overflow: hidden`) — content is illustrative.
- `MobileMagicMinutesChat` (`magicMinutesChat` prop) — group chat conversation. Uses `<AinboxScroller topInset={56}>` for drag-to-pan + momentum (NOT `overflow-y: auto`). Gradient fade above the list via `.mw-mm-chat::before` (`top: 0; height: 96px; z-index: 2; background: linear-gradient(...) + mask-image: linear-gradient(black, transparent)`). z-stack: list `z: 1`, gradient `z: 2`, header `z: 3`, footer `z: 4`. Composer bottom padding **24px**. Typing indicator: AInbox-style absolute avatar stack with z-0 dots bubble, sits behind the composer with `top: -24px`.

When adding magicMinutesChat / autoKnock / elevator / theater / lockscreen, **gate every other view** with `!magicMinutesChat` (etc.) or you'll see the overworld bleeding through translucent areas.

## 6. Buttons and chrome

Map back button = `.mw-top-avatar.mw-top-back` (32×32 glass circle). Reuse this exact treatment for any back/dismiss button:
- Theater nav back & leave: `.mw-theater-icon-btn` styled identically (32×32, same inset bevels). Apply `transform: rotate(180deg)` to the **SVG only**, not the button — rotating the whole button mirrors the asymmetric inset highlights and the back button looks different from the leave button.
- Elevator close `mw-elevator-close`: uses the same `.mw-top-avatar.mw-top-back` classes but adds `transform: none !important` to undo the chevron-flipping rotation.
- AInbox compose button `.mw-ainbox-compose`: uses the same liquid-glass block.

iOS chevron uses `<ChevronIcon size={14} />`. Android uses `<MaterialBackArrowIcon size={16} />` (arrowhead + horizontal line). Pick by `platform === 'android'`. iOS chevron sits visually centered without any translate offset.

Cursor on these buttons: `pointer`, not `default`.

Glass treatments (`.mw-tabbar-main`, `.mw-tab-eye`, `.mw-theater-icon-btn`, `.mw-top-back`, `.mw-ainbox-compose`):
- Default (iOS): liquid-glass with displacement filter, `blur(14px) saturate(160%) brightness(1.05)` (webkit) and `blur(2px)` (with displacement) on the standard property. Inset highlights use a 1px border ring + 2px-blur corner highlights at modest opacities (`0.12 / 0.35 / 0.5 / 0.25` dark-mode set).
- Android (`.mw-win-android` ancestor): drop the displacement filter, drop the shadows, drop the asymmetric bevels. `background: rgba(255, 255, 255, 0.08)`, `backdrop-filter: blur(24px) saturate(140%)`, `border: 1px solid var(--border)`, `box-shadow: none`.

## 7. Footer CTA banner (on the homepage and feature pages)

`<FloatingCTA />` early-returns `null` when `(max-width: 768px)` matches via `matchMedia` — CSS-only `display: none` was unreliable on Safari. Don't try to fix the appearance on mobile, just don't render it.

`.fp-footer-cta` (the in-page banner) on mobile:

```css
@media (max-width: 768px) {
  .fp-footer-cta-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;            /* was 64px */
  }
  .fp-footer-cta-lead { flex-direction: column; align-items: flex-start; gap: 12px; }
  .fp-footer-cta-icon { width: 56px; height: 56px; }   /* was 88×88 */
  .fp-footer-cta-title { font-size: 20px; letter-spacing: -0.4px; }
  .fp-footer-cta-sub { font-size: 14px; line-height: 20px; }
  .fp-footer-cta-text { gap: 8px; }
  .fp-footer-cta .fp-cta-row { width: 100%; flex-direction: column; }
  .fp-footer-cta .fp-cta-row .sc-promo-btn { width: 100%; }
}
```

Themed inversion is split between two files:
- FeaturePage uses `[data-theme="dark"] .fp-footer-cta-inner { … }` and matching light rules.
- ShowcaseMap homepage uses `.sc-viewport[data-theme="dark"] …` (theme attr lives on `.sc-viewport`, not the document root).

If you add a new themed surface that should invert on the homepage, scope to `.sc-viewport[data-theme="…"]`. The token override block at the top of `ShowcaseMap.css` is what makes `--background-primary`, `--bg-primary`, etc. resolve to dark-on-light values inside the homepage shell.

`.fp-footer-cta-icon` styling lives **only** in `FeaturePage.css`. ShowcaseMap.jsx doesn't import that file, so we mirror the icon rule (88×88, `object-fit: contain`) and the inverted-theme rules into `ShowcaseMap.css`. If you reference an `fp-footer-cta-*` class on the homepage, mirror its styles.

## 8. Reviews + footer trim on mobile

```css
.sc-reviews-container .sc-review-card:nth-child(n+5) { display: none; }  /* top 4 only */
.sc-reviews-container { padding-bottom: 0; }
.sc-footer-nav .sc-footer-col:not(:last-child) { display: none; }        /* Follow only */
.fp-footer-cta { margin-top: 16px; }                                     /* tight gap */
```

## 9. Tokens — never hardcode

- Border radius: `var(--radius-xs/sm/md/lg/xl/2xl/3xl)` from `woodward-tokens.css`. Always pair with `corner-shape: superellipse(1.6)`. Never raw `px`.
- Shadows: `box-shadow: var(--shadow-1..6)`. For masked elements where `box-shadow` can't follow the mask (e.g. Magicast bubble), use `filter: drop-shadow(...)` mirroring the same numeric values from the token.
- `--border` is the primary border token (10% white in dark, with light overrides). Use it for hairline borders. The footer-cta banner inverts in dark mode (white panel) — use the inverted theme rules above, don't redefine.
- Surface colors: `--bg-surface-primary` for default screens, `--bg-surface-elevated-primary` for raised panels (knock dialog, elevator sheet, mm chat composer area), `--bg-surface-elevated-primary-subdued` for inset panels (On-It task pane). `--background-primary` for subtle low-contrast backgrounds (cell fills inside the elevator floor cards, knock cancel button bg).
- Send icon, knock icon, etc. use existing assets in `/icons/` and `/icons/composer/`. For the chat composer, use `/icons/composer/Send.svg`. Don't inline SVG arrows.

## 10. Performance gotchas

- Story video previews: `preload="metadata"`, never `preload="auto"`. The default cost is 80–250MB on mobile.
- Lazy-load `FeaturePage` from `App.jsx` (it's 380K). `useFeatureRoute` does NOT validate against `FEATURES` (which lives in the lazy chunk) — pass through any matching slug; `FeaturePageInner` returns null for unknown.
- Embedded `ShowcaseMap` instances on the homepage mount via the `LazyVisible` wrapper (IntersectionObserver) — never mount these inline.
- **Section visuals on feature pages mount via `LazyVisualMount`** (`FeaturePage.jsx`), an IntersectionObserver-driven wrapper that defers the entire visual component tree until the section is within 600px of the viewport. Each visual reserves a 499px placeholder so layout doesn't shift. This is critical on the drop-in page (~25 heavy visuals — multiple `MapPreview` instances, `MeetingPreview`, `WhiteboardPreview`, `MediaBoardPreview`, etc.) where mounting all at once stalls mobile Safari hard. The wrapper lives in `FeatureSection`'s render — every section's `visual` is automatically wrapped.
- `useAnimatedNumber` (App.jsx) gates RAF on `document.hidden`. Any new RAF loop should do the same.
- `position: fixed` ancestor with `backdrop-filter` becomes a containing block for `position: fixed` descendants. The mobile menu broke when scrolled because of this — fix by moving the blur to a `::before` pseudo (see `.sc-navbar-wrap`). Same fix applies to any new translucent app-bar.
- `flex: 1; min-height: 0` is required for a flex child to be `overflow-y: auto`-scrollable. The default `min-height: auto` prevents it.
- Any video tag should default to `preload="metadata"`. `preload="auto"` triggers the browser to begin downloading the video data immediately, which is brutal on mobile bandwidth — only use it for videos that play immediately on page load (rare).

## 11. Project layout reminders

- Homepage: `src/ShowcaseMap.jsx` + `ShowcaseMap.css`. Mounted by `App.jsx` for `#/`.
- Feature pages: `src/FeaturePage.jsx` + `FeaturePage.css`. Mounted via `useFeatureRoute` for `#/feature/:slug`. The pricing page is `#/pricing` and rides the same `useFeatureRoute` (matched as the `pricing` slug) — content lives in the `FEATURES.pricing` entry, hero visual is hidden via `.fp-page[data-slug="pricing"] .fp-hero-visual { display: none }`.
- Mobile simulator: `src/MobileWindow.jsx` + `MobileWindow.css`. `<MobilePreview ... />` (in `FeaturePage.jsx`) wraps it for use as a section visual; pass props (`magicMinutesChat`, `autoKnock`, `elevator`, `richMap`, `initialPlatform`, etc.) through.
- Tokens: `src/woodward-tokens.css`. Light-mode overrides for the homepage live in `ShowcaseMap.css` (`.sc-viewport[data-theme="light"]`); FeaturePage's light overrides are at the bottom of `woodward-tokens.css`.
- Headshots in `public/headshots/`. Existing pool (don't reference names that aren't here): aaron-wadhwa, arnav-bansal, ava-lee, chelsea-turbin, derek-cicerone, garima-kewlani, grace-sutherland, howard-lerman, jeff-grossman, joe-woodward, john-beutner, john-huffsmith, john-moffa, jon-brod, keegan-lanzillotta, klas-leino, lexi-bohonnon, mattias-leino, michael-walrath, peter-lerman, rob-figueiredo, sean-macisaac, thomas-grapperon, will-hou.

## 12. Workflow notes

- Treat the mobile pass for each feature page as: visual height → window placement → text scale → hide-list → button cursors. Then check at iOS + Android in the simulator.
- When user says "the gradient" they mean the `.mw-topbar-bg`-style fade (top-down to transparent with mask). The fade only reads against scrollable content, not against a flat solid bg of the same color. Don't add a flat dark gradient on top of an already-dark surface and expect to see it.
- "On the ramp" = "in the type ramp / on mobile" (size scale).
- The user iterates fast and prefers small visible steps over big sweeping changes. When uncertain, ship a smaller change and let them course-correct.

## 13. FeaturePage mobile pass — what's in `FeaturePage.css`

There is one big `@media (max-width: 768px)` block at the bottom of `FeaturePage.css` that ports every applicable homepage pattern onto `.fp-page` selectors. When a feature page looks broken on mobile, check this block first — if a rule isn't there, it isn't applied.

What it covers:
- **Hero**: padding-top `180→120`, title `clamp → 24px`, sub `13px`, stacked full-width CTAs.
- **Hero stage**: same `:has()` heights as section visuals; wallpaper padding dropped (the inner window is the visual).
- **Sections**: `.fp-section` collapses to single column, padding `96→48px` vertical.
- **Visual frame**: `.fp-section-visual` and `.fp-hero-stage` get the heights table from §1, the window-placement rules from §2, the hide-list from §3, the type-ramp from §4. Every rule is mirrored across both selectors.
- **Map preview**: scale-not-resize override per §2 (the desktop rule pins `position: absolute; 100%×100%` which would resize — explicitly overridden to `position: relative; 1120×630; transform: scale(0.75); transform-origin: top center`).
- **Variant sections**: `.fp-section-cards`, `.fp-section-explore`, `.fp-section-compare`, `.fp-section-cards-row`, `.fp-section-columns` all collapse to single-column on mobile so the `grid-column: span N` desktop placements don't bleed into implicit columns.
- **Footer CTA**: same stacked-column treatment as homepage (§7).

When you start a fresh feature page mobile pass, the framework above usually handles 80% of it without page-specific rules. The remaining 20% is custom things — extra type-ramp tweaks for unusual visuals, hide rules for one-off floating elements, etc. Add those as `data-slug=...`-scoped rules under the same media query.

`.sc-viewport`'s mobile token override (`--grid-columns: 1`, `--grid-margin: 16px`, `--grid-gutter: 16px`) lives in `ShowcaseMap.css` and applies to FeaturePage too because `.fp-page` carries the `.sc-viewport` class. Don't redeclare it.

**Source-order gotcha**: the main mobile `@media (max-width: 768px)` block sits around line 5020. Many desktop rules — including `.fp-quote-author/role/text`, the magicast/on-air variants in §2, and other long-tail selectors — are declared **after** that block. Same-specificity rules defined later win by source order regardless of media-query state, so a mobile rule for those selectors inside the main block silently no-ops. There's a second small `@media (max-width: 768px)` block at the **end of the file** for exactly this case. Add late-bound mobile rules there (and leave a comment in both spots so they stay easy to find).

## 14. Map alignment system (`mapAlign` prop + `data-map-align` CSS)

Each `<MapPreview>`-style section can opt into a non-default alignment via a `mapAlign` prop on the section config. `FeatureSection` writes that to `data-map-align` on `.fp-section-visual`, and the mobile CSS reads it.

| Value | Default? | Padding | `.miniRoamOS` inset | `.sc-window` anchor |
|---|---|---|---|---|
| (none) — left-pinned | yes | `32px 0 32px 32px` | `top:32; left:32; right:0; bottom:32` | `top:0; left:0; transform-origin: top left` |
| `'center'` | opt-in | `32px 0` | `top:32; left:0; right:0; bottom:32` | `left:50%; transform: translateX(-50%) scale(0.75); transform-origin: top center` |
| `'right'` | opt-in | `32px 32px 32px 0` | `top:32; left:0; right:32; bottom:32` | `right:0; transform-origin: top right` |

**When to pick which:**
- **Left** (default): the visible window covers the left ~75% of the visual, right side overflows off-screen and crops via `overflow: hidden`. Best for sections whose interesting content is on the left of the map (e.g. Drop-In, Virtual Office hero).
- **Center**: useful when the section has a centered overlay (Spotlight Search, the Drop-In knock dialog) — both sides crop equally and the dialog reads as anchored to the window's middle.
- **Right**: mirror of left. Use when the section's visual focus is on the right side of the map (e.g. Elevator with the floor sidebar).

Don't use `data-map-align` for non-map visuals — it only matches `.fp-map-preview` descendants.

## 15. Putting overlays INSIDE the window (portals over CSS positioning)

When a modal overlay (scrim + dialog) needs to appear "inside" the scaled/centered map window, the right answer is almost always to **portal it into `.sc-window`** rather than position-fight via CSS.

The Spotlight Search overlay learned this the hard way. The overlay used to be a sibling of `<ShowcaseMap>` inside `.fp-map-preview` — it sat in the broader preview wrapper, not the visible scaled window, so on mobile the dialog drifted onto the wallpaper margins as the window centered/cropped. Several CSS-only attempts to confine the scrim to "where the visible window is" all broke at different viewport widths.

The fix in `MapPreview` (`FeaturePage.jsx`):

```jsx
const [spotlightHost, setSpotlightHost] = useState(null);
useEffect(() => {
  if (!spotlightSearch) return;
  let raf = 0;
  const findHost = () => {
    const el = wrapRef.current?.querySelector('.miniRoamOS .sc-window');
    if (el) setSpotlightHost(el);
    else raf = requestAnimationFrame(findHost);
  };
  findHost();
  return () => cancelAnimationFrame(raf);
}, [spotlightSearch]);
// …
{spotlightSearch && spotlightHost && ReactDOM.createPortal(<>…</>, spotlightHost)}
```

Since the scrim and dialog are now real DOM children of `.sc-window`, they:
- inherit the window's `transform: scale(0.75)` (and the centered `translateX(-50%)`),
- get clipped to the window's rounded corners by its `overflow: hidden`,
- absolute-position relative to the window itself (so `inset: 0` on the scrim and `top:50%; left:50%; transform: translate(-50%,-50%)` on the dialog "just work").

When you see this pattern again — modal overlay needs to be visually "inside" the window — reach for `createPortal` first. Trying to fake it with `:has()` selectors and inset rules eats hours.

## 16. The late-bound mobile block at end-of-file

`FeaturePage.css` has TWO mobile media blocks — the main one near line 5020 and a small one at the very end (~9200). They exist for the same reason: same-specificity desktop rules win by source order even when both rules' `@media` matches.

**When to add a rule to the late-bound block** (instead of the main block):
- The desktop rule for the same selector lives **after** line 5020 in `FeaturePage.css`.
- Or you keep adding `!important` and rules still aren't applying.
- Or you want a single rule to override both desktop AND a same-specificity rule earlier in the mobile block.

**Selectors known to need the late-bound block** (will grow over time — when you find a new one, add it here):
- `.fp-quote-author/role/text` (text overlap on mobile)
- `.fp-section-explore .fp-explore-text/list` (explore variant grid stacking)
- `.fp-section-compare` (pricing card padding + row-gap)
- `.fp-footer-cta-*` (the polished mobile banner — column-stack, 56px icon, 20/14 type, full-width CTAs)

Rules in the late-bound block use `!important` defensively. The early mobile block does NOT use `!important` by default.

## 17. Map-preview edge cases (visuals that don't fit the default recipe)

The default scale-not-resize recipe (§2) covers most map sections. These are the exceptions worth knowing:

- **Map editor** (`.fp-map-editor-preview`): opt OUT of scale, fill the visual width with 32px horizontal padding instead — `position: absolute; top:32; left:32; right:32; bottom:32; width:auto; height:auto; transform: none`. The editor body uses absolute `inset:0` children that adapt to whatever box size you give it, so resizing is fine. Visual height bumped to 720px so it reads as a portrait container. The editor toolbar (trash + plus + swatches) re-pins to `position: absolute; left:12; top:50%; translateY(-50%); z-index: 10` and switches to `flex-direction: column` with bigger 32×32 buttons + 20×20 swatches and 14px swatch gap.
- **Map editor interactivity**: the canvas is non-interactive on mobile (so the page can scroll vertically through it) — scope `pointer-events: auto` only to `.toolbar-bg-swatches *` so users can still tap colors.
- **Map editor canvas shift**: `.big-meetings-view { left: -100px; right: -100px }` on mobile shifts the canvas content so Computer Department (centered at the canvas origin) lands in the LEFT half of the visible body.
- **Animated DM popups** (`.mc-window`): ShowcaseMap portals these to the closest `.fp-section-visual` (see `dmPortalTarget`), so they're a DIRECT child of `.fp-section-visual`, NOT inside `.fp-map-preview`. The selector that matches is `.fp-section-visual > .mc-window`. Mobile pins them to `top:16; left:16` and scales 0.75 from top-left to match the map. The desktop On-It-pin rule has higher specificity (0,3,0 via `:has(.fp-map-preview-onit-pin)`), so the mobile rule has to add `:has(.fp-map-preview)` to match specificity and win by source order.
- **Knock frame** (`.fp-knock-frame`): the frame IS the scaled box (sized 780×580 with `transform: scale(0.75)`), inner `.meeting-win` fills it at `width:100%; height:100%; transform: none`. Don't apply scale twice. Visual uses the standard meeting-win heights/alignment from §1.
- **Recordings + Calendar** (`.fp-rec-preview > .rec-win`, `.fp-cal-preview > .cal-win`): scale-not-resize at 780×580 → 0.75 from top-left, pinned at top:32; left:32 of a 499px-tall visual. Wrapper gets `width: auto; display: block; flex-shrink: 0` plus `margin-left/top: 32px` since the wrapper itself doesn't have positioning helpers like `.miniRoamOS`.
- **MiniRoamOS positioning anchor**: the `.miniRoamOS` element between `.fp-map-preview` and `.sc-window` has a desktop rule `position: absolute; inset: 0`. To honor `.fp-map-preview`'s mobile padding, override `.miniRoamOS` to inset by the same amounts (`top:32; left:32; right:0; bottom:32` for the default left-pinned recipe). **Don't use `inset: auto !important` to "reset" — the shorthand will clobber preceding `top/left/right/bottom: Xpx` longhands declared in the same rule.** Use individual longhand properties only.

## 18. Single shared FooterCTA component

`<FooterCTA title="…" />` (`src/FooterCTA.jsx`) is the one banner that sits above the footer on every page (homepage, feature pages, pricing). Both `ShowcaseMap.jsx` and `FeaturePage.jsx` render it. There used to be two copies of the JSX with slight title differences — that drift is what motivated the extraction.

When a styling fix needs to apply to "the banner," touch the CSS class `.fp-footer-cta-*` once and trust both pages will pick it up. Don't add new copies of the JSX.

CSS lives in two places (intentional — see §7):
- `FeaturePage.css` for the master rules and feature-page mobile overrides.
- `ShowcaseMap.css` mirrors them for the homepage's themed inversion (the dark-mode footer variant).

## 19. CSS shorthand pitfalls

`inset: auto !important` written **after** `top/left/right/bottom: Xpx !important` clobbers all four longhands back to `auto` — even though both have `!important`. The browser applies declarations in source order; `inset` is a shorthand for the four longhands, so it overwrites them. Effect: the element collapses to `auto`/`auto`/`auto`/`auto`, becomes 0×0 if no width/height is set, and disappears.

Symptoms: an element you positioned with explicit longhands renders invisible / off-screen / collapsed.

Fix: don't use `inset` in the same rule as longhands. If you need to defeat a desktop `inset: 0 !important`, use longhands only (`top: 32px !important; left: 32px !important; …`). The longhands win by source order regardless of the shorthand.

Same trap applies to `margin` / `padding` / `border-radius` shorthands stomping their longhands. Pick one and stick with it inside a single rule.

## 20. Global app-window shadow strip

`App.css` has a single rule at end-of-file that strips `box-shadow` from every "app window" mock — `.sc-window`, `.meeting-win`, `.theater-win`, `.ainbox-window`, `.mm-win`, `.lb-win`, `.mc-win`, `.mc-window`, `.sc-onit-window`, `.onair-window`, `.cal-win`, `.rec-win`, `.fp-knock-frame`. Each window's own CSS file declares `box-shadow: var(--shadow-5)` at the top; the global override beats them all with `!important`.

Why: the visual frames have `overflow: hidden` (so map overflows crop cleanly), which clips the windows' outward shadows and produces half-shadow artifacts along whichever edge crops. Dropping the shadow on every window is consistent and reads cleaner against the wallpaper backdrop. The hairline `--border` carries the lifting on its own.

When you add a new app-window class, add it to that list in `App.css`.

## 22. The `.fp-roamoji-preview` left-pinned wrapper pattern

For any feature-page visual that should be a meeting-window-style 780×580 → 0.75 scaled box pinned to the **left** with 32px padding (Roamoji Reactions, Closed Captions, Magic Minutes, Whiteboard, Media Board, 300-Person Meetings, Active Speaker — anything that visually sits in the same family as the meeting-win):

**JSX**: wrap in `.fp-knock-preview.fp-roamoji-preview > .fp-lock-frame > [original wrapper]`. The outer `.fp-knock-preview` provides the centering shell (overridden), `.fp-roamoji-preview` is the marker class that opts into left-pinning, `.fp-lock-frame` is the scaled box.

**CSS** (in `FeaturePage.css` mobile media block):
- `.fp-section-visual:has(.fp-roamoji-preview)` → `height: auto; padding: 32 0 32 0; align-items: flex-start; justify-content: flex-start`
- `.fp-roamoji-preview` → `justify-content: flex-start; align-items: flex-start; padding-left: 32px` (defeats `.fp-knock-preview`'s default centering — must override BOTH axes, only justify isn't enough)
- `.fp-roamoji-preview .fp-lock-frame` → use the layout=render recipe from §0a-i (585×435 outer, absolute 780×580 inner with scale)

For windows that aren't sized 780×580 but should still be left-pinned with the 0.75-scaled-meeting-win look (Whiteboard, MediaBoard which are aspect 945/580), force them into the lock-frame box anyway — the slight horizontal compression is the price of visual consistency. The user has explicitly chosen consistency over aspect-faithfulness ("i want it to be the same as the others").

## 23. The `interactive: true` opt-in for mobile sections

Mobile visuals are pointer-events:none by default (so the page scrolls cleanly through them). Some sections need to stay tappable — e.g. Roamoji Reactions where the user should be able to send reactions back, the map editor where swatch taps should change colors.

**Section config**: add `interactive: true` to the FEATURES entry. `FeatureSection` writes it as `data-interactive="true"` on `.fp-section-visual`.

**CSS** (mobile media block):
```css
.fp-section-visual[data-interactive="true"],
.fp-section-visual[data-interactive="true"] *,
.fp-hero-stage[data-interactive="true"],
.fp-hero-stage[data-interactive="true"] * {
  pointer-events: auto !important;
}
```

For partial interactivity (map editor — disable canvas, keep swatches tappable), don't use `data-interactive` on the whole visual. Scope `pointer-events: auto` to a specific descendant (e.g. `.fp-section-visual:has(.fp-map-editor-preview) .toolbar-bg-swatches *`).

## 24. Tile gap inside scaled meeting-wins on mobile

The MeetingWindow grid uses `gap: 8px` on desktop. After `transform: scale(0.75)`, that renders as 6px between video tiles — too cramped for mobile. Bump to 16px so the rendered gap is 12px:

```css
.fp-section-visual .fp-knock-frame .meeting-win-grid,
.fp-section-visual .fp-lock-frame .meeting-win-grid,
.fp-section-visual .fp-krisp-frame .meeting-win-grid {
  row-gap: 16px !important;
  column-gap: 16px !important;
  align-content: start !important;
}
```

Use `row-gap` + `column-gap` separately (not the `gap` shorthand) so they stay equal even if other rules touch one. `align-content: start` instead of the desktop `center` so extra vertical space gets absorbed at the bottom rather than read as a wider row-gap.

## 25. Scaled-window inline-positioned overlays break on mobile

When a popover (Raised Hands, Krisp panel) or magnify pin (Locked Room, Physical Office Tags) is positioned via inline styles calculated from `getBoundingClientRect()` (measure the target element, anchor the overlay relative to it), the math goes wrong inside scaled parents.

**Two failure modes depending on which scale recipe the parent uses:**

1. **`transform: scale()` on the parent (old recipe)**: `getBoundingClientRect()` returns POST-TRANSFORM coordinates, but the inline `left`/`top` is applied in the parent's UNSCALED coordinate space. The CSS transform then scales those values again, so the overlay lands in the wrong place. You'd need to divide the measurement by the scale factor to compensate, or move the overlay outside the scaled parent.

2. **Layout = render recipe (preferred — see §0a-i)**: parent is at the scaled visible size (e.g. 585×435), inner is absolute at 780×580 with `transform: scale(0.75)`. The lock icon is rendered at the SCALED visual position (which equals its position in the parent's coordinate space, since they match). The overlay's inline `left/top` lands at the same coordinate. **Coordinates align — no math fix needed.**

**The right fix**: switch the visual to the layout=render recipe (add the `.fp-roamoji-preview` marker class to the outer wrapper). Then in the lock-frame children rule, exclude the overlays so they keep their inline positioning:

```css
.fp-section-visual .fp-roamoji-preview .fp-lock-frame > *:not(.fp-lock-magnify):not(.fp-magnify):not(.fp-hands-popover):not(.fp-krisp-popover) {
  /* layout=render rule for content (meeting-win, fp-as-preview, fp-big-meeting, etc.) */
  position: absolute !important;
  top: 0 !important; left: 0 !important;
  width: 780px !important; height: 580px !important;
  transform: scale(0.75) !important;
  transform-origin: top left !important;
}
```

When you add a new overlay class to a visual, add it to the `:not()` list in the lock-frame children rule.

For popovers that aren't anchored via JS measurement (e.g. dialog at center-bottom), the simple CSS override works:

```css
.fp-section-visual .fp-hands-popover {
  left: 50% !important;
  right: auto !important;
  bottom: 64px !important;
  transform: translateX(-50%) !important;
}
```

## 26. Don't override desktop layout for content inside scaled wrappers

When a window uses the layout=render recipe (or any `transform: scale()` mobile treatment), the **desktop content layout scales uniformly** — gap, padding, align-content, line heights, everything. Adding a mobile-specific tweak inside the scaled box diverges from desktop and creates visual inconsistencies.

**Repeated wrong instinct**: "the gap looks too small after scaling — bump it up." Don't. The 6px scaled gap is correct because every other dimension also scales uniformly to the same ratio. Bumping ONE thing makes IT bigger relative to the rest of the scaled layout.

If the desktop layout has a real bug (e.g. asymmetric row-gap from `align-content: center` + `grid-template-rows: auto`), fix the desktop layout, not the mobile override. Mobile inherits the fix.

The user has corrected this twice on the meeting-win grid gap and once on `align-content`. The right answer is: leave `.meeting-win-grid` alone on mobile.

## 27. The `interactive: true` opt-in patterns by visual type

Mobile visuals are `pointer-events: none` by default so the page scrolls cleanly. When a visual genuinely needs to be tappable, set `interactive: true` on the section config (writes `data-interactive="true"` on `.fp-section-visual`).

Sections that should opt in:
- **Roamoji Reactions** — users tap reactions to send back
- **Map Editor** — users tap the color swatches to change accent
- **Virtual Background / Face Touch Up** — users drag the CompareSlider handle horizontally
- Any future section with a meaningful tap/drag interaction

The map editor is a partial case: the canvas should NOT be interactive (page scroll wins), but the swatches should. For partial interactivity, scope `pointer-events: auto` to the specific descendant rather than using `data-interactive` on the whole visual:

```css
.fp-section-visual:has(.fp-map-editor-preview) .toolbar-bg-swatches,
.fp-section-visual:has(.fp-map-editor-preview) .toolbar-bg-swatches * {
  pointer-events: auto !important;
}
```

## 28. `LazyVisualMount` — defer heavy section visuals

Every feature page section's `visual` is wrapped in `LazyVisualMount` (`FeaturePage.jsx`). This is the single highest-impact mobile-Safari perf win on the drop-in page (and any page with many heavy visuals).

**What it does**: an IntersectionObserver-driven mounter. Until the section is within `rootMargin: '600px 0px'` of the viewport, the visual content is `null`. A placeholder `<div>` with `min-height: 499px` reserves space so layout doesn't reflow as visuals mount in. Once the observer fires (`shown: true`), the placeholder unmounts and the real content takes over.

**Why this matters**: the drop-in page has 25+ heavy visuals — multiple `MapPreview` instances (each embeds a full `ShowcaseMap`), `MeetingPreview`, `WhiteboardPreview`, `MediaBoardPreview`, custom canvases. Mounting all of these on initial render stalls mobile Safari for seconds. With lazy-mount, only the first 1–2 visuals mount on initial paint; the rest stagger in as the user scrolls. Per-component RAF loops, IntersectionObservers, ResizeObservers, and `setInterval` timers don't even initialize until the visual mounts. Same for video elements.

**The Fragment-after-mount trick** (load-bearing detail): once `shown: true`, `LazyVisualMount` returns `<>{children}</>` (Fragment) **NOT** a wrapper div. This is critical because:
- Portal targets are looked up via `closest('.fp-section-visual')` from inside the visual (e.g. shelf-win, dmPortalTarget). With a wrapper div between, `closest()` would still find `.fp-section-visual`, but the WRAPPER would also become a sibling target.
- CSS selectors target direct children: `.fp-section-visual > .fp-map-preview`, `.fp-section-visual > .mc-window`, `.fp-section-visual > .shelf-win`, plus the reset rule `.fp-section-visual > *:not(.shelf-win):not(.mc-window):not(.mc-bubble):not(.fp-tags-magnify)`. A wrapper div would break ALL of these — the visual is no longer a direct child.
- Layout-affecting flex rules on `.fp-section-visual` (display: flex; align-items; justify-content) target direct children.

So the implementation is:
```jsx
function LazyVisualMount({ children, minHeight = 499, rootMargin = '600px 0px' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => { /* IntersectionObserver */ }, [shown, rootMargin]);
  // Once mounted, drop the wrapper completely so DOM contracts match
  // pre-lazy-mount exactly.
  if (shown) return <>{children}</>;
  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
}
```

If you ever change `LazyVisualMount` to render a wrapper div (e.g. to add extra styling), expect things like the shelf-win, MapPreview alignment, and `.fp-section-visual > X` selectors to silently break. The Fragment-after-mount pattern is the contract.

## 29. Compare row padding consistency

`.fp-compare-row` has two variants — non-link rows render content directly inside the `<li>`, link rows nest content inside an `<a>`. Both need the SAME effective indentation (32px from card edge) for visual consistency between the Legacy Work and Roam Bundle columns.

The fix is to put padding on the row consistently AND let the anchor own its own padding when present, with the row's padding zeroed:

```css
.fp-compare-row {
  padding: 16px 32px;
  box-sizing: border-box;
  /* … */
}
.fp-compare-row-link {
  /* anchor takes over the padding — drop the row's so they don't stack */
  padding: 0 !important;
}
.fp-compare-row-anchor {
  padding: 16px 32px;
  box-sizing: border-box;
  width: 100%;
  /* … */
}
```

Without `box-sizing: border-box` on the anchor, `width: 100% + padding: 16px 32px` (default content-box) makes the anchor 64px wider than its parent li — visible as a jog in the right column. Easy to miss when adding new compare-table-style components later.

## 30. CSS `scale(calc())` length-vs-unitless gotcha

When using `transform: scale(calc(...))` for fluid scaling based on viewport width, the result of the calc MUST be a unitless number, not a length. `scale(<length>)` is invalid and silently fails — your transform doesn't apply, the scaled element renders at full natural size.

```css
/* BROKEN — `100vw - 80px` is a length, dividing by unitless 944 keeps
   it a length, scale() rejects it. Element renders at natural size. */
transform: scale(calc((100vw - 80px) / 944));

/* WORKS — length ÷ length = number (per CSS Values 4). scale() accepts. */
transform: scale(calc((100vw - 80px) / 944px));
```

This pattern is useful for visuals that need to fit a fluid width on mobile where a fixed scale factor doesn't generalize (e.g. WhisperPreview's grid). The wrapper height matches via parallel calc: `height: calc((100vw - 80px) * 0.25)` (for an 0.25 aspect ratio). Don't reach for JS for this — viewport-width calc is enough.

When you write a fluid scale rule, eyeball a quick check: at the smallest mobile width, scale should be > 0.2; at the breakpoint edge (768), scale should be ≤ 1. If your scale stays at 1 across all widths, the rule isn't applying — check for the length-vs-number bug first.

## 31. Specificity boost for inner-class overrides inside `:not()` chains

The lock-frame children rule uses 4 stacked `:not()` selectors to exclude overlay components (`.fp-lock-magnify`, `.fp-magnify`, `.fp-hands-popover`, `.fp-krisp-popover`). Each `:not(.x)` adds the same specificity as a class, so the rule's specificity is 0,4,0 + the chain.

When a more specific override is needed for ONE inner class (e.g. `.theater-win` needs taller height than the meeting-win default), the override has to match or beat 0,4,0 — otherwise it loses by specificity even though it's later in source order.

```css
/* WRONG — specificity 0,4,0 + 1 (the > combinator). Loses to the
   :not chain rule. */
.fp-section-visual .fp-roamoji-preview .fp-lock-frame > .theater-win {
  height: 610px !important;
}

/* RIGHT — chain the same `:not()` exclusions on the override so
   specificity matches; later source order then wins. */
.fp-section-visual .fp-roamoji-preview .fp-lock-frame > .theater-win:not(.fp-lock-magnify):not(.fp-magnify):not(.fp-hands-popover):not(.fp-krisp-popover) {
  height: 610px !important;
}
```

Burned ~30 minutes debugging height rules that "weren't applying." If a rule with `!important` and a sane selector seems to no-op, count the `:not()` selectors in the rule it's competing with — it's almost always specificity, not source order or media-query mismatch.

## 32. Stacked-card min-heights are mobile dead-space

Multiple components on the site use `min-height` on their cards to keep a uniform grid on desktop:
- `.sc-review-card { min-height: 280px }` (homepage social reviews)
- `.fp-section-columns-cards .fp-col { min-height: 280px }` (Theater "Town Halls", "Open Mic", etc.)
- `.fp-card` and `.fp-cards-row-card` (might pick up similar rules over time)

On mobile these cards stack vertically and the min-height becomes dead space below short copy. **Default to dropping `min-height` on mobile** — let cards hug their own content. If consistency is desired (e.g. reviews where you want all four to read evenly), reduce to a smaller floor (200px) instead of zeroing it. The user has flagged this on multiple components — check for it whenever a card-style component is on a feature page.

## 33. Inline author·role attribution on mobile quotes

Mobile quote renders as a single inline line "Name · Role" beneath the blockquote, not as two stacked uppercase blocks. Implementation:

```jsx
{/* JSX wraps author + sep + role in an attribution div */}
<blockquote className="fp-quote-text">{quote}</blockquote>
<div className="fp-quote-attribution">
  <span className="fp-quote-author">{author}</span>
  {role && (
    <>
      <span className="fp-quote-sep" aria-hidden="true">·</span>
      <span className="fp-quote-role">{role}</span>
    </>
  )}
</div>
```

```css
/* Desktop hides the separator; mobile shows it. */
.fp-quote-sep { display: none; }
@media (max-width: 768px) {
  /* Switch the inner from grid to block so children flow inline. */
  .fp-quote-inner { display: block !important; }
  .fp-quote-attribution { /* inline content flows inside this block */ }
  .fp-quote-author { color: var(--text-secondary) !important; } /* soften */
  .fp-quote-sep { display: inline !important; }
  /* Drop the desktop hairline divider above the attribution block */
  .fp-quote-inner { border-top: 0 !important; }
}
```

Quote text on top, attribution as a single secondary-colored line below — reads cleaner on mobile than the two-column grid layout the desktop uses.

## 35. AInbox feature page mobile

The AInbox feature page (`#/feature/ainbox`) follows the standard meeting-style window mobile recipe (scale 0.75, visual hugs at 499px = 32 + 435 + 32, left-pinned with 32px padding-left), but a few page-specific details matter:

**Scope all AInbox-specific rules to `.fp-page[data-slug="ainbox"]`.** The naive selector `.fp-section-visual > .mc-window` matches BOTH the MiniChatPreview's `.mc-window` (Direct Messages / Confidential Messages on this page) AND the portaled animated DM popup that appears on `.fp-map-preview` sections of other feature pages (Virtual Office, Drop-In, etc.). The portaled popup needs to stay pinned at `top:16; left:16; transform: scale(0.75)`; the MiniChatPreview needs to be centered at intrinsic 320×520. Without scoping, my MiniChatPreview rule clobbered the popup positioning and the user reported "the small dm window appears and causes the map window to move."

**The transform fix needs to apply to every page that embeds AInbox previews — not just `data-slug="ainbox"`.** The Magic Minutes feature page (`data-slug="magic-minutes"`) has multiple sections that embed `<AInboxPreview>` ("Group Chat for every meeting", "Prompt the minutes", "Magic PDF", "Transcriptions & Translations", "Action Items in your AInbox"). When the transform override is scoped only to `data-slug="ainbox"`, those Magic Minutes sections render the AInbox window at full unscaled 780×580 because the reset rule wins. Add `data-slug="magic-minutes"` to the same selector chain (alongside `data-slug="ainbox"`):

```css
.fp-page[data-slug="ainbox"]       .fp-section-visual .ainbox-window:not(...):not(...):not(...):not(...):not(...),
.fp-page[data-slug="ainbox"]       .fp-hero-stage    .ainbox-window:not(...):not(...):not(...):not(...):not(...),
.fp-page[data-slug="magic-minutes"] .fp-section-visual .ainbox-window:not(...):not(...):not(...):not(...):not(...),
.fp-page[data-slug="magic-minutes"] .fp-hero-stage    .ainbox-window:not(...):not(...):not(...):not(...):not(...) {
  transform: scale(0.75) !important;
  transform-origin: top left !important;
}
```

When you add a NEW feature page that uses `<AInboxPreview>` in a section, add its slug to this list. The Folders bottom-pin override stays scoped to `data-slug="ainbox"` only since Folders is a section unique to that page.

**Per-section scaling overrides need the `:not()` chain.** The reset rule at line ~172 of `FeaturePage.css` (`transform: none !important` on direct children) has specificity 0,6,0. To make `transform: scale(0.75) !important` win on direct-child meeting-windows, override selectors must match or beat that. Five `:not()` exclusions on the inner class (matching the reset's chain) gets you to 0,8,0:

```css
.fp-page[data-slug="ainbox"] .fp-section-visual .ainbox-window:not(.fp-section-visual-wallpaper):not(.shelf-win):not(.mc-window):not(.mc-bubble):not(.fp-tags-magnify) {
  transform: scale(0.75) !important;
  transform-origin: top left !important;
}
```

This was rediscovered after the user reverted the broader "exclude meeting-style classes from the reset" approach — the per-page `:not()` chain is the alternative. (See §34 for the underlying reset-rule gotcha.)

**Folders section uses `transform-origin: bottom left` so the auto-added folders stay visible.** The `AInboxFoldersPreview` component wraps its `<AInbox>` in a `<div className="fp-ainbox-folders">` whose only purpose is a CSS hook. The wrapper is `display: contents` on desktop (no layout impact, ainbox-window inherits the desktop sizing rules normally). On mobile, the visual is bottom-aligned (`align-items: flex-end; padding-top: 0; padding-bottom: 32px`) and the inner ainbox-window's transform-origin flips to bottom-left so the bottom of the sidebar (where new folders land) is the anchor point as content grows.

**MiniChatPreview (`.mc-window`) DM/Confidential sections center their phone-style chat at intrinsic 320×520, no scaling.** 320 fits comfortably on every supported mobile viewport (≥320), so no transform is needed. The `.mc-window` desktop CSS (in `MiniChat.css`) defaults to `position: absolute` — override to `position: relative` and `margin: 0 auto` so the visual frame's flex layout centers it and auto-hugs the height.

**JSX wrapper trick for sections that need a CSS hook without changing desktop layout.** When an existing component (here `<AInbox>`) renders without a section-specific class, wrap it in `<div className="fp-ainbox-folders">` (or similar) and set the wrapper to `display: contents` on desktop. The wrapper is invisible to layout — desktop sizing rules cascade through to the inner window — but it gives mobile CSS a unique selector to target. This pattern recurs for any section that needs a per-section override but shares a component with other sections.

The hero animated wrapper (`.fp-ainbox-hero-anim`) needs `display: block` (was `display: flex` desktop) on mobile so the parent visual's flex alignment governs positioning, not the wrapper's own flex centering. Without this, the inner ainbox-window centers within the wrapper at the wrong offset.

## 36. Safari iOS kills `backdrop-filter` over a transparent ancestor chain

Safari iOS renders an element with `backdrop-filter` (or `-webkit-backdrop-filter`) **invisible — including its children's paint** — when the element's ancestor chain is fully transparent up to a `contain: paint` / `clip-path` boundary. The element's outline renders (via `outline` debug or `box-shadow`); everything inside the box drops to nothing. Even children with their own `background: lime !important` don't appear.

The original instinct is "the unprefixed `backdrop-filter: url(#filter)` is the issue, gate it behind @supports". That's necessary but **not sufficient** — even the plain `-webkit-backdrop-filter: blur(...)` alone (no url()) trips the bug if the element sits over transparency.

**Why some surfaces work and others don't (the actual diagnostic):**

- `.mw-theater-icon-btn` works in Safari iOS because `.mw-theater` is `position: absolute; inset: 0; background: var(--bg-surface-primary)` — a fully opaque ancestor right above the icon. The filter has a solid backdrop to sample.
- `.mw-tabbar-main` and `.mw-tab-eye` fail because `.mw-tabbar` is `position: absolute; bottom: 14px` over `.mw-content` (whose bg may be transparent in some tabs), and there's no opaque ancestor between the filtered element and `.mw-screen`'s `contain: paint`.

If you copy the kevinbism liquid-glass pattern onto a new surface, ask yourself: is there an opaque background between this element and the nearest `clip-path` / `contain: paint` ancestor? If no, the filter will fail in Safari iOS.

**Fix**: drop `backdrop-filter` AND `-webkit-backdrop-filter` for Safari, use a slightly more opaque solid bg as the standalone glass look (`rgba(255, 255, 255, 0.08)` on dark, `rgba(255, 255, 255, 0.18)` on light works). Gate the kevinbism refraction behind `@supports (corner-shape: superellipse(1.6))` (Chrome/Edge only):

```css
.mw-tabbar-main {
  background: rgba(255, 255, 255, 0.08); /* Safari sees this. */
  border-radius: 999px;
  box-shadow: /* inset highlights — these still work in Safari */;
}

@supports (corner-shape: superellipse(1.6)) {
  .mw-tabbar-main {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: url(#mw-liquid-glass) blur(2px) saturate(160%) brightness(1.05);
    -webkit-backdrop-filter: blur(14px) saturate(160%) brightness(1.05);
  }
}
```

Same fix needed for the `data-theme="light"` variants. The visual difference: Chrome/Edge get true refraction; Safari gets a solid glass pill that reads as glass on its own thanks to the box-shadow inset highlights.

**Diagnostic recipe** when something "isn't rendering" in Safari iOS:
1. Add `outline: 2px solid magenta` to the element. If you see the outline but nothing inside, the box exists but its paint is suppressed.
2. Add `background: lime !important` directly to the element AND each ancestor. The level where lime DOES show is the element that's killing paint for everything below it.
3. Check that element for `backdrop-filter` / `-webkit-backdrop-filter`. If found, check whether its ancestor chain has an opaque background before reaching a `contain: paint` boundary.

**Don't reach for**: removing `isolation: isolate`, swapping `transform: translateX(-50%)` for `left:0; right:0`, rewriting mask-image as `<img>`/inline-SVG, or fiddling with z-index. None of those touch the actual cause and they'll waste hours.

## 21. Anchor of mobile-iteration habits

Things that have repeatedly come up while polishing this site, worth remembering:
- After every `mapAlign`, padding, or alignment tweak — verify at the 768px breakpoint AND at iPhone-width (≤430px). Bugs hide in the 600-768 band where the map is just barely wide enough that overflow rules look right but corners still peek.
- When user says "make this look like X" — find X first, copy its CSS values exactly (font sizes, line heights, paddings), don't eyeball.
- Pricing/explore/quote/cards-row/etc. variants have their own desktop CSS. Mobile rules for those variants almost always need the late-bound block.
- A `:has()` in the selector adds the same specificity as a class. Use it to bump specificity by exactly 1 level when matching (or beating) a desktop rule with a similar-shaped selector.
- When stacking elements vertically that were horizontal on desktop, set `grid-template-columns: 1fr` on the parent AND `grid-column: 1 / -1` on each child. Just one or the other often leaves the children at their desktop column spans.
- If a map-preview overlay (scrim, dialog, magnifier) needs to live "inside" the window, portal it into `.sc-window` (or `.miniRoamOS`). Don't fight it with CSS positioning.
