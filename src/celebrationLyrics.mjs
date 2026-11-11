/**
 * Sing-along pose engine, ported from
 * wonder/roam/client/rewards/helpers/lyrics.ts
 * (happy-birthday-roam-1min). Times are milliseconds from the start of the song.
 */

/** A line comes up this long before its first word… */
const LEAD_MS = 1500;
/** …and stays this long after its last one, unless the next line needs the space. */
const HOLD_MS = 1500;
/** The next line shows underneath when it follows within this; a longer gap is instrumental. */
const PREVIEW_GAP_MS = 3000;
/** Maximum travel time between ball targets. Vocal highlighting uses the original onsets. */
const MAX_HOP_MS = 700;
const MIN_CUE_INTERVAL_MS = 180;
const hopDuration = (interval) =>
  Math.min(interval, Math.max(450, Math.min(MAX_HOP_MS, interval * 0.75)));

const startOf = (line) => line.words[0]?.startMs ?? 0;
const endOf = (line) => line.words[line.words.length - 1]?.endMs ?? 0;

/**
 * When each line is on screen: from its lead-in (or the previous line's
 * leaving, if later) until its hold is up, or as soon as it is sung when the
 * next line is close behind.
 */
const windowsOf = (lines) => {
  const out = [];
  lines.forEach((line, i) => {
    const end = endOf(line);
    const next = lines[i + 1];
    const until = next
      ? Math.min(end + HOLD_MS, Math.max(end, startOf(next) - LEAD_MS))
      : end + HOLD_MS;
    out.push({ from: Math.max(startOf(line) - LEAD_MS, out[i - 1]?.until ?? -Infinity), until });
  });
  return out;
};
const windowsCache = new WeakMap();

