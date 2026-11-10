import React, { useEffect, useRef, useState } from 'react';
import BirthdayGlow from './BirthdayGlow';
import BirthdayCard3D, { cardSeedNotesFor } from './rgl/BirthdayCard3D';
import { GIFT_PALETTES, paletteColorsFor } from './rgl/materials';
import RGLStage from './rgl/RGLStage';
import './BirthdayCardVisual.css';

const COLOR_CYCLE_MS = 3000;
/** Opacity only: 250ms ease-in out, then 250ms ease-out back. No scale. */
const LOOK_SWAP_MS = 250;

const NOTE_SLOTS = [
  { page: 'left', col: 0, row: 0, rotate: -6 },
  { page: 'left', col: 2, row: 0, rotate: 3 },
  { page: 'left', col: 0, row: 6, rotate: -3 },
  { page: 'left', col: 2, row: 6, rotate: 3 },
  { page: 'right', col: 0, row: 0, rotate: -5 },
  { page: 'right', col: 2, row: 6, rotate: -2 },
];

function cycleNotes(lines) {
  return lines.map((line, index) => {
    const slot = NOTE_SLOTS[index];
    return {
      id: `${slot.page}-${slot.col}-${slot.row}-${line.name}`,
      spread: 0,
      page: slot.page,
      col: slot.col,
      row: slot.row,
      rotate: slot.rotate,
      name: line.name,
      text: line.text,
    };
  });
}

/** One look per palette. Neighbors differ in design, recipient, and notes. */
const CARD_LOOKS = [
  {
    paletteId: 'crimson',
    coverId: 'classic',
    name: 'Lexi',
    notes: cardSeedNotesFor('Lexi'),
  },
  {
    paletteId: 'coral',
    coverId: 'script',
    name: 'Howard',
    notes: cycleNotes([
      { name: 'Chelsea', text: 'Save me a corner piece.' },
      { name: 'Petra', text: 'Another bright lap.' },
      { name: 'Jeff', text: 'Candles are on me.' },
      { name: 'Cleo', text: 'Make a scene.' },
      { name: 'Felix', text: 'Big day, Howard.' },
      { name: 'Amira', text: 'Stay impossible.' },
    ]),
  },
  {
    paletteId: 'lime',
    coverId: 'quiet',
    name: 'Petra',
    notes: cycleNotes([
      { name: 'Howard', text: 'Quiet wins today.' },
      { name: 'Chelsea', text: 'Tea, then a wish.' },
      { name: 'Jeff', text: 'Proud of this one.' },
      { name: 'Lexi', text: 'Go easy, shine hard.' },
      { name: 'Jonah', text: 'Nice and steady.' },
      { name: 'Sable', text: 'The long way looks good.' },
    ]),
  },
  {
    paletteId: 'evergreen',
    coverId: 'burst',
    name: 'Jeff',
    notes: cycleNotes([
      { name: 'Howard', text: 'Blow it out loud.' },
      { name: 'Petra', text: 'You built this.' },
      { name: 'Chelsea', text: 'Cake first, mail later.' },
      { name: 'Cleo', text: 'Encore, Jeff.' },
      { name: 'Wes', text: 'Best year yet.' },
      { name: 'Felix', text: 'Leave the corner.' },
    ]),
  },
  {
    paletteId: 'mint',
    coverId: 'sparks',
    name: 'Chelsea',
    notes: cycleNotes([
      { name: 'Lexi', text: 'Save me a slice.' },
      { name: 'Howard', text: 'Wish huge.' },
      { name: 'Petra', text: 'Soft landing, big year.' },
      { name: 'Jeff', text: 'Cheers from the floor.' },
      { name: 'Amira', text: 'Go shine.' },
      { name: 'Rob', text: 'Get after it, Chelsea.' },
    ]),
  },
  {
    paletteId: 'teal',
    coverId: 'balloons',
    name: 'Cleo',
    notes: cycleNotes([
      { name: 'Felix', text: 'Cake me later.' },
      { name: 'Howard', text: 'Up, and another year.' },
      { name: 'Chelsea', text: 'Laugh first.' },
      { name: 'Petra', text: 'Big day.' },
      { name: 'Jonah', text: 'Nice lap.' },
      { name: 'Jeff', text: 'The room is yours.' },
    ]),
  },
  {
    paletteId: 'azure',
    coverId: 'cupcakes',
    name: 'Felix',
    notes: cycleNotes([
      { name: 'Cleo', text: 'Encore energy.' },
      { name: 'Amira', text: 'Sweet year.' },
      { name: 'Howard', text: 'I will handle the candles.' },
      { name: 'Chelsea', text: 'Frosting is a plan.' },
      { name: 'Wes', text: 'Best year.' },
      { name: 'Sable', text: 'Stay gold.' },
    ]),
  },
  {
    paletteId: 'navy',
    coverId: 'classic',
    name: 'Amira',
    notes: cycleNotes([
      { name: 'Lexi', text: 'Go shine tonight.' },
      { name: 'Petra', text: 'The quiet kind of loud.' },
      { name: 'Howard', text: 'Another trip around.' },
      { name: 'Jeff', text: 'Cheers.' },
      { name: 'Jonah', text: 'You found it.' },
      { name: 'Chelsea', text: 'Dance the candles out.' },
    ]),
  },
  {
    paletteId: 'violet',
    coverId: 'script',
    name: 'Jonah',
    notes: cycleNotes([
      { name: 'Sable', text: 'Stay curious.' },
      { name: 'Wes', text: 'Best year, honestly.' },
      { name: 'Howard', text: 'Wish big.' },
      { name: 'Petra', text: 'You caught it.' },
      { name: 'Felix', text: 'Cake tax.' },
      { name: 'Cleo', text: 'Encore.' },
    ]),
  },
  {
    paletteId: 'magenta',
    coverId: 'quiet',
    name: 'Wes',
    notes: cycleNotes([
      { name: 'Jonah', text: 'Nice and weird.' },
      { name: 'Chelsea', text: 'Out of office, into cake.' },
      { name: 'Howard', text: 'I will light them.' },
      { name: 'Petra', text: 'Proud from here.' },
      { name: 'Jeff', text: 'Cheers, Wes.' },
      { name: 'Amira', text: 'Go on.' },
    ]),
  },
  {
    paletteId: 'rose',
    coverId: 'burst',
    name: 'Sable',
    notes: cycleNotes([
      { name: 'Wes', text: 'Stay gold.' },
      { name: 'Amira', text: 'Shine quietly.' },
      { name: 'Howard', text: 'Candles, then cake.' },
      { name: 'Chelsea', text: 'A good one.' },
      { name: 'Petra', text: 'Big day.' },
      { name: 'Felix', text: 'Do not wait on the slice.' },
    ]),
  },
];

