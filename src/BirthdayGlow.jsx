import { useEffect, useRef } from 'react';
import { ROAM_GOLD } from './rgl/materials';

/** Default birthday accent — same as gift palette `roam`. */
export const BIRTHDAY_GOLD = ROAM_GOLD;

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const NOISE_GLSL = `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.05 + vec2(11.3, 7.1);
    a *= 0.5;
  }
  return v;
}

/* Multi-layer cell sparkles — \`density\` 0..1 (lower = fewer).
   Brief random flashes at a calm rate (no sine pulse). */
float birthdaySparkles(vec2 frag, float t, float density) {
  float spark = 0.0;
  float gateA = mix(0.92, 0.58, clamp(density, 0.0, 1.0));
  float gateB = mix(0.95, 0.70, clamp(density, 0.0, 1.0));

  vec2 spA = frag * 0.14;
  vec2 cellA = floor(spA);
  vec2 fA = fract(spA) - 0.5;
  float idA = hash21(cellA);
  vec2 offA = vec2(hash21(cellA + 17.1), hash21(cellA + 91.7)) - 0.5;
  float distA = length(fA - offA * 0.55);
  /* ~0.35–0.8 Hz — slow glitter, not strobe. */
  float rateA = mix(0.35, 0.8, idA);
  float phaseA = fract(t * rateA + idA * 5.1);
  float tickA = floor(t * rateA + idA * 5.1);
  float flashA = step(0.55, hash21(cellA + tickA * 17.0));
  flashA *= smoothstep(0.0, 0.08, phaseA) * smoothstep(0.55, 0.22, phaseA);
  spark += (1.0 - smoothstep(0.0, 0.18, distA)) * flashA * step(gateA, idA);

  vec2 spB = frag * 0.085 + vec2(40.0, 13.0);
  vec2 cellB = floor(spB);
  vec2 fB = fract(spB) - 0.5;
  float idB = hash21(cellB + 3.3);
  vec2 offB = vec2(hash21(cellB + 5.5), hash21(cellB + 8.8)) - 0.5;
  float distB = length(fB - offB * 0.6);
  float rateB = mix(0.28, 0.7, idB);
  float phaseB = fract(t * rateB + idB * 3.7);
  float tickB = floor(t * rateB + idB * 3.7);
  float flashB = step(0.62, hash21(cellB + tickB * 23.0));
  flashB *= smoothstep(0.0, 0.1, phaseB) * smoothstep(0.5, 0.2, phaseB);
  spark += (1.0 - smoothstep(0.0, 0.22, distB)) * flashB * step(gateB, idB) * 0.85;

  /* Sparse static flecks — stable, not pulsing. */
  float fleck = pow(hash21(floor(frag * 0.12)), 14.0) * (0.2 + 0.3 * density);
  spark += fleck * (1.0 - smoothstep(0.0, 0.2, length(fract(frag * 0.12) - 0.5)));

  return clamp(spark, 0.0, 1.0);
}
`;

/** Soft floor wash — bottom interior of an office card; cursor trail when interactive. */
const FRAG_FLOOR = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_color;
uniform float u_radius;
uniform float u_reduce;
uniform vec2  u_mouse;
uniform float u_mouse_on;
uniform vec2  u_trail[12];
uniform float u_trail_len;

${NOISE_GLSL}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  vec2 halfRes = u_res * 0.5;
  vec2 pBox = frag - halfRes;
  /* Cursor space — matches JS mouse (-1..1 across the card). */
  vec2 p = pBox / halfRes;

  float d = sdRoundBox(pBox, halfRes - vec2(1.0), u_radius);
  float inside = 1.0 - smoothstep(-2.0, 2.0, d);
  if (inside <= 0.001) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float floorH = 0.78;
  float floorMask = 1.0 - smoothstep(0.0, floorH, uv.y);
  floorMask = pow(floorMask, 1.05);

  float flow = fbm(vec2(uv.x * 3.2 + u_time * 0.18, uv.y * 2.4 - u_time * 0.08));
  float band = 0.8 + 0.2 * flow;
  float wash = floorMask * (0.35 + 0.2 * flow) * band;

  /* Trail — sparkle wake along recent cursor path. */
  float trail = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= u_trail_len) break;
    float age = float(i) / max(u_trail_len - 1.0, 1.0);
    float rad = mix(0.28, 0.11, age);
    float td = length(p - u_trail[i]);
    float bead = exp(-(td * td) / (rad * rad * 2.0));
    trail += bead * mix(1.0, 0.18, age);
  }
  trail = clamp(trail * u_mouse_on, 0.0, 2.4) * floorMask;

  vec2 delta = p - u_mouse;
  float md = length(delta);
  float head = u_mouse_on * exp(-md * md * 3.2) * floorMask;
  vec2 toward = md > 0.001 ? -delta / md : vec2(0.0);
  vec2 warpedFrag = frag + toward * head * 18.0 + toward * trail * 12.0;

  float spark = birthdaySparkles(warpedFrag, u_time, 0.72);
  spark += birthdaySparkles(frag * 1.15 + u_time * 2.0, u_time, 0.45) * trail * 1.45;
  /* Sparkle band sits above the floor wash — nudged up into the card. */
  spark *= floorMask * smoothstep(0.72, 0.28, uv.y);
  spark = clamp(spark * (1.0 + trail * 1.7 + head * 0.85), 0.0, 1.0);

  float alpha = (wash * 0.4 + spark * 0.9) * inside;
  if (u_reduce > 0.5) {
    alpha = floorMask * 0.28 * inside;
    spark = 0.0;
  }
  alpha = clamp(alpha, 0.0, 1.0);

  vec3 hot = mix(u_color, vec3(1.0), 0.2);
  vec3 col = mix(u_color * 0.92, u_color, wash);
  col = mix(col, hot, spark * 0.4 + wash * 0.08 + trail * 0.25);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

