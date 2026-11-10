import { memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { AwardCoinScene, AWARD_COIN_MODEL_URL } from "./AwardCoin";
import type { AwardMetal } from "./types";

// Warm the shared mesh so opening Awards doesn't flash six cold loads
useLoader.preload(OBJLoader, AWARD_COIN_MODEL_URL);

type AwardCoinCanvasProps = {
  value: number;
  metal: AwardMetal;
  disabled?: boolean;
  hovered?: boolean;
  /** Another coin is hovered — fade this one */
  dimmed?: boolean;
  /** Success-coin overlay — faster Y spin while CSS moves it */
  sending?: boolean;
  /** Idle spin — default on once canvas is sized */
  spinning?: boolean;
  index?: number;
};

export const AwardCoinCanvas = memo(function AwardCoinCanvas({
  value,
  metal,
  disabled,
  hovered = false,
  dimmed = false,
  sending = false,
  spinning,
  index = 0,
}: AwardCoinCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let near = true;
    const apply = () => {
      const reduced = reduceMq.matches;
      const on = near && !document.hidden && !reduced;
      setLive((prev) => (prev === on ? prev : on));
      const stage = el.closest(".sc-win-award-stage");
      if (stage instanceof HTMLElement && !reduced) {
        stage.style.animationPlayState = near && !document.hidden ? "running" : "paused";
      }
    };
    const obs = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      apply();
    }, { rootMargin: "180px 0px" });
    obs.observe(el);
    reduceMq.addEventListener("change", apply);
    document.addEventListener("visibilitychange", apply);
    apply();
    return () => {
      obs.disconnect();
      reduceMq.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", apply);
      const stage = el.closest(".sc-win-award-stage");
      if (stage instanceof HTMLElement) stage.style.animationPlayState = "";
    };
  }, []);

  const handleCreated = useCallback(() => {
    // Wait two frames so the canvas has a real size (avoids tiny→snap)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  // During send, CSS animation owns opacity — skip dim/fade transitions
  const opacity = !visible ? 0 : sending ? 1 : dimmed ? 0.8 : 1;
  const shouldSpin = spinning ?? visible;

  return (
    <div
      ref={hostRef}
      className={`sc-win-award-canvas size-full ${sending ? "" : "transition-opacity duration-300 ease-in-out"}`}
      style={{ opacity }}
    >
      <Canvas
        // Cap at 2× so retina phones stay sharp (1.25 looked soft on mobile)
        dpr={[1, 2]}
        frameloop={live ? "always" : "demand"}
        camera={{ position: [0, sending ? 0.72 : 0, sending ? 5.4 : 2.6], fov: sending ? 36 : 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", touchAction: "none" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          handleCreated();
        }}
      >
        <Suspense fallback={null}>
          <AwardCoinScene
            value={value}
            metal={metal}
            disabled={disabled}
            spinning={shouldSpin}
            hovered={hovered}
            sending={sending}
            index={index}
          />
        </Suspense>
      </Canvas>
    </div>
  );
});
