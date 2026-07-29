import React, { Fragment, useEffect, useState } from 'react';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

/** Soft-blur-in: per-character fade + upward motion + blur (portfolio SoftBlurText). */
export default function SoftBlurText({
  text,
  className,
  delay = 0.1,
  stagger = 0.025,
  blur = 12,
  y = 16,
  duration = 0.9,
  play = true,
  as: Tag = 'span',
}) {
  const reduce = usePrefersReducedMotion();
  const words = text.split(' ');
  let charIndex = -1;

  return (
    <Tag aria-label={text} className={className}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="sc-soft-blur-word">
            {Array.from(word).map((ch) => {
              charIndex += 1;
              const i = charIndex;
              const style = play
                ? {
                    '--sc-blur': reduce ? '0px' : `${blur}px`,
                    '--sc-y': reduce ? '0px' : `${y}px`,
                    animationDuration: `${duration}s`,
                    animationTimingFunction: EASE,
                    animationDelay: `${delay + i * stagger}s`,
                    animationName: reduce ? 'sc-soft-fade' : 'sc-soft-blur-in',
                  }
                : { opacity: 0, animation: 'none' };
              return (
                <span key={i} aria-hidden className="sc-soft-blur-char" style={style}>
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
