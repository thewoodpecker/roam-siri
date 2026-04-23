import React, { useEffect, useRef, useState, useCallback } from 'react';
import './OnItTaskPane.css';

const DEFAULT_STEPS = [
  'Resolving Sean and Thomas in the company directory',
  'Locating Sean MacIsaac and Thomas Grapperon on the map',
  'Setting a watch for them to enter the same room',
  'Notifying You',
];

const TYPE_SPEED = 15;
const TYPE_DELAY = 100;
const STEP_COMPLETE_DELAY = 100;
const NEXT_STEP_DELAY = 250;

function Typewriter({ text, animate, speed = TYPE_SPEED, delay = TYPE_DELAY, onComplete }) {
  const [display, setDisplay] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) { setDisplay(text); return; }
    setDisplay('');
    let i = 0;
    let interval;
    const t = setTimeout(() => {
      interval = setInterval(() => {
        setDisplay(text.slice(0, i));
        if (i++ >= text.length) {
          clearInterval(interval);
          onComplete && onComplete();
        }
      }, speed);
    }, delay);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [text, animate, speed, delay, onComplete]);

  return <span className="onit-tw">{display}</span>;
}

export default function OnItTaskPane({
  summary = 'Watch for Sean and Thomas meeting together',
  steps = DEFAULT_STEPS,
  agentName = 'On-It',
  agentAvatar = '/on-it-agent.png',
}) {
  const rootRef = useRef(null);
  const [runId, setRunId] = useState(0);
  const [inProgress, setInProgress] = useState(-1);
  const [completed, setCompleted] = useState(-1);
  const timersRef = useRef([]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  const replay = useCallback(() => {
    clearTimers();
    setInProgress(0);
    setCompleted(-1);
    setRunId(r => r + 1);
  }, []);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInProgress(p => (p === -1 ? 0 : p));
      }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onStepComplete = useCallback((i) => {
    const t1 = setTimeout(() => setCompleted(i), STEP_COMPLETE_DELAY);
    const t2 = setTimeout(() => setInProgress(i + 1), NEXT_STEP_DELAY);
    timersRef.current.push(t1, t2);
  }, []);

  const allDone = completed >= steps.length - 1;

  return (
    <div className="onit-pane" ref={rootRef}>
      <div className="onit-summary">
        <span className={`onit-summary-icon ${allDone ? 'onit-summary-icon-done' : ''}`} aria-hidden="true">
          {allDone ? <IconTaskCircleChecked /> : <IconTaskCircleUnchecked />}
        </span>
        <span className="onit-summary-text">{summary}</span>
      </div>

      <div className="onit-card">
        <div className="onit-card-header">
          <img src={agentAvatar} alt="" className="onit-card-avatar" />
          <span className="onit-card-name">{agentName}</span>
          {allDone && (
            <button className="onit-replay" onClick={replay} type="button">
              <span className="onit-replay-icon"><IconArrowCounterclockwise /></span>
              <span>Replay</span>
            </button>
          )}
        </div>

        <div className="onit-steps">
          {steps.map((step, i) => {
            const started = inProgress >= 0 || completed >= 0;
            const show = started && (i === 0 || i <= Math.max(inProgress, completed));
            const isInProgress = inProgress === i && !allDone;
            const isCompleted = i <= completed;
            return (
              <div
                key={`${runId}-${i}`}
                className={`onit-step ${show ? 'onit-step-show' : ''} ${isInProgress ? 'onit-step-active' : ''}`}
              >
                <span className="onit-step-status">
                  {isInProgress && (
                    <span className={`onit-step-icon onit-step-spinner ${!isCompleted ? 'onit-step-icon-show' : ''}`}>
                      <IconSpinner />
                    </span>
                  )}
                  <span className={`onit-step-icon onit-step-check ${isCompleted ? 'onit-step-icon-show' : ''}`}>
                    <IconCheckmarkCircleFillBoldSmall />
                  </span>
                </span>
                <span className="onit-step-text">
                  <Typewriter
                    text={step}
                    animate={isInProgress && i > completed}
                    onComplete={() => onStepComplete(i)}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Icon SVGs ported verbatim from developer/wonder/roam/icons

function IconTaskCircleUnchecked() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.5" />
    </svg>
  );
}

function IconTaskCircleChecked() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        fill="currentColor"
        d="m12 20c4.4183 0 8-3.5817 8-8 0-4.41828-3.5817-8-8-8-4.41828 0-8 3.58172-8 8 0 4.4183 3.58172 8 8 8zm3.624-10.58397c.2298-.34465.1367-.8103-.208-1.04007-.3446-.22976-.8103-.13663-1.04.20801l-3.4926 5.23883-1.85307-1.8531c-.29289-.2929-.76777-.2929-1.06066 0s-.29289.7677 0 1.0606l2.50003 2.5c.1589.1589.3806.2382.6042.216.2236-.0221.4255-.1433.5501-.3303z"
      />
    </svg>
  );
}

function IconCheckmarkCircleFillBoldSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fill="currentColor"
        d="m8.3999 14.5c3.5899 0 6.5-2.9101 6.5-6.5 0-3.58985-2.9101-6.5-6.5-6.5-3.58985 0-6.5 2.91015-6.5 6.5 0 3.5899 2.91015 6.5 6.5 6.5zm3.0645-8.00612-3.50002 4.00002c-.14892.1702-.36669.2641-.59267.2556-.22599-.0085-.43607-.1186-.57176-.2995l-1.5-2c-.24853-.33137-.18137-.80147.15-1.05s.80147-.18137 1.05.15l.94485 1.2598 2.8907-3.30368c.2728-.31172.7466-.34331 1.0583-.07055.3118.27276.3433.74658.0706 1.05831z"
      />
    </svg>
  );
}

