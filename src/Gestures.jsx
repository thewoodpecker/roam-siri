import React, { useEffect, useRef, useState } from 'react';

/* ─── Asset paths ─────────────────────────────────────────────────────── */

const GESTURE_IMAGES = {
  bow: '/gestures/bow-2001.png',
  fistBump: '/gestures/fistBump-964.png',
  handshake: '/gestures/handShake-3466+3472.png',
  highFive: '/gestures/highFive-167.png',
};

const ROAMANIAC_IMAGES = {
  1: '/gestures/can1.png',
  2: '/gestures/can2.png',
  3: '/gestures/can3.png',
  4: '/gestures/can4.png',
};

const ROAMANIAC_BURST_IMAGES = {
  1: '/gestures/bolt1.png',
  2: '/gestures/bolt2.png',
  3: '/gestures/bolt3.png',
  4: '/gestures/bolt4.png',
};

const ROAMANIAC_WAITING_VIDEOS = {
  1: '/gestures/roamaniac1-waiting-20241118',
  2: '/gestures/roamaniac2-waiting-20241118',
  3: '/gestures/roamaniac3-waiting-20241118',
  4: '/gestures/roamaniac4-waiting-20241118',
};

const ORDERED_GESTURES = ['fistBump', 'highFive', 'handshake', 'bow'];
const ROAMANIAC_VARIATIONS = [1, 2, 3, 4];

const GESTURE_MAX_VARIATIONS = {
  bow: 20,
  fistBump: 16,
  handshake: 5,
  highFive: 21,
  roamaniac: 4,
};

const AUDIO_BASE = '/gestures/audio';

function getGestureWaitingSound(gesture, variation) {
  switch (gesture) {
    case 'bow': return `${AUDIO_BASE}/bow${variation}.mp3`;
    case 'fistBump': return `${AUDIO_BASE}/fistBump-waiting.mp3`;
    case 'handshake': return `${AUDIO_BASE}/handShake-waiting.mp3`;
    case 'highFive': return `${AUDIO_BASE}/highFive-waiting.mp3`;
    default: return undefined;
  }
}

function getGestureReciprocatedSound(gesture, variation) {
  switch (gesture) {
    case 'bow': return `${AUDIO_BASE}/bow${variation}.mp3`;
    case 'fistBump': return `${AUDIO_BASE}/fistBump${variation}.mp3`;
    case 'highFive': return `${AUDIO_BASE}/highFive${variation}.mp3`;
    // handshake/roamaniac have audio embedded in their reciprocated videos.
    default: return undefined;
  }
}

const VIDEO_BASE = '/gestures';

function getGestureWaitingVideo(gesture, variation) {
  switch (gesture) {
    case 'handshake': return `${VIDEO_BASE}/handshake-waiting`;
    case 'roamaniac': return `${VIDEO_BASE}/roamaniac${variation}-waiting-20241118`;
    default: return undefined;
  }
}

function getGestureReciprocatedVideo(gesture, variation) {
  switch (gesture) {
    case 'handshake': return `${VIDEO_BASE}/handshake${variation}-20241118`;
    case 'roamaniac': return `${VIDEO_BASE}/roamaniac${variation}-20241118`;
    default: return undefined;
  }
}