/** Radial sparkling field — full-stage field with cursor sparkle trail. */
const FRAG_RADIAL = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_color;
uniform float u_radius;
uniform float u_reduce;
uniform vec2  u_mouse;
uniform float u_mouse_on;
uniform vec2  u_trail[12];
uniform float u_trail_len;

${NOISE_GLSL}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 halfRes = u_res * 0.5;
  /* Match cursor space: -1..1 across full canvas (not a circular disc). */
  vec2 p = (frag - halfRes) / halfRes;

  /* Soft screen vignette only — field fills the stage. */
  float edge = min(
    smoothstep(0.0, 0.08, (p.x + 1.0) * 0.5) * smoothstep(1.0, 0.92, (p.x + 1.0) * 0.5),
    smoothstep(0.0, 0.08, (p.y + 1.0) * 0.5) * smoothstep(1.0, 0.92, (p.y + 1.0) * 0.5)
  );
  float field = mix(0.85, 1.0, edge);

  /* Trail — sparkle wake along recent cursor path (index 0 = newest). */
  float trail = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) >= u_trail_len) break;
    float age = float(i) / max(u_trail_len - 1.0, 1.0);
    float rad = mix(0.22, 0.09, age);
    float d = length(p - u_trail[i]);
    float bead = exp(-(d * d) / (rad * rad * 2.0));
    trail += bead * mix(1.0, 0.18, age);
  }
  trail = clamp(trail * u_mouse_on, 0.0, 2.4);

  /* Slight pull of sparkles toward the newest trail head. */
  vec2 delta = p - u_mouse;
  float md = length(delta);
  float head = u_mouse_on * exp(-md * md * 3.2);
  vec2 toward = md > 0.001 ? -delta / md : vec2(0.0);
  vec2 warpedFrag = frag + toward * head * 22.0 + toward * trail * 14.0;

  float spark = birthdaySparkles(warpedFrag, u_time, 0.22);
  /* Flecks along the trail itself. */
  spark += birthdaySparkles(frag * 1.15 + u_time * 2.0, u_time, 0.28) * trail * 1.35;
  spark += birthdaySparkles(frag + 40.0, u_time, 0.18) * trail * 0.7;
  spark = clamp(spark, 0.0, 1.0) * field;
  spark *= 1.0 + trail * 1.55 + head * 0.85;

  float alpha = spark * 0.9;
  if (u_reduce > 0.5) {
    alpha = field * 0.14;
    spark = 0.0;
  }
  alpha = clamp(alpha, 0.0, 1.0);

  vec3 hot = mix(u_color, vec3(1.0), 0.45);
  vec3 col = mix(u_color, hot, spark * 0.5 + trail * 0.35);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

const TRAIL_LEN = 12;

function parseHex(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(err || 'shader compile failed');
  }
  return sh;
}

/**
 * Birthday celebration FX.
 * - `floor`  — soft palette wash + sparkles along an office floor
 * - `radial` — sparkling disc behind the gift (cursor-interactive when enabled)
 */