function IconArrowCounterclockwise() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        fill="currentColor"
        d="m12 4.5c4.1421 0 7.5 3.35786 7.5 7.5 0 4.1421-3.3579 7.5-7.5 7.5-4.14214 0-7.5-3.3579-7.5-7.5 0-.3764.02772-.7462.08123-1.1077.06722-.4541-.26514-.8923-.72415-.8923-.37085 0-.69608.2562-.75237.6228-.06895.449-.10471.9089-.10471 1.3772 0 4.9706 4.02944 9 9 9 4.9706 0 9-4.0294 9-9 0-4.97056-4.0294-9-9-9-2.30506 0-4.40773.86656-6 2.29168v-1.04168c0-.41421-.33579-.75-.75-.75s-.75.33579-.75.75v3c0 .41421.33579.75.75.75h3c.41421 0 .75-.33579.75-.75s-.33579-.75-.75-.75h-1.34907c1.33814-1.24117 3.12997-2 5.09907-2z"
      />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="onit-spin">
      <g clipRule="evenodd" fill="currentColor" fillRule="evenodd">
        <path
          fillOpacity=".1"
          d="m15.5677 4.28504c-4.2609-1.97046-9.31237-.11372-11.28282 4.14714-1.97046 4.26082-.11372 9.31232 4.14713 11.28282 4.26089 1.9704 9.31229.1137 11.28279-4.1472 1.9705-4.2608.1137-9.31231-4.1471-11.28276zm-12.64429 3.51752c2.31818-5.01277 8.26109-7.197167 13.27389-4.87899 5.0127 2.31818 7.1971 8.26113 4.879 13.27383-2.3182 5.0128-8.2611 7.1972-13.2739 4.879-5.01277-2.3182-7.19717-8.2611-4.87899-13.27384z"
        />
        <path d="m15.2018 3.2895c.1739-.37596.6196-.53979.9955-.36593 5.0128 2.31818 7.1972 8.26113 4.879 13.27383-.1738.376-.6196.5398-.9955.366-.376-.1739-.5398-.6196-.3659-.9956 1.9704-4.2608.1137-9.31231-4.1472-11.28276-.3759-.17387-.5398-.61959-.3659-.99554z" />
      </g>
    </svg>
  );
}