function pickGestureVariation(gesture) {
  const max = GESTURE_MAX_VARIATIONS[gesture];
  return Math.floor(Math.random() * max) + 1;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function getGestureImage(gesture, variation) {
  if (gesture === 'roamaniac') return ROAMANIAC_IMAGES[variation];
  return GESTURE_IMAGES[gesture];
}

function getGestureBurstImage(gesture, variation) {
  if (gesture === 'roamaniac') return ROAMANIAC_BURST_IMAGES[variation];
  return GESTURE_IMAGES[gesture];
}

function getGestureBurstFadeInOutDuration(gesture) {
  switch (gesture) {
    case 'fistBump': return { fadeInDuration: 200, fadeOutDuration: 250 };
    case 'highFive': return { fadeInDuration: 200, fadeOutDuration: 0 };
    case 'roamaniac': return { fadeInDuration: 200, fadeOutDuration: 250 };
    default: return { fadeInDuration: 0, fadeOutDuration: 0 };
  }
}

function getGestureReciprocatedDuration(gesture, variation) {
  switch (gesture) {
    case 'bow': return 2000;
    case 'fistBump': return 3000;
    case 'handshake': return 4000;
    case 'highFive': return variation === 21 ? 4000 : 2000;
    case 'roamaniac': return 6000;
    default: return 2000;
  }
}

const GESTURE_WAITING_DURATION = 10000;

function getGestureSentMessage(gesture, variation, name) {
  switch (gesture) {
    case 'bow': return `Waiting for ${name} to respond`;
    case 'fistBump': return `Waiting for ${name} to pound it!`;
    case 'handshake': return `Waiting for ${name} to shake your hand`;
    case 'highFive': return `Waiting for ${name} to high five`;
    case 'roamaniac': {
      switch (variation) {
        case 1: return `Waiting for ${name} to chug it`;
        case 2: return `Waiting for ${name} to drink up`;
        case 3: return `Waiting for ${name} to crush it`;
        case 4: return `Waiting for ${name} to power up to Founder Mode`;
        default: return `Waiting for ${name}`;
      }
    }
    default: return `Waiting for ${name}`;
  }
}

function getGestureReciprocatedEffectDelay(gesture) {
  return gesture === 'fistBump' ? 956 : 0;
}

function showsBurstAnimation(gesture, variation) {
  if (gesture === 'fistBump') return true;
  if (gesture === 'highFive') return variation !== 21;
  if (gesture === 'roamaniac') return true;
  return false;
}

const random = (min, max) => Math.random() * (max - min) + min;

/* ─── BurstEffect — canvas of scattering sprites ──────────────────────── */

export function BurstEffect({ gesture, variation }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 360;
    const spriteSizePx = 64;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const calculateTtl = ({ angle, distance, speed }) => {
      const dx = Math.cos(angle) / speed;
      const dy = Math.sin(angle) / speed;
      const startX = centerX + dx * distance;
      const startY = centerY + dy * distance;
      const distances = [
        (startY + spriteSizePx / 2) / -dy,
        (startX + spriteSizePx / 2) / -dx,
        (canvas.height - startY - spriteSizePx / 2) / dy,
        (canvas.width - startX - spriteSizePx / 2) / dx,
      ];
      const minDistance = Math.min(...distances.filter(d => d > 0));
      return minDistance / speed;
    };

    const sprites = Array.from({ length: 25 }).map(() => {
      const angle = random(0, 2) * Math.PI;
      const distance = random(5, 30);
      const size = random(2, 5);
      const speed = random(5, 15);
      const ttl = calculateTtl({ angle, distance, speed });
      return { angle, distance, speed, size, ttl, startTime: -1 };
    });

    const img = new Image();
    img.src = getGestureBurstImage(gesture, variation);

    const delay = getGestureReciprocatedEffectDelay(gesture);
    const duration = getGestureReciprocatedDuration(gesture, variation);
    const { fadeInDuration, fadeOutDuration } = getGestureBurstFadeInOutDuration(gesture);

    let startTime;
    let frameId;
    let timeoutId;
    let lastTime = performance.now();

    const update = () => {
      if (startTime === undefined) startTime = performance.now();
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 30;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = currentTime - startTime;
      let alpha;
      if (elapsed < fadeInDuration) {
        alpha = elapsed / fadeInDuration;
      } else {
        const endTime = startTime + duration - delay;
        const startFadeOut = endTime - fadeOutDuration;
        if (currentTime > endTime) alpha = 0;
        else if (currentTime > startFadeOut) alpha = 1 - (currentTime - startFadeOut) / fadeOutDuration;
        else alpha = 1;
      }
      ctx.globalAlpha = alpha;

      sprites.forEach(sprite => {
        if (sprite.startTime < 0) sprite.startTime = currentTime;
        sprite.distance += sprite.speed * deltaTime;
        const x = centerX + Math.cos(sprite.angle) * sprite.distance;
        const y = centerY + Math.sin(sprite.angle) * sprite.distance;
        const scale = Math.max(0.1, Math.min(1, 0.1 + ((currentTime - sprite.startTime) / sprite.ttl) * 0.9));
        const spriteSize = Math.round(spriteSizePx * scale);
        if (img.complete) {
          ctx.drawImage(img, x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize);
        }
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
          sprite.distance = random(5, 30);
          sprite.angle = random(0, 2) * Math.PI;
          sprite.startTime = -1;
          sprite.ttl = calculateTtl(sprite);
        }
      });

      timeoutId = setTimeout(() => {
        frameId = requestAnimationFrame(update);
      }, 30);
    };

    const startTimeout = setTimeout(update, delay);
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
    };
  }, [gesture, variation]);

  return <canvas ref={canvasRef} className="gesture-burst-canvas" />;
}

