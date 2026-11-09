import { forwardRef, useEffect, useRef, useState } from 'react';

/** Short stand-in for the multi‑megabyte talking-head masters. */
export function previewVideoSrc(src) {
  if (typeof src !== 'string') return src;
  const path = src.split('#')[0];
  const match = path.match(/^\/videos\/(.+\.mp4)$/i);
  if (!match) return path;
  return `/videos/preview/${match[1]}`;
}

/**
 * Decorative loop that stays off the network until it is near the viewport,
 * then plays a short preview instead of the full master. Pauses as soon as
 * it leaves the screen so the decoder isn't chewing on hidden tiles.
 */
const ViewportVideo = forwardRef(function ViewportVideo({
  src,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload,
  quality = 'preview',
  onError,
  ...rest
}, forwardedRef) {
  const innerRef = useRef(null);
  const [near, setNear] = useState(false);
  const [useMaster, setUseMaster] = useState(false);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      setNear(entry.isIntersecting);
    }, { rootMargin: '180px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (!near || document.hidden) {
      el.pause();
      return;
    }
    const play = el.play();
    if (play && typeof play.catch === 'function') play.catch(() => {});
  }, [near, src, useMaster]);

  useEffect(() => {
    const onVis = () => {
      const el = innerRef.current;
      if (!el) return;
      if (document.hidden || !near) el.pause();
      else {
        const play = el.play();
        if (play && typeof play.catch === 'function') play.catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [near]);

  const master = typeof src === 'string' ? src.split('#')[0] : src;
  const resolved = !near
    ? undefined
    : (quality === 'full' || useMaster ? master : previewVideoSrc(src));

  return (
    <video
      ref={setRefs}
      {...rest}
      src={resolved}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={near ? (preload || 'metadata') : 'none'}
      autoPlay={Boolean(near && autoPlay && typeof document !== 'undefined' && !document.hidden)}
      onError={(event) => {
        if (!useMaster && quality !== 'full' && resolved && resolved !== master) {
          setUseMaster(true);
          return;
        }
        onError?.(event);
      }}
    />
  );
});

export default ViewportVideo;
