import React, { useEffect, useState } from 'react';

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

/** Soft-blur block reveal on load, staggered by index (portfolio LoadReveal). */
export default function LoadReveal({
  children,
  index = 0,
  baseDelay = 0.6,
  stagger = 0.07,
  blur = 6,
  y = 16,
  duration = 0.9,
  play = true,
  /** When false, render a plain wrapper with no enter animation (passthrough). */
  active = true,
  className,
  as: Tag = 'div',
  style: styleProp,
  ...rest
}) {
  const reduce = usePrefersReducedMotion();

  if (!active) {
    return children;
  }

  const style = play
    ? {
        '--sc-blur': reduce ? '0px' : `${blur}px`,
        '--sc-y': reduce ? '0px' : `${y}px`,
        animationDuration: `${duration}s`,
        animationTimingFunction: EASE,
        animationDelay: `${baseDelay + index * stagger}s`,
        animationName: reduce ? 'sc-soft-fade' : 'sc-soft-blur-in',
        ...styleProp,
      }
    : { opacity: 0, animation: 'none', ...styleProp };

  return (
    <Tag className={`sc-load-reveal${className ? ` ${className}` : ''}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}