const motionCache = new WeakMap();
const motionWords = (line, shownFrom) => {
  const cached = motionCache.get(line);
  if (cached?.shownFrom === shownFrom) return cached.words;
  const words = line.words.map((word) => ({
    ...word,
    cueTimes: [],
    cueStrengths: [],
  }));
  for (let first = 0; first < words.length - 1; first++) {
    let last = first;
    while (last + 1 < words.length) {
      const current = line.words[last];
      const next = line.words[last + 1];
      if (!current || !next) break;
      const gap = next.startMs - current.startMs;
      if (gap <= 0 || gap >= 150) break;
      last++;
    }
    if (last === first) continue;
    const firstWord = line.words[first];
    const lastWord = line.words[last];
    if (!firstWord || !lastWord) continue;
    // Do not alter simultaneous groups or borrow across them.
    if (
      line.words[first - 1]?.startMs === firstWord.startMs ||
      line.words[last + 1]?.startMs === lastWord.startMs
    ) {
      first = last;
      continue;
    }
    const start = firstWord.startMs;
    const end = lastWord.startMs;
    const left = Math.max(
      shownFrom,
      start - 150,
      first > 0 ? ((line.words[first - 1]?.startMs ?? start) + start) / 2 : start - 150
    );
    const right =
      last + 1 < words.length
        ? Math.min(end + 150, (end + (line.words[last + 1]?.startMs ?? end)) / 2)
        : Math.max(end, Math.min(end + 150, endOf(line)));
    if (right <= left) {
      first = last;
      continue;
    }
    const span = Math.min(180 * (last - first), right - left);
    const begin = clamp((start + end - span) / 2, left, right - span);
    for (let k = first; k <= last; k++) {
      const word = words[k];
      if (word) word.startMs = begin + (span * (k - first)) / (last - first);
    }
    first = last;
  }
  words.forEach((word, index) => {
    const original = line.words[index];
    const next = words[index + 1];
    // Shared landing targets cannot represent independent syllable accents.
    if (!original || words[index - 1]?.startMs === word.startMs || next?.startMs === word.startMs)
      return;
    const interval = next ? next.startMs - word.startMs : 0;
    // Reserve 220–350ms for departure so an internal accent cannot turn
    // the next hop into a rapid jump.
    const latest = next
      ? Math.min(
          word.endMs,
          next.startMs - Math.max(220, Math.min(350, hopDuration(interval) * 0.65))
        )
      : word.endMs;
    let previous = Math.max(shownFrom, word.startMs);
    for (const cue of original.bounceCues ?? []) {
      const time = original.startMs + cue.offsetMs;
      if (time - previous < MIN_CUE_INTERVAL_MS || time > latest) continue;
      word.cueTimes.push(time);
      word.cueStrengths.push(cue.strength === "soft" ? 0.85 : cue.strength === "strong" ? 1.1 : 1);
      previous = time;
    }
  });
  motionCache.set(line, { shownFrom, words });
  return words;
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const NOTHING = { line: undefined, next: undefined, reached: 0, ball: undefined };

/** The sing-along at `posMs` into the song. */
export const lyricsFrame = (lyrics, posMs) => {
  const { lines } = lyrics;
  let windows = windowsCache.get(lyrics);
  if (!windows) {
    windows = windowsOf(lines);
    windowsCache.set(lyrics, windows);
  }
  const i = windows.findIndex((w) => posMs >= w.from && posMs < w.until);
  const line = lines[i];
  const shownFrom = windows[i]?.from;
  if (!line || shownFrom === undefined) return NOTHING;

  const following = lines[i + 1];
  const next = following && startOf(following) - endOf(line) <= PREVIEW_GAP_MS ? i + 1 : undefined;
  const reached = line.words.filter((w) => w.startMs <= posMs).length;
  const words = motionWords(line, shownFrom);
  const current = words.filter((w) => w.startMs <= posMs).length - 1;

  const groupStart = (last) => {
    while (last > 0 && words[last - 1]?.startMs === words[last]?.startMs) last--;
    return last;
  };
  const groupEnd = (first) => {
    while (first + 1 < words.length && words[first + 1]?.startMs === words[first]?.startMs) first++;
    return first;
  };
  const from = groupStart(current);
  const to = current + 1;
  const toEnd = groupEnd(to);
  const target = words[to]?.startMs;
  const word = words[from];
  const interval = target === undefined ? 0 : target - (word?.startMs ?? shownFrom);
  // Never start a hop before its source word. Longer phrases get more travel
  // time instead of a long standstill followed by the same short jump.
  const normalHop = hopDuration(interval);
  const lastCue = word?.cueTimes[word.cueTimes.length - 1];
  const hop =
    target === undefined ? normalHop : Math.min(normalHop, target - (lastCue ?? -Infinity));
  const ball = { from, to: from, t: 1 };
  if (current > from) {
    ball.fromEnd = current;
    ball.toEnd = current;
  }
  const sungUntil = word ? Math.max(...words.slice(from, current + 1).map((w) => w.endMs)) : 0;
  const departure = target === undefined ? sungUntil : target - hop;
  const holdStart = word?.startMs ?? 0;
  const hold = word ? Math.min(sungUntil, departure) - holdStart : 0;
  // Brief holds stay quiet rather than adding a second little bounce.
  const floating = (time) =>
    word && lastCue === undefined && hold >= 450
      ? 0.16 * smoothStep((time - holdStart) / 180) * smoothStep((sungUntil - time) / 180)
      : 0;
  const cueIndex = word?.cueTimes.findIndex((time) => posMs <= time) ?? -1;
  const cue = word?.cueTimes[cueIndex];
  if (word && cue !== undefined) {
    const previous = word.cueTimes[cueIndex - 1] ?? Math.max(shownFrom, word.startMs);
    const duration = Math.min(word.sustain === "finale" ? 540 : 360, cue - previous);
    const progress = clamp((posMs - (cue - duration)) / duration, 0, 1);
    // One centered arc lands on the accent; no separate held bob is added.
    const height =
      word.sustain === "finale"
        ? 0.5
        : 0.25 + 0.125 * smoothStep((duration - MIN_CUE_INTERVAL_MS) / 180);
    // A ballistic arc meets the syllable firmly instead of easing into a stop.
    ball.holdRem = height * (word.cueStrengths[cueIndex] ?? 1) * 4 * progress * (1 - progress);
    // Round at rest and at the apex; elongate only through faster flight.
    ball.stretch =
      word.sustain === "finale"
        ? 0.06 * Math.sin(2 * Math.PI * progress) ** 2
        : posMs < cue - duration
          ? -0.12 *
            Math.max(
              1 - smoothStep((posMs - previous) / 70),
              smoothStep((posMs - (cue - duration) + 60) / 60)
            )
          : flightStretch(progress, duration, 0.12);
  } else if (target !== undefined && hop > 0 && posMs > target - hop) {
    const progress = clamp((posMs - (target - hop)) / hop, 0, 1);
    ball.to = to;
    ball.toEnd = toEnd > to ? toEnd : undefined;
    const rapid = (index) => {
      const a = line.words[index];
      const b = line.words[index + 1];
      return a && b && b.startMs > a.startMs && b.startMs - a.startMs < 150;
    };
    // Runs of short syllables keep moving through the interior words. Ease
    // only at the outside ends, rather than braking at every small word.
    const flowingIn = rapid(from) && rapid(from - 1);
    const flowingOut = rapid(from) && rapid(to);
    ball.t = flowingIn
      ? flowingOut
        ? progress
        : progress + progress ** 2 - progress ** 3
      : flowingOut
        ? progress ** 2 * (2 - progress)
        : smoothStep(progress);
    const anticipating = !rapid(from) && hop >= 180 && words[to]?.sustain !== "finale";
    if (anticipating) {
      const height = 0.375 + 0.5 * clamp((hop - 200) / 200, 0, 1);
      // Reach the apex at ~45% of the flight, leaving a longer descent
      // that cues the next onset. Contact stays on the original target time.
      const phase = progress + 0.2 * progress * (1 - progress);
      ball.liftRem = height * 4 * phase * (1 - phase);
      ball.minDistanceScale = 0.85;
      ball.stretch = flightStretch(progress, hop, 0.12);
      ball.leanDeg = 8 * Math.sin(Math.PI * progress) ** 2;
    } else {
      // Fast syllable runs retain their low, flowing path.
      const height = (words[to]?.sustain === "finale" ? 0.9 : 0.75) * Math.min(1, (hop / 400) ** 2);
      ball.liftRem = height * Math.sin(Math.PI * progress) ** 2;
      ball.stretch =
        words[to]?.sustain === "finale"
          ? hop >= 300
            ? 0.04 * Math.sin(2 * Math.PI * progress) ** 2
            : 0
          : flightStretch(progress, hop, 0.06);
    }
    // Carry the held pose into the arc instead of settling and taking off again.
    ball.holdRem = floating(departure) * (1 - smoothStep(progress));
  } else if (word) {
    const lift = floating(posMs);
    if (lift > 0) ball.holdRem = lift;
  }
  if (word?.sustain === "finale" && to === words.length) {
    // A smaller last rebound settles at the actual vocal release. Everything
    // is evaluated from song time, including the brief takeoff/landing shape.
    if (posMs > sungUntil - 220) {
      const progress = clamp((posMs - (sungUntil - 220)) / 220, 0, 1);
      ball.holdRem = 0.125 * 4 * progress * (1 - progress);
      ball.stretch = 0.025 * Math.sin(2 * Math.PI * progress) ** 2;
    }
  }
  // Shape recovery is independent of travel: a new hop starts compressed,
  // so close words still have contact without delaying their next landing.
  if (
    word &&
    ball.from === ball.to &&
    (cue === undefined || (word.sustain === "finale" && (ball.holdRem ?? 0) === 0))
  ) {
    let landed = word.startMs;
    for (const time of word.cueTimes) {
      if (time > posMs) break;
      landed = time;
    }
    const duration = Math.min(word.sustain === "finale" ? 90 : 70, sungUntil - landed);
    const elapsed = posMs - landed;
    if (duration > 0 && elapsed >= 0 && elapsed < duration) {
      ball.stretch =
        word.sustain === "finale"
          ? -0.06 * Math.sin((Math.PI * elapsed) / duration) ** 2
          : -0.12 * (1 - smoothStep(elapsed / duration));
    }
  }
  // Prepare within the available hold, including the lead-in to a line.
  // A short hold blends its contact recovery into the next compression.
  const preparation = Math.min(
    60,
    Math.max(0, departure - (lastCue ?? word?.startMs ?? shownFrom))
  );
  if (
    word?.sustain !== "finale" &&
    target !== undefined &&
    words[to]?.sustain !== "finale" &&
    posMs >= departure - preparation &&
    posMs <= departure
  ) {
    const compression =
      preparation > 0 ? smoothStep((posMs - departure + preparation) / preparation) : 1;
    ball.stretch = Math.min(ball.stretch ?? 0, -0.12 * compression);
  }
  if (posMs >= sungUntil && word?.sustain === "finale") ball.stretch = 0;
  return { line: i, next, reached, ball };
};

const smoothStep = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

/** Compressed endpoints, stretched fast flight, and a round apex. */
const flightStretch = (progress, duration, strength) => {
  const contact = Math.min(55 / duration, 0.2);
  const launch = 1 - smoothStep(progress / contact);
  const landing = smoothStep((progress - 1 + contact) / contact);
  return strength * Math.sin(2 * Math.PI * progress) ** 2 - 0.12 * (launch + landing);
};