function nextPaletteId(current) {
  const index = GIFT_PALETTES.findIndex((palette) => palette.id === current);
  const next = GIFT_PALETTES[(index < 0 ? 0 : index + 1) % GIFT_PALETTES.length];
  return next.id;
}

function lookForPalette(paletteId) {
  return CARD_LOOKS.find((look) => look.paletteId === paletteId) ?? CARD_LOOKS[0];
}

function usePageTheme() {
  const [theme, setTheme] = useState(() => (
    typeof document === 'undefined'
      ? 'dark'
      : document.documentElement.getAttribute('data-theme') || 'dark'
  ));

  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return theme === 'light' ? 'light' : 'dark';
}

function paintLookSwap(box, phase) {
  box.style.transform = '';
  if (phase === 'out') {
    box.style.transition = `opacity ${LOOK_SWAP_MS}ms ease-in`;
    box.style.opacity = '0';
    return;
  }
  if (phase === 'enter') {
    box.style.transition = 'none';
    box.style.opacity = '0';
    return;
  }
  box.style.transition = `opacity ${LOOK_SWAP_MS}ms ease-out`;
  box.style.opacity = '1';
}

export default function BirthdayCardVisual() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const presentedRef = useRef('crimson');
  const theme = usePageTheme();
  const [paletteId, setPaletteId] = useState('crimson');
  const [presentedId, setPresentedId] = useState('crimson');
  const [cycleKey, setCycleKey] = useState(0);
  const [near, setNear] = useState(true);
  const presented = lookForPalette(presentedId);
  const accent = paletteColorsFor(theme, presented.paletteId).accent;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(([entry]) => {
      setNear((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting));
    }, { rootMargin: '180px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return undefined;
    const timer = window.setTimeout(() => {
      setPaletteId((current) => nextPaletteId(current));
    }, COLOR_CYCLE_MS);
    return () => window.clearTimeout(timer);
  }, [paletteId, cycleKey, near]);

  useEffect(() => {
    if (paletteId === presentedRef.current) return undefined;
    const box = stageRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !box) {
      presentedRef.current = paletteId;
      setPresentedId(paletteId);
      return undefined;
    }

    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    paintLookSwap(box, 'out');
    const swap = window.setTimeout(() => {
      if (cancelled) return;
      presentedRef.current = paletteId;
      setPresentedId(paletteId);
      paintLookSwap(box, 'enter');
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          if (!cancelled) paintLookSwap(box, 'idle');
        });
      });
    }, LOOK_SWAP_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(swap);
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [paletteId]);

  const choosePalette = (id) => {
    setPaletteId(id);
    setCycleKey((key) => key + 1);
  };

  return (
    <div className="win-bday" ref={rootRef}>
      <div
        className="win-bday-stage"
        ref={stageRef}
        data-palette={presented.paletteId}
        data-design={presented.coverId}
        data-recipient={presented.name}
        data-notes={presented.notes.map((note) => `${note.name}: ${note.text}`).join(' | ')}
      >
        <RGLStage
          className="win-bday-canvas"
          idleSpin
          holdYaw={null}
          tapSpin={false}
          allowDrag={false}
          interactive={false}
          appearTurns={0}
        >
          <BirthdayCard3D
            open
            name={presented.name}
            notes={presented.notes}
            coverId={presented.coverId}
            theme={theme}
            paletteId={presented.paletteId}
          />
        </RGLStage>
        <BirthdayGlow
          variant="radial"
          interactive
          active
          color={accent}
          className="win-bday-sparkle"
        />
      </div>
      <div className="win-bday-look" role="group" aria-label="Card color">
        <div className="win-bday-colors">
          <div className="win-bday-swatches" role="radiogroup" aria-label="Card color">
            {GIFT_PALETTES.map((palette) => {
              const selected = palette.id === paletteId;
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={palette.name}
                  title={palette.name}
                  className={`win-bday-swatch${selected ? ' is-on' : ''}`}
                  style={{ background: paletteColorsFor(theme, palette.id).accent }}
                  onClick={() => choosePalette(palette.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
