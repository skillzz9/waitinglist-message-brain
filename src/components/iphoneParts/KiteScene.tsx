'use client';

import { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';

const VW = 900;
const VH = 520;
const DEFAULT_GROUND_Y = 410;
const MAX_SCROLL_SPEED = 240;
const MAX_RUN_FREQ = 11;
const BOIL_MS = 100;

const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function opsTod(ops: Array<{ op: string; data: number[] }>): string {
  return ops.map(op => {
    if (op.op === 'move')     return `M ${op.data[0]} ${op.data[1]}`;
    if (op.op === 'lineTo')   return `L ${op.data[0]} ${op.data[1]}`;
    if (op.op === 'bcurveTo') return `C ${op.data[0]} ${op.data[1]} ${op.data[2]} ${op.data[3]} ${op.data[4]} ${op.data[5]}`;
    return '';
  }).filter(Boolean).join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function R({ d, stroke = 'none', fill = 'none', sw = 1 }: { d: any; stroke?: string; fill?: string; sw?: number }) {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {d.sets.map((set: any, i: number) => {
        const pd = opsTod(set.ops);
        if (set.type === 'path')     return <path key={i} d={pd} stroke={stroke} strokeWidth={sw} fill="none" />;
        if (set.type === 'fillPath') return <path key={i} d={pd} fill={fill} stroke="none" />;
        return <path key={i} d={pd} stroke={fill} strokeWidth={d.options?.fillWeight ?? 1} fill="none" />;
      })}
    </>
  );
}

interface Props { score: number; width?: number; groundY?: number; clipTop?: number }

export function KiteScene({ score: rawScore, width = 273, groundY: groundYProp, clipTop = 0 }: Props) {
  const GROUND_Y = groundYProp ?? DEFAULT_GROUND_Y;
  const visibleH = VH - clipTop;
  const sceneH = Math.round(width * visibleH / VW);

  const gen = rough.generator();

  const scoreRef   = useRef(clamp(rawScore, 0, 100) / 100);
  scoreRef.current = clamp(rawScore, 0, 100) / 100;

  const startRef    = useRef(performance.now());
  const scrolledTRef = useRef(0);
  const lastTRef    = useRef(0);
  const lastBoilRef = useRef(performance.now());
  const boilTickRef = useRef(1);

  const [frame, setFrame] = useState({ t: 0, scrolledT: 0, boilTick: 1 });

  useEffect(() => {
    startRef.current     = performance.now();
    scrolledTRef.current = 0;
    lastTRef.current     = 0;
    lastBoilRef.current  = performance.now();
    boilTickRef.current  = 1;

    let raf: number;
    const tick = () => {
      const now = performance.now();
      const t   = (now - startRef.current) / 1000;
      const dt  = t - lastTRef.current;
      lastTRef.current = t;

      const f = scoreRef.current;
      scrolledTRef.current += dt * Math.pow(f, 1.2);

      if (now - lastBoilRef.current > BOIL_MS) {
        boilTickRef.current = (boilTickRef.current % 6) + 1;
        lastBoilRef.current = now;
      }

      setFrame({ t, scrolledT: scrolledTRef.current, boilTick: boilTickRef.current });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const f = clamp(rawScore, 0, 100) / 100;
  const { t, scrolledT, boilTick } = frame;
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  const cycle    = scrolledT * MAX_RUN_FREQ;
  const phase    = Math.sin(cycle);
  const phaseOpp = Math.sin(cycle + Math.PI);
  const bob      = Math.abs(Math.cos(cycle)) * 6 * f;

  const farScroll   = (scrolledT * MAX_SCROLL_SPEED * 0.18) % 320;
  const cloudScroll = (scrolledT * MAX_SCROLL_SPEED * 0.12 + t * 6) % 1300;
  const midScroll   = (scrolledT * MAX_SCROLL_SPEED * 0.4)  % 270;
  const treeScroll  = (scrolledT * MAX_SCROLL_SPEED * 0.55) % 200;
  const grassScroll = (scrolledT * MAX_SCROLL_SPEED)         % 55;

  const kx = 360, ky = GROUND_Y;
  const leanX = lerp(0, -2, f);
  const headY  = ky - 110 - bob;
  const neckY  = ky - 92  - bob;
  const hipY   = ky - 50  - bob;

  const rShX = kx + 14, rShY = neckY + 6;
  const rArmAngle = lerp(Math.PI / 2 + 0.15, -Math.PI / 4, f) + phase * 0.22 * f;
  const rHandX = rShX + Math.cos(rArmAngle) * 34;
  const rHandY = rShY + Math.sin(rArmAngle) * 34;

  const lShX = kx - 14, lShY = neckY + 6;
  const lArmAngle = Math.PI / 2 + phaseOpp * 1.25 * f;
  const lArmEndX = lShX + Math.cos(lArmAngle) * 30;
  const lArmEndY = lShY + Math.sin(lArmAngle) * 30;

  const legAngle = phase * lerp(0, 1.15, f);
  const rLegX = kx + Math.sin(-legAngle) * 44;
  const rLegY = hipY + 14 + Math.cos(-legAngle) * 44;
  const lLegX = kx + Math.sin(legAngle)  * 44;
  const lLegY = hipY + 14 + Math.cos(legAngle)  * 44;

  const kiteCX  = lerp(kx + 80, 660, f) + Math.sin(t * 1.4) * 30 * f;
  const kiteCY  = lerp(GROUND_Y - 22, 130, f) + Math.cos(t * 1.0) * 22 * f - bob * 0.4;
  const kiteRot = lerp(Math.PI / 2 - 0.18, -0.3 + Math.sin(t * 1.6) * 0.35, f);
  const ck = Math.cos(kiteRot), sk = Math.sin(kiteRot);
  const diamond: [number, number][] = ([[0, -36], [26, 0], [0, 36], [-26, 0]] as [number, number][]).map(
    ([x, y]) => [kiteCX + x * ck - y * sk, kiteCY + x * sk + y * ck],
  );

  interface Seg { x1: number; y1: number; x2: number; y2: number; ribbon: boolean }
  const tailSegs: Seg[] = [];
  const twFreq = t * lerp(2, 14, f);
  const twAmp  = lerp(2, 22, f);
  const tdx = lerp(-14, 12, f), tdy = lerp(0, 10, f);
  let ttx = diamond[2][0], tty = diamond[2][1];
  for (let i = 1; i <= 8; i++) {
    const wave = Math.sin(twFreq + i * 0.9) * twAmp;
    const nx = ttx + tdx + wave * 0.6;
    const ny = tty + tdy - Math.cos(twFreq + i * 0.9) * 3 * f;
    tailSegs.push({ x1: ttx, y1: tty, x2: nx, y2: ny, ribbon: i % 2 === 1 });
    ttx = nx; tty = ny;
  }

  const sMidX = (rHandX + kiteCX) / 2 + Math.sin(t * 3) * 8 * f;
  const sMidY = (rHandY + kiteCY) / 2 + lerp(4, 18, f);

  const showDust = f > 0.7 && phase < -0.5;
  const dustI    = showDust ? (f - 0.7) / 0.3 : 0;
  const hairBlow  = lerp(2, 22, f);
  const mouthCurv = lerp(-6, 6, f);
  const eyeY      = headY - lerp(-2, 2, f);

  const sky = gen.rectangle(0, 0, VW, GROUND_Y - 3, { stroke: 'none', fill: '#f7eed5', fillStyle: 'solid', roughness: 0 });
  const sunX = 180, sunY = 110;
  const sun = gen.circle(sunX, sunY, 100, { stroke: '#c97a3a', strokeWidth: 2.5, fill: '#f5b258', fillStyle: 'zigzag', fillWeight: 1.5, hachureGap: 6, roughness: 2.2, seed: seed(0) });
  const sunRays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return gen.line(sunX + Math.cos(a) * 58, sunY + Math.sin(a) * 58, sunX + Math.cos(a) * 78, sunY + Math.sin(a) * 78, { stroke: '#c97a3a', strokeWidth: 2.5, roughness: 2, seed: seed(i + 1) });
  });
  const farHills = Array.from({ length: 6 }, (_, i) => {
    const x = (i - 1) * 320 + farScroll;
    return gen.path(`M ${x} ${GROUND_Y} Q ${x + 160} ${GROUND_Y - 95} ${x + 320} ${GROUND_Y}`, { stroke: '#9aa888', strokeWidth: 2, roughness: 2.2, seed: seed(i + 10) });
  });
  const clouds = ([[120, 70, 110, 30], [420, 95, 140, 38], [720, 60, 95, 28], [1010, 100, 125, 34]] as [number, number, number, number][]).map(
    ([bx, by, cw, ch], i) => {
      const cx = ((bx + cloudScroll) % 1300 + 1300) % 1300 - 200;
      return gen.ellipse(cx, by, cw, ch, { stroke: '#7a6a5a', strokeWidth: 1.5, fill: '#fdf6e6', fillStyle: 'solid', roughness: 1.8, seed: seed(i + 20) });
    });
  const midHills = Array.from({ length: 7 }, (_, i) => {
    const x = (i - 1) * 270 + midScroll;
    return gen.path(`M ${x} ${GROUND_Y} Q ${x + 135} ${GROUND_Y - 60} ${x + 270} ${GROUND_Y}`, { stroke: '#6a7a52', strokeWidth: 2, fill: '#a8b682', fillStyle: 'hachure', fillWeight: 1, hachureGap: 8, roughness: 1.8, seed: seed(i + 30) });
  });
  const trees = Array.from({ length: 8 }, (_, i) => {
    const x = (i - 1) * 200 + treeScroll + 50;
    return {
      trunk: gen.line(x, GROUND_Y, x, GROUND_Y - 65, { stroke: '#4a3018', strokeWidth: 2.2, roughness: 1.5, seed: seed(i + 40) }),
      canopy: gen.circle(x, GROUND_Y - 80, 48, { stroke: '#3a5018', strokeWidth: 2, fill: '#7aa048', fillStyle: 'cross-hatch', fillWeight: 1, hachureGap: 7, roughness: 2, seed: seed(i + 50) }),
    };
  });
  const groundLine = gen.line(0, GROUND_Y, VW, GROUND_Y, { stroke: '#3a2818', strokeWidth: 2.5, roughness: 1.5, seed: seed(60) });
  const grassTufts = Array.from({ length: 20 }, (_, i) => {
    const x = (i - 1) * 55 + grassScroll;
    const h = 7 + ((i * 11) % 9);
    return [
      gen.line(x,    GROUND_Y, x + 3,  GROUND_Y - h,     { stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: seed(i + 70) }),
      gen.line(x+8,  GROUND_Y, x + 6,  GROUND_Y - h + 2, { stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: seed(i + 80) }),
      gen.line(x+14, GROUND_Y, x + 12, GROUND_Y - h - 1, { stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: seed(i + 90) }),
    ];
  });
  const speedLines = f > 0.45
    ? Array.from({ length: Math.round(2 + (f - 0.45) / 0.55 * 4) }, (_, i) => {
        const intensity = (f - 0.45) / 0.55;
        const y   = 240 + i * 30 + Math.sin(scrolledT * 8 + i) * 4;
        const len = (60 + ((i * 13) % 25)) * (0.4 + intensity * 0.6);
        const offset = ((scrolledT * MAX_SCROLL_SPEED * 1.3) + i * 90) % 320;
        const sx  = 480 + offset - 60;
        return gen.line(sx, y, sx + len, y, { stroke: '#9a7848', strokeWidth: 1.4 * (0.5 + intensity * 0.5), roughness: 1, seed: seed(i + 95) });
      })
    : [];

  const headD   = gen.circle(kx + leanX, headY, 36, { stroke: '#3a2010', strokeWidth: 2.2, fill: '#f4d4a8', fillStyle: 'solid', roughness: 1.5, seed: seed(0) });
  const hairD   = gen.path(`M ${kx+leanX-18} ${headY-10} Q ${kx+leanX} ${headY-26} ${kx+leanX+16} ${headY-13} L ${kx+leanX+hairBlow} ${headY-4}`, { stroke: '#3a2010', strokeWidth: 2.8, roughness: 1.8, seed: seed(1) });
  const hair2D  = f > 0.5 ? gen.line(kx+leanX+18, headY-6, kx+leanX+14+hairBlow, headY-2, { stroke: '#3a2010', strokeWidth: 2.2, roughness: 2, seed: seed(40) }) : null;
  const eyeD    = gen.circle(kx+leanX-8, eyeY, 3, { stroke: '#2a1808', strokeWidth: 1.5, fill: '#2a1808', fillStyle: 'solid', roughness: 0.8, seed: seed(2) });
  const browD   = f < 0.4 ? gen.line(kx+leanX-12, headY-8, kx+leanX-4, headY-6+(1-f/0.4)*2, { stroke: '#2a1808', strokeWidth: 1.8, roughness: 1, seed: seed(41) }) : null;
  const mouthD  = gen.path(`M ${kx+leanX-16} ${headY+8} Q ${kx+leanX-10} ${headY+8+mouthCurv} ${kx+leanX-4} ${headY+8}`, { stroke: '#2a1808', strokeWidth: 1.8, roughness: 1, seed: seed(3) });
  const shirtD  = gen.path(`M ${kx+leanX-16} ${neckY} L ${kx+leanX+16} ${neckY} L ${kx+14} ${hipY} L ${kx-14} ${hipY} Z`, { stroke: '#3a2010', strokeWidth: 2.2, fill: '#e87850', fillStyle: 'zigzag', fillWeight: 1, hachureGap: 6, roughness: 1.8, seed: seed(4) });
  const stripeD = gen.line(kx+leanX-14, neckY+18, kx+leanX+14, neckY+18, { stroke: '#fdf6e6', strokeWidth: 2.5, roughness: 1.5, seed: seed(5) });
  const shortsD = gen.path(`M ${kx-14} ${hipY} L ${kx+14} ${hipY} L ${kx+13} ${hipY+14} L ${kx-13} ${hipY+14} Z`, { stroke: '#3a2010', strokeWidth: 2.2, fill: '#3a5a88', fillStyle: 'hachure', fillWeight: 1, hachureGap: 5, roughness: 1.8, seed: seed(6) });
  const rArmD   = gen.line(rShX, rShY, rHandX, rHandY, { stroke: '#3a2010', strokeWidth: 2.6, roughness: 1.5, seed: seed(7) });
  const rHandD  = gen.circle(rHandX, rHandY, 8, { stroke: '#3a2010', strokeWidth: 1.8, fill: '#f4d4a8', fillStyle: 'solid', roughness: 1.2, seed: seed(8) });
  const lArmD   = gen.line(lShX, lShY, lArmEndX, lArmEndY, { stroke: '#3a2010', strokeWidth: 2.6, roughness: 1.5, seed: seed(9) });
  const rLegD   = gen.line(kx, hipY+14, rLegX, rLegY, { stroke: '#3a2010', strokeWidth: 2.8, roughness: 1.5, seed: seed(10) });
  const rShoeD  = gen.ellipse(rLegX-5, rLegY, 18, 7, { stroke: '#2a1808', strokeWidth: 2, fill: '#2a1808', fillStyle: 'solid', roughness: 1.5, seed: seed(11) });
  const lLegD   = gen.line(kx, hipY+14, lLegX, lLegY, { stroke: '#3a2010', strokeWidth: 2.8, roughness: 1.5, seed: seed(12) });
  const lShoeD  = gen.ellipse(lLegX-5, lLegY, 18, 7, { stroke: '#2a1808', strokeWidth: 2, fill: '#2a1808', fillStyle: 'solid', roughness: 1.5, seed: seed(13) });
  const dustD1  = showDust ? gen.ellipse(rLegX+12, rLegY+4, 24*dustI, 9*dustI, { stroke: '#a89070', strokeWidth: 1.4, roughness: 2.5, seed: seed(100) }) : null;
  const dustD2  = showDust ? gen.ellipse(rLegX+26, rLegY, 18*dustI, 7*dustI, { stroke: '#a89070', strokeWidth: 1.4, roughness: 2.5, seed: seed(101) }) : null;

  const kiteD      = gen.polygon(diamond, { stroke: '#5a2818', strokeWidth: 2.5, fill: '#e84548', fillStyle: 'hachure', fillWeight: 1.5, hachureGap: 5, roughness: 2, seed: seed(14) });
  const kiteSpineV = gen.line(diamond[0][0], diamond[0][1], diamond[2][0], diamond[2][1], { stroke: '#5a2818', strokeWidth: 1.8, roughness: 1.2, seed: seed(15) });
  const kiteSpineH = gen.line(diamond[1][0], diamond[1][1], diamond[3][0], diamond[3][1], { stroke: '#5a2818', strokeWidth: 1.8, roughness: 1.2, seed: seed(16) });
  const tailDs = tailSegs.map((seg, i) => ({
    line: gen.line(seg.x1, seg.y1, seg.x2, seg.y2, { stroke: '#e84548', strokeWidth: 2.6, roughness: 2.2, seed: seed(i + 17) }),
    ribbon: seg.ribbon ? gen.line(seg.x2-6, seg.y2-4, seg.x2+8, seg.y2-2, { stroke: '#f0c548', strokeWidth: 2.2, roughness: 2, seed: seed(i + 30) }) : null,
  }));
  const stringD = gen.path(`M ${rHandX} ${rHandY} Q ${sMidX} ${sMidY} ${kiteCX} ${kiteCY}`, { stroke: '#3a2818', strokeWidth: 1.4, roughness: 0.6, seed: seed(50) });

  return (
    <div style={{ width, height: sceneH, flexShrink: 0 }}>
      <svg width={width} height={sceneH} viewBox={`0 ${clipTop} ${VW} ${visibleH}`} style={{ display: 'block' }}>
        <g transform={`translate(${VW} 0) scale(-1 1)`}>
          <R d={sky} fill="#f7eed5" />
          <R d={sun} stroke="#c97a3a" fill="#f5b258" sw={2.5} />
          {sunRays.map((ray, i) => <R key={`sr${i}`} d={ray} stroke="#c97a3a" sw={2.5} />)}
          {farHills.map((h, i) => <R key={`fh${i}`} d={h} stroke="#9aa888" sw={2} />)}
          {clouds.map((c, i) => <R key={`cl${i}`} d={c} stroke="#7a6a5a" fill="#fdf6e6" sw={1.5} />)}
          {midHills.map((h, i) => <R key={`mh${i}`} d={h} stroke="#6a7a52" fill="#a8b682" sw={2} />)}
          {trees.map(({ trunk, canopy }, i) => (
            <g key={`tr${i}`}>
              <R d={trunk} stroke="#4a3018" sw={2.2} />
              <R d={canopy} stroke="#3a5018" fill="#7aa048" sw={2} />
            </g>
          ))}
          <R d={groundLine} stroke="#3a2818" sw={2.5} />
          <rect x={0} y={GROUND_Y + 1} width={VW} height={VH - GROUND_Y} fill="#d4b87c" />
          {grassTufts.map((tufts, i) => tufts.map((blade, j) => <R key={`gr${i}-${j}`} d={blade} stroke="#3a5018" sw={2.2} />))}
          {speedLines.map((sl, i) => <R key={`sp${i}`} d={sl} stroke="#9a7848" sw={1.4} />)}
          <R d={rArmD} stroke="#3a2010" sw={2.6} />
          <R d={rHandD} stroke="#3a2010" fill="#f4d4a8" sw={1.8} />
          <R d={shirtD} stroke="#3a2010" fill="#e87850" sw={2.2} />
          <R d={stripeD} stroke="#fdf6e6" sw={2.5} />
          <R d={shortsD} stroke="#3a2010" fill="#3a5a88" sw={2.2} />
          <R d={rLegD} stroke="#3a2010" sw={2.8} />
          <R d={rShoeD} stroke="#2a1808" fill="#2a1808" sw={2} />
          <R d={lLegD} stroke="#3a2010" sw={2.8} />
          <R d={lShoeD} stroke="#2a1808" fill="#2a1808" sw={2} />
          {dustD1 && <R d={dustD1} stroke="#a89070" sw={1.4} />}
          {dustD2 && <R d={dustD2} stroke="#a89070" sw={1.4} />}
          <R d={lArmD} stroke="#3a2010" sw={2.6} />
          <R d={headD} stroke="#3a2010" fill="#f4d4a8" sw={2.2} />
          <R d={hairD} stroke="#3a2010" sw={2.8} />
          {hair2D && <R d={hair2D} stroke="#3a2010" sw={2.2} />}
          <R d={eyeD} stroke="#2a1808" fill="#2a1808" sw={1.5} />
          {browD && <R d={browD} stroke="#2a1808" sw={1.8} />}
          <R d={mouthD} stroke="#2a1808" sw={1.8} />
          <R d={kiteD} stroke="#5a2818" fill="#e84548" sw={2.5} />
          <R d={kiteSpineV} stroke="#5a2818" sw={1.8} />
          <R d={kiteSpineH} stroke="#5a2818" sw={1.8} />
          {tailDs.map(({ line, ribbon }, i) => (
            <g key={`ts${i}`}>
              <R d={line} stroke="#e84548" sw={2.6} />
              {ribbon && <R d={ribbon} stroke="#f0c548" sw={2.2} />}
            </g>
          ))}
          <R d={stringD} stroke="#3a2818" sw={1.4} />
        </g>
      </svg>
    </div>
  );
}