/* ─── RoamaniacButton — still can image, plays waiting video on hover ── */

function RoamaniacButton({ variation, onClick }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = hovered;
    if (hovered) {
      setPlaying(true);
      v.play().catch(() => {});
    }
  }, [hovered]);

  const src = ROAMANIAC_WAITING_VIDEOS[variation];

  return (
    <button
      className="gesture-btn gesture-btn-roamaniac"
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={variation === 4 ? 'Founder Mode' : `Roamaniac ${variation}`}
    >
      <img className="gesture-can-still" src={ROAMANIAC_IMAGES[variation]} alt="" hidden={playing} />
      <video
        ref={videoRef}
        className="gesture-can-video"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        onEnded={() => {
          const v = videoRef.current;
          if (v) v.currentTime = 0;
          setPlaying(false);
        }}
        style={{ visibility: playing ? 'visible' : 'hidden' }}
      >
        <source src={`${src}.mp4`} type='video/mp4;codecs=hvc1' />
        <source src={`${src}.webm`} type="video/webm" />
      </video>
    </button>
  );
}

/* ─── GestureBar — appears on tile hover ──────────────────────────────── */

export function GestureBar({ show, isRoamaniac, onSendGesture }) {
  const [pointerOn, setPointerOn] = useState(false);

  useEffect(() => {
    if (!show) {
      setPointerOn(false);
      return;
    }
    const t = setTimeout(() => setPointerOn(true), 550);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <div className={`gesture-bar-container ${show ? 'gesture-bar-show' : ''}`}>
      <div className="gesture-bar-stack">
        {isRoamaniac && (
          <div className={`gesture-roamaniac-row ${pointerOn ? 'gesture-pointer-on' : ''}`}>
            <div className="gesture-roamaniac-shelf">
              <div className="gesture-roamaniac-shelf-bg" />
              <div className="gesture-roamaniac-badge">
                <img src="/gestures/roamaniac-badge.png" alt="" />
              </div>
            </div>
            {ROAMANIAC_VARIATIONS.map(v => (
              <RoamaniacButton
                key={v}
                variation={v}
                onClick={() => onSendGesture('roamaniac', v)}
              />
            ))}
          </div>
        )}
        <div className={`gesture-row ${pointerOn ? 'gesture-pointer-on' : ''}`}>
          {ORDERED_GESTURES.map(g => (
            <button
              key={g}
              className="gesture-btn gesture-btn-ghost"
              type="button"
              onClick={(e) => { e.stopPropagation(); onSendGesture(g, undefined); }}
              aria-label={g}
            >
              <img src={getGestureImage(g)} alt="" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ProgressSpinner — SVG ring tracking 0-100% ───────────────────── */

function ProgressSpinner({ percent, radius = 40 }) {
  const stroke = 3;
  const r = radius - stroke;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  return (
    <svg className="gesture-spinner" width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
      <circle
        cx={radius}
        cy={radius}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={stroke}
      />
      <circle
        cx={radius}
        cy={radius}
        r={r}
        fill="none"
        stroke="#fff"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${radius} ${radius})`}
      />
    </svg>
  );
}

/* ─── TileGestures — wraps a tile with hover bar + waiting + burst ──── */

const audioRefHolder = { current: null };

function stopAudio() {
  const a = audioRefHolder.current;
  if (a) { a.pause(); a.currentTime = 0; }
  audioRefHolder.current = null;
}

function playSound(src) {
  stopAudio();
  if (!src) return;
  const a = new Audio(src);
  a.volume = 0.6;
  audioRefHolder.current = a;
  a.play().catch(() => {});
}

function getReceivedMessage(gesture, variation, name) {
  switch (gesture) {
    case 'bow': return `Bow to ${name}`;
    case 'fistBump': return `Fist bump with ${name}. Pound it!`;
    case 'handshake': return `Shake hands with ${name}`;
    case 'highFive': return `High five ${name}`;
    case 'roamaniac': {
      switch (variation) {
        case 1: return `Chug it with ${name}!`;
        case 2: return `Drink up with ${name}!`;
        case 3: return `Crush it with ${name}!`;
        case 4: return `Power up to Founder Mode with ${name}!`;
        default: return `Cheers with ${name}!`;
      }
    }
    default: return '';
  }
}

export function TileGestures({ isRoamaniac = false, occupantName = 'them', incoming, onIncomingResolved }) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | waiting | reciprocated
  const [percent, setPercent] = useState(0);
  const burstKeyRef = useRef(0);
  const hostRef = useRef(null);
  const tileElRef = useRef(null);

  // Find the parent tile element so we can set data-gesture-anim on it.
  useEffect(() => {
    if (!hostRef.current) return;
    let el = hostRef.current.parentElement;
    while (el && !el.classList.contains('meeting-win-tile')) {
      el = el.parentElement;
    }
    tileElRef.current = el;
    return () => {
      if (tileElRef.current) tileElRef.current.removeAttribute('data-gesture-anim');
    };
  }, []);

  // Toggle the tile shake animation during reciprocation.
  useEffect(() => {
    const el = tileElRef.current;
    if (!el) return;
    if (phase === 'reciprocated' && active && hasTileAnimation(active.gesture)) {
      el.setAttribute('data-gesture-anim', active.gesture);
    } else {
      el.removeAttribute('data-gesture-anim');
    }
  }, [phase, active]);

  // Hide the native cursor on this tile while we're awaiting an incoming reciprocation.
  useEffect(() => {
    const el = tileElRef.current;
    if (!el) return;
    if (phase === 'waiting' && active?.direction === 'received') {
      el.classList.add('gesture-cursor-active');
    } else {
      el.classList.remove('gesture-cursor-active');
    }
  }, [phase, active]);

  // Hide the tile name pill while a gesture overlay is showing on top of it.
  useEffect(() => {
    const el = tileElRef.current;
    if (!el) return;
    if (active && (phase === 'waiting' || phase === 'reciprocated')) {
      el.classList.add('tile-gesture-active');
    } else {
      el.classList.remove('tile-gesture-active');
    }
  }, [phase, active]);

  // Surface an incoming gesture from the controller.
  useEffect(() => {
    if (!incoming) return;
    burstKeyRef.current += 1;
    setActive({
      gesture: incoming.gesture,
      variation: incoming.variation,
      key: burstKeyRef.current,
      direction: 'received',
    });
    setHovered(false);
    setPhase('waiting');
    setPercent(0);
  }, [incoming]);

  const handleSend = (gesture, variation) => {
    burstKeyRef.current += 1;
    const key = burstKeyRef.current;
    const v = variation ?? pickGestureVariation(gesture);
    // Simulate the recipient clicking at a random time within the waiting
    // window — usually well before the progress indicator finishes.
    const reciprocateAt = 1200 + Math.random() * (GESTURE_WAITING_DURATION * 0.6);
    setActive({ gesture, variation: v, key, direction: 'sent', reciprocateAt });
    setHovered(false);
    setPhase('waiting');
    setPercent(0);
  };

  const reciprocate = () => {
    if (!active || phase !== 'waiting') return;
    setPhase('reciprocated');
    playSound(getGestureReciprocatedSound(active.gesture, active.variation));
    const ms = getGestureReciprocatedDuration(active.gesture, active.variation);
    const key = active.key;
    if (active.direction === 'received') onIncomingResolved?.();
    setTimeout(() => {
      setActive(prev => (prev && prev.key === key ? null : prev));
      setPhase('idle');
      setPercent(0);
    }, ms + 100);
  };

  // Wire up the receiver-clicks-cursor flow.
  useEffect(() => {
    if (phase !== 'waiting' || !active || active.direction !== 'received') return;
    const handler = (e) => { e.stopPropagation(); reciprocate(); };
    window.addEventListener('mousedown', handler, true);
    return () => window.removeEventListener('mousedown', handler, true);
  }, [phase, active]);

  // Auto-reciprocation for the sent flow (the simulated other person).
  useEffect(() => {
    if (phase !== 'waiting' || !active || active.direction !== 'sent') return;
    const start = performance.now();
    let frame;
    let done = false;
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(100, (elapsed / GESTURE_WAITING_DURATION) * 100);
      setPercent(p);
      if (!done && elapsed >= active.reciprocateAt) {
        done = true;
        reciprocate();
        return;
      }
      if (p < 100) frame = requestAnimationFrame(tick);
      else {
        setActive(null);
        setPhase('idle');
        setPercent(0);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, active]);

  // Progress for incoming (you decide to click — but still show the ring).
  useEffect(() => {
    if (phase !== 'waiting' || !active || active.direction !== 'received') return;
    const start = performance.now();
    let frame;
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(100, (elapsed / GESTURE_WAITING_DURATION) * 100);
      setPercent(p);
      if (p < 100) frame = requestAnimationFrame(tick);
      else {
        setActive(null);
        setPhase('idle');
        setPercent(0);
        onIncomingResolved?.();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, active]);

  return (
    <div
      ref={hostRef}
      className="gesture-host"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GestureBar show={hovered && !active} isRoamaniac={isRoamaniac} onSendGesture={handleSend} />
      {active && phase === 'waiting' && (
        <div className="gesture-waiting-overlay" aria-hidden="true">
          <div className="gesture-waiting-stack">
            <div className="gesture-waiting-circle">
              <div className="gesture-waiting-spinner-wrap">
                <ProgressSpinner percent={percent} radius={40} />
              </div>
              {getGestureWaitingVideo(active.gesture, active.variation) ? (
                <video
                  key={`waiting-${active.key}`}
                  className="gesture-waiting-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  disableRemotePlayback
                >
                  <source src={`${getGestureWaitingVideo(active.gesture, active.variation)}.mp4`} type="video/mp4;codecs=hvc1" />
                  <source src={`${getGestureWaitingVideo(active.gesture, active.variation)}.webm`} type="video/webm" />
                </video>
              ) : (
                <img className="gesture-waiting-image" src={getGestureImage(active.gesture, active.variation)} alt="" />
              )}
            </div>
            <div className="gesture-waiting-message">
              {active.direction === 'received'
                ? getReceivedMessage(active.gesture, active.variation, occupantName)
                : getGestureSentMessage(active.gesture, active.variation, occupantName)}
            </div>
          </div>
        </div>
      )}
      {active && phase === 'waiting' && active.direction === 'received' && (
        <TileGestureCursor gesture={active.gesture} variation={active.variation} hostRef={hostRef} />
      )}
      {active && phase === 'reciprocated' && getGestureReciprocatedVideo(active.gesture, active.variation) && (
        <div className="gesture-reciprocated-overlay" aria-hidden="true">
          <video
            key={`reciprocated-${active.key}`}
            className="gesture-reciprocated-video"
            autoPlay
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
          >
            <source src={`${getGestureReciprocatedVideo(active.gesture, active.variation)}.mp4`} type="video/mp4;codecs=hvc1" />
            <source src={`${getGestureReciprocatedVideo(active.gesture, active.variation)}.webm`} type="video/webm" />
          </video>
        </div>
      )}
      {active && phase === 'reciprocated' && showsBurstAnimation(active.gesture, active.variation) && (
        <BurstEffect key={active.key} gesture={active.gesture} variation={active.variation} />
      )}
    </div>
  );
}

function hasTileAnimation(gesture) {
  return gesture === 'fistBump' || gesture === 'roamaniac' || gesture === 'bow';
}

/* ─── TileGestureCursor — pointer-following gesture image inside a tile ─ */

function TileGestureCursor({ gesture, variation, hostRef }) {
  const [pos, setPos] = useState({ x: -1000, y: -1000, visible: false });
  useEffect(() => {
    const onMove = (e) => {
      const el = hostRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      setPos({ x, y, visible: inside });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [hostRef]);
  return (
    <img
      className="gesture-cursor-image"
      src={getGestureImage(gesture, variation)}
      style={{ left: pos.x, top: pos.y, opacity: pos.visible ? 1 : 0 }}
      alt=""
    />
  );
}

/* ─── GestureCursor — kept for back-compat, unused on tiles now ───── */

export function GestureCursor({ gesture, variation, containerRef }) {
  const [pos, setPos] = useState({ x: -1000, y: -1000, visible: false });
  useEffect(() => {
    const onMove = (e) => {
      const el = containerRef?.current;
      if (!el) {
        setPos({ x: e.clientX, y: e.clientY, visible: true });
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      setPos({ x, y, visible: inside });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [containerRef]);
  return (
    <img
      className="gesture-cursor-image"
      src={getGestureImage(gesture, variation)}
      style={{
        left: pos.x,
        top: pos.y,
        opacity: pos.visible ? 1 : 0,
      }}
      alt=""
    />
  );
}
