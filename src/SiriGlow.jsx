import React, { useEffect, useRef, useCallback } from 'react';

function hsbFromHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const br = max;
  if (max !== min) {
    const d = max - min;
    s = d / max;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h, s, b: br };
}

function hsbToCSS(h, s, b, a) {
  // Convert HSB to HSL for CSS
  const l = b * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (b - l) / Math.min(l, 1 - l);
  return `hsla(${(h * 360).toFixed(0)}, ${(sl * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a})`;
}

function getGlowShades(hex) {
  const { h, s, b } = hsbFromHex(hex);
  const sat = Math.min(s * 1.2, 1.0);
  return {
    core: { h, s: sat * 0.55, b: 1.0 },
    mid: { h, s: sat, b: Math.max(b, 0.75) },
  };
}

function lerp(a, b, t) { return a + (b - a) * t; }

function buildGradientStops(elapsed, opacityMult, shades, intensity) {
  const settleDuration = 1.2;
  const settle = Math.min(elapsed / settleDuration, 1.0);
  const eased = settle * settle;
  // Gentle fixed pulse regardless of intensity
  const basePulse = 0.7 + 0.3 * Math.sin(elapsed * 2.0);
  const pulse = lerp(1.0, basePulse, eased);
  const om = opacityMult * pulse;
  const topOp = lerp(0.85, 0.3, eased);
  const midHighOp = lerp(0.7, 0.4, eased);
  const midOp = lerp(0.55, 0.5, eased);

  return { om, topOp, midHighOp, midOp, shades };
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function createConicGradient(ctx, cx, cy, params, angle) {
  const { om, topOp, midHighOp, midOp, shades } = params;
  const grad = ctx.createConicGradient(angle, cx, cy);
  const c = shades.core, m = shades.mid;
  grad.addColorStop(0.00, hsbToCSS(m.h, m.s, m.b, 0.7 * om));
  grad.addColorStop(0.10, hsbToCSS(m.h, m.s, m.b, 0.6 * om));
  grad.addColorStop(0.25, hsbToCSS(c.h, c.s, c.b, midOp * om));
  grad.addColorStop(0.38, hsbToCSS(c.h, c.s, c.b, midHighOp * om));
  grad.addColorStop(0.50, hsbToCSS(c.h, c.s, c.b, topOp * om));
  grad.addColorStop(0.62, hsbToCSS(c.h, c.s, c.b, midHighOp * om));
  grad.addColorStop(0.75, hsbToCSS(c.h, c.s, c.b, midOp * om));
  grad.addColorStop(0.90, hsbToCSS(m.h, m.s, m.b, 0.6 * om));
  grad.addColorStop(1.00, hsbToCSS(m.h, m.s, m.b, 0.7 * om));
  return grad;
}

export default function SiriGlow({ active, color = '#EB6139', intensity = 1, width, height, borderRadius = 12 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(0);
  const lastTimeRef = useRef(0);
  const angleRef = useRef(0);
  const shadesRef = useRef(getGlowShades(color));
  const opacityRef = useRef(0);
  const fadingRef = useRef(false);
  const intensityTargetRef = useRef(intensity);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    intensityTargetRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    shadesRef.current = getGlowShades(color);
  }, [color]);

  const render = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!startRef.current) { startRef.current = time; lastTimeRef.current = time; }
    const elapsed = (time - startRef.current) / 1000;
    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    // Fade in/out
    if (active && !fadingRef.current) {
      opacityRef.current = Math.min(opacityRef.current + 0.03, 1);
    } else {
      opacityRef.current = Math.max(opacityRef.current - 0.02, 0);
      if (opacityRef.current <= 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; // stop animating
      }
    }

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Smoothly animate intensity toward target
    const target = intensityTargetRef.current;
    const diff = target - intensityRef.current;
    intensityRef.current += diff * 0.03;
    if (Math.abs(diff) < 0.01) intensityRef.current = target;

    // Intensity scaling: more people = bigger, stronger glow
    const iRaw = Math.min(Math.max(intensityRef.current, 0), 8);
    const iScale = 1 + (iRaw - 1) * 0.45;
    const iOpacity = Math.min(1 + (iRaw - 1) * 0.22, 2.5);

    // Accumulate rotation — speed increases with intensity, no jumps
    const rotSpeed = (60 + Math.min(iRaw, 8) * 15) * Math.PI / 180;
    angleRef.current += dt * rotSpeed;
    const angle = angleRef.current;

    const globalAlpha = opacityRef.current;
    const shades = shadesRef.current;
    const cx = w / 2, cy = h / 2;
    const pad = 62;
    const cardX = pad, cardY = pad;
    const cardW = w - pad * 2, cardH = h - pad * 2;
    const r = borderRadius;

    // Clip to card shape
    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();

    // Layer 1: Halo — wide spread, heavy blur
    ctx.save();
    ctx.globalAlpha = Math.min(globalAlpha * 0.8 * iOpacity, 1);
    ctx.filter = `blur(${Math.round(16 * iScale)}px)`;
    ctx.strokeStyle = createConicGradient(ctx, cx, cy,
      buildGradientStops(elapsed, 0.8 * iOpacity, shades, iRaw), angle);
    ctx.lineWidth = 14 * iScale;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.stroke();
    ctx.restore();

    // Layer 2: Main glow
    ctx.save();
    ctx.globalAlpha = Math.min(globalAlpha * iOpacity, 1);
    ctx.filter = `blur(${Math.round(4 * iScale)}px)`;
    ctx.strokeStyle = createConicGradient(ctx, cx, cy,
      buildGradientStops(elapsed, 1.0 * iOpacity, shades, iRaw), angle);
    ctx.lineWidth = 6 * iScale;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.stroke();
    ctx.restore();

    // Layer 3: Core — sharp edge
    ctx.save();
    ctx.globalAlpha = Math.min(globalAlpha * iOpacity, 1);
    ctx.strokeStyle = createConicGradient(ctx, cx, cy,
      buildGradientStops(elapsed, 1.0 * iOpacity, shades, iRaw), angle);
    ctx.lineWidth = 3 * iScale;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // unclip

    animRef.current = requestAnimationFrame(render);
  }, [active, borderRadius]);

  useEffect(() => {
    if (active) {
      fadingRef.current = false;
      startRef.current = 0;
      animRef.current = requestAnimationFrame(render);
    } else {
      fadingRef.current = true;
      // Keep animating for fade out
      if (!animRef.current) {
        animRef.current = requestAnimationFrame(render);
      }
    }
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [active, render]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: '-62px',
        width: 'calc(100% + 124px)',
        height: 'calc(100% + 124px)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
