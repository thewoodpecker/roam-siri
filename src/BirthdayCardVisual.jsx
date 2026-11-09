import React, { useEffect, useState } from 'react';
import BirthdayCard3D, { cardSeedNotesFor } from './rgl/BirthdayCard3D';
import RGLStage from './rgl/RGLStage';

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

export default function BirthdayCardVisual() {
  const theme = usePageTheme();

  return (
    <div className="win-bday-stage">
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
          name="Lexi"
          notes={cardSeedNotesFor('Lexi')}
          theme={theme}
          paletteId="crimson"
          coverId="classic"
        />
      </RGLStage>
    </div>
  );
}
