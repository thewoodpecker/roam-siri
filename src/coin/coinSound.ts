export const COIN_SOUNDS = [
  { id: "none", label: "Silent" },
  { id: "win", label: "It’s a W!N!" },
  { id: "coin-1", label: "Shimmer" },
  { id: "coin-2", label: "Clink" },
  { id: "coin-3", label: "Sizzle" },
  { id: "coin-4", label: "Bonk" },
  { id: "coin-5", label: "Sprinkle" },
  { id: "coin-6", label: "Ting" },
  { id: "coin-7", label: "Swish" },
  { id: "coin-8", label: "Chime" },
] as const;

export type CoinSoundId = (typeof COIN_SOUNDS)[number]["id"];

type AudibleSoundId = Exclude<CoinSoundId, "none">;

const SOUND_URLS: Record<AudibleSoundId, string> = {
  win: "/win/coinery/its-a-win.mp3",
  "coin-1": "/win/coinery/roam-coin-1.mp3",
  "coin-2": "/win/coinery/roam-coin-2.mp3",
  "coin-3": "/win/coinery/roam-coin-3.mp3",
  "coin-4": "/win/coinery/roam-coin-4.mp3",
  "coin-5": "/win/coinery/roam-coin-5.mp3",
  "coin-6": "/win/coinery/roam-coin-6.mp3",
  "coin-7": "/win/coinery/roam-coin-7.mp3",
  "coin-8": "/win/coinery/roam-coin-8.mp3",
};

const SPIN_URL = "/win/coinery/star-spin.mp3";

interface Clip {
  buffer: AudioBuffer;
  offset: number;
}

const PREROLL_SECONDS = 0.02;

const audibleOffset = (buffer: AudioBuffer) => {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index)
  );
  let peak = 0;
  for (const data of channels) {
    for (const sample of data) {
      const level = Math.abs(sample);
      if (level > peak) peak = level;
    }
  }
  if (peak === 0) return 0;
  const threshold = Math.max(0.008, peak * 0.03);
  const first = channels[0];
  if (!first) return 0;
  const index = first.findIndex((_, i) =>
    channels.some((data) => Math.abs(data[i] ?? 0) >= threshold)
  );
  const start = index < 0 ? 0 : index;
  const preroll = Math.floor(buffer.sampleRate * PREROLL_SECONDS);
  return Math.max(0, start - preroll) / buffer.sampleRate;
};

let context: AudioContext | undefined;
let loading: Promise<void> | undefined;
let playToken = 0;
let spinToken = 0;
let current: AudioBufferSourceNode | undefined;
let spinSource: AudioBufferSourceNode | undefined;
let spinClip: Clip | undefined;
const clips = new Map<AudibleSoundId, Clip>();

const audioContext = () => {
  context ??= new AudioContext({ latencyHint: "interactive" });
  return context;
};

const loadClips = (ctx: AudioContext) => {
  loading ??= (async () => {
    try {
      const ids = Object.keys(SOUND_URLS) as AudibleSoundId[];
      await Promise.all([
        ...ids.map(async (id) => {
          const response = await fetch(SOUND_URLS[id]);
          if (!response.ok) throw new Error(`Failed to load coin sound ${id}`);
          const bytes = await response.arrayBuffer();
          const buffer = await ctx.decodeAudioData(bytes.slice(0));
          clips.set(id, { buffer, offset: audibleOffset(buffer) });
        }),
        (async () => {
          const response = await fetch(SPIN_URL);
          if (!response.ok) throw new Error("Failed to load coin spin sound");
          const bytes = await response.arrayBuffer();
          const buffer = await ctx.decodeAudioData(bytes.slice(0));
          spinClip = { buffer, offset: audibleOffset(buffer) };
        })(),
      ]);
    } catch (err) {
      loading = undefined;
      throw err;
    }
  })();
  return loading;
};

export const preloadCoinSounds = (): Promise<void> => {
  if (typeof AudioContext === "undefined") return Promise.resolve();
  const ctx = audioContext();
  return loadClips(ctx).catch(() => {
    // A later play retries.
  });
};

const stopSource = () => {
  const source = current;
  current = undefined;
  if (!source) return;
  try {
    source.stop();
  } catch {
    // The source may already have ended.
  }
  source.disconnect();
};

const startClip = (ctx: AudioContext, clip: Clip, delay: number) => {
  const source = ctx.createBufferSource();
  source.buffer = clip.buffer;
  source.connect(ctx.destination);
  const when = delay > 0 ? ctx.currentTime + delay : 0;
  source.start(when, clip.offset);
  current = source;
};

const resume = async (ctx: AudioContext) => {
  try {
    await ctx.resume();
  } catch {
    // Playback can fail if the audio device is unavailable.
  }
};

const stopSpinSource = () => {
  const source = spinSource;
  spinSource = undefined;
  if (!source) return;
  try {
    source.stop();
  } catch {
    // The source may already have ended.
  }
  source.disconnect();
};

export const playSpinSound = (): Promise<void> => {
  const token = ++spinToken;
  stopSpinSource();
  if (typeof AudioContext === "undefined") return Promise.resolve();
  const ctx = audioContext();
  const begin = (clip: Clip) => {
    if (token !== spinToken) return;
    const source = ctx.createBufferSource();
    source.buffer = clip.buffer;
    source.connect(ctx.destination);
    source.start(0, clip.offset);
    spinSource = source;
  };
  if (spinClip) {
    begin(spinClip);
    return resume(ctx);
  }
  return loadClips(ctx).then(async () => {
    if (!spinClip) return;
    begin(spinClip);
    await resume(ctx);
  });
};

export const playCoinSound = (id: CoinSoundId, delay = 0): Promise<void> => {
  const token = ++playToken;
  stopSource();
  if (id === "none" || typeof AudioContext === "undefined") return Promise.resolve();
  const ctx = audioContext();
  const clip = clips.get(id);
  if (clip) {
    startClip(ctx, clip, delay);
    return resume(ctx);
  }
  return loadClips(ctx).then(async () => {
    if (token !== playToken) return;
    const ready = clips.get(id);
    if (!ready) return;
    startClip(ctx, ready, delay);
    await resume(ctx);
  });
};
