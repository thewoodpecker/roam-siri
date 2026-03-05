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

function buildGradientStops(elapsed, opacityMult, shades) {
  const settleDuration = 1.2;
  const settle = Math.min(elapsed / settleDuration, 1.0);
  const eased = settle * settle;
  const basePulse = 0.7 + 0.3 * Math.sin(elapsed * 2.0);
  const pulse = lerp(1.0, basePulse, eased);
  const om = opacityMult * pulse;
  const topOp = lerp(0.85, 0.3, eased);
  const midHighOp = lerp(0.7, 0.4, eased);
  const midOp = lerp(0.55, 0.5, eased);
  const angle = (90 + elapsed * 60 * eased) * Math.PI / 180;

  return { om, topOp, midHighOp, midOp, angle, shades };
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

function createConicGradient(ctx, cx, cy, params) {
  const { om, topOp, midHighOp, midOp, angle, shades } = params;
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

export default function SiriGlow({ active, color = '#EB6139', width, height, borderRadius = 12 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(0);
  const shadesRef = useRef(getGlowShades(color));
  const opacityRef = useRef(0);
  const fadingRef = useRef(false);

  useEffect(() => {
    shadesRef.current = getGlowShades(color);
  }, [color]);

  const render = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!startRef.current) startRef.current = time;
    const elapsed = (time - startRef.current) / 1000;

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

    const globalAlpha = opacityRef.current;
    const shades = shadesRef.current;
    const cx = w / 2, cy = h / 2;
    const pad = 20; // extra space for blur
    const cardX = pad, cardY = pad;
    const cardW = w - pad * 2, cardH = h - pad * 2;
    const r = borderRadius;

    // Clip to card shape
    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.clip();

    // Layer 1: Halo — lineWidth 14, blur 16
    ctx.save();
    ctx.globalAlpha = globalAlpha * 0.8;
    ctx.filter = 'blur(16px)';
    ctx.strokeStyle = createConicGradient(ctx, cx, cy,
      buildGradientStops(elapsed, 0.8, shades));
    ctx.lineWidth = 14;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.stroke();
    ctx.restore();

    // Layer 2: Main — lineWidth 6, blur 4
    ctx.save();
    ctx.globalAlpha = globalAlpha;
    ctx.filter = 'blur(4px)';
    ctx.strokeStyle = createConicGradient(ctx, cx, cy,
      buildGradientStops(elapsed, 1.0, shades));
    ctx.lineWidth = 6;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, r);
    ctx.stroke();
    ctx.restore();

    // Layer 3: Core — lineWidth 3, no blur
    ctx.save();
    ctx.globalAlpha = globalAlpha;
    ctx.strokeStyle = createConicGradient(ctx, cx, cy,
      buildGradientStops(elapsed, 1.0, shades));
    ctx.lineWidth = 3;
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
        inset: '-20px',
        width: 'calc(100% + 40px)',
        height: 'calc(100% + 40px)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