export default function BirthdayGlow({
  active = true,
  color = BIRTHDAY_GOLD,
  borderRadius = 10,
  variant = 'floor',
  className = 'sc-birthday-glow',
  interactive = false,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const glRef = useRef(null);
  const uColorRef = useRef(null);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetOn: 0,
    on: 0,
    trail: [], // newest first: { x, y }
  });

  useEffect(() => {
    if (!interactive || !active) return undefined;

    const onMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const pad = 64;
      const inside =
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad;
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      const m = mouseRef.current;
      m.x = x;
      m.y = y;
      m.targetOn = inside ? 1 : 0;
      if (!inside) return;

      const head = m.trail[0];
      const dist = head ? Math.hypot(x - head.x, y - head.y) : 1;
      // Only stamp a new bead when the cursor moved enough.
      if (dist > 0.035) {
        m.trail.unshift({ x, y });
        if (m.trail.length > TRAIL_LEN) m.trail.length = TRAIL_LEN;
      } else if (head) {
        head.x = x;
        head.y = y;
      } else {
        m.trail.unshift({ x, y });
      }
    };

    const onLeave = () => {
      mouseRef.current.targetOn = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('blur', onLeave);
    };
  }, [interactive, active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        failIfMajorPerformanceCaveat: false,
      }) ||
      canvas.getContext('experimental-webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
      });
    if (!gl) {
      console.warn('[BirthdayGlow] WebGL unavailable');
      return undefined;
    }
    glRef.current = gl;

    const fragSrc = variant === 'radial' ? FRAG_RADIAL : FRAG_FLOOR;
    let prog;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
      prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
      }
    } catch (err) {
      console.error('[BirthdayGlow]', err);
      return undefined;
    }

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uColor = gl.getUniformLocation(prog, 'u_color');
    const uRadius = gl.getUniformLocation(prog, 'u_radius');
    const uReduce = gl.getUniformLocation(prog, 'u_reduce');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uMouseOn = gl.getUniformLocation(prog, 'u_mouse_on');
    const uTrail = [];
    for (let i = 0; i < TRAIL_LEN; i++) {
      uTrail.push(gl.getUniformLocation(prog, `u_trail[${i}]`));
    }
    const uTrailLen = gl.getUniformLocation(prog, 'u_trail_len');
    uColorRef.current = uColor;

    gl.uniform3fv(uColor, parseHex(color));
    gl.uniform1f(uRadius, borderRadius);
    gl.uniform2f(uMouse, 0, 0);
    gl.uniform1f(uMouseOn, 0);
    gl.uniform1f(uTrailLen, 0);
    for (let i = 0; i < TRAIL_LEN; i++) {
      if (uTrail[i]) gl.uniform2f(uTrail[i], 0, 0);
    }

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReduce = () => gl.uniform1f(uReduce, reduceMq.matches ? 1 : 0);
    syncReduce();
    reduceMq.addEventListener?.('change', syncReduce);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const bw = Math.max(1, Math.round(w * dpr));
      const bh = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      gl.viewport(0, 0, bw, bh);
      gl.uniform2f(uRes, bw, bh);
      gl.uniform1f(uRadius, borderRadius * dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let lastTrailTrim = 0;
    const frame = (t) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }
      if (!startRef.current) startRef.current = t;
      const elapsed = (t - startRef.current) / 1000;

      const m = mouseRef.current;
      m.on += (m.targetOn - m.on) * 0.14;
      if (m.on < 0.001) m.on = 0;

      // Age the trail out when idle / leaving the field.
      if (t - lastTrailTrim > 48) {
        lastTrailTrim = t;
        if (m.targetOn < 0.5 || m.trail.length > 0) {
          // Drop the oldest bead periodically so the wake fades.
          if (m.trail.length > 1) m.trail.pop();
          else if (m.targetOn < 0.5) m.trail.length = 0;
        }
      }

      gl.uniform2f(uMouse, m.x, m.y);
      gl.uniform1f(uMouseOn, interactive ? m.on : 0);
      const len = interactive ? m.trail.length : 0;
      gl.uniform1f(uTrailLen, len);
      for (let i = 0; i < TRAIL_LEN; i++) {
        if (!uTrail[i]) continue;
        const pt = m.trail[i];
        gl.uniform2f(uTrail[i], pt ? pt.x : 0, pt ? pt.y : 0);
      }

      gl.uniform1f(uTime, elapsed);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      startRef.current = 0;
      ro.disconnect();
      reduceMq.removeEventListener?.('change', syncReduce);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      glRef.current = null;
      uColorRef.current = null;
    };
  }, [active, borderRadius, variant, interactive]);

  useEffect(() => {
    const gl = glRef.current;
    const uColor = uColorRef.current;
    if (!gl || !uColor || !active) return;
    gl.uniform3fv(uColor, parseHex(color));
  }, [active, color]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
