'use client';

import { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

const W = 900;
const H = 520;
const GROUND_Y = 410;
const MAX_SCROLL_SPEED = 240;
const MAX_RUN_FREQ = 11;
const BOIL_MS = 100;

const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function TestPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [energy, setEnergy] = useState(100);
  const energyRef = useRef(energy);
  energyRef.current = energy;

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const rc = rough.svg(svg);

    let frame = 0;
    const start = performance.now();
    let lastBoil = start;
    let boilTick = 1;
    let scrolledT = 0;       // animation clock that only advances when energy > 0
    let lastT = 0;

    const draw = () => {
      const now = performance.now();
      const t = (now - start) / 1000;
      const dt = t - lastT;
      lastT = t;

      const f = clamp(energyRef.current / 100, 0, 1);
      // Scrolled time accumulates faster the more energy we have (gentle ease curve)
      scrolledT += dt * Math.pow(f, 1.2);

      if (now - lastBoil > BOIL_MS) {
        boilTick = (boilTick % 6) + 1;
        lastBoil = now;
      }

      renderScene(svg, rc, t, scrolledT, boilTick, f);
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-10 gap-6"
      style={{ background: 'linear-gradient(180deg, #f5e8cf 0%, #ecd7ad 55%, #d9c290 100%)' }}
    >
      <div className="w-full max-w-[1100px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          style={{ filter: 'drop-shadow(0 6px 24px rgba(80, 50, 20, 0.18))' }}
        />
      </div>
      <div className="w-full max-w-[600px] flex items-center gap-4" style={{ color: '#3a2818' }}>
        <span className="text-sm font-semibold tabular-nums" style={{ minWidth: 96 }}>
          Energy {energy}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={energy}
          onChange={e => setEnergy(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: '#c4663a' }}
        />
      </div>
    </main>
  );
}

function renderScene(
  rootSvg: SVGSVGElement,
  rc: RoughSVG,
  t: number,
  scrolledT: number,
  boilTick: number,
  f: number,
) {
  while (rootSvg.firstChild) rootSvg.removeChild(rootSvg.firstChild);

  // Mirror so he runs LEFT → RIGHT visually
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.setAttribute('transform', `translate(${W}, 0) scale(-1, 1)`);
  rootSvg.appendChild(svg);

  const cycle = scrolledT * MAX_RUN_FREQ;
  const phase = Math.sin(cycle);
  const phaseOpp = Math.sin(cycle + Math.PI);
  const bob = Math.abs(Math.cos(cycle)) * 6 * f;
  const seed = (offset = 0) => ((boilTick + offset) % 6) + 1;

  // ─── Sky ───────────────────────────────────────────────────
  svg.appendChild(rc.rectangle(0, 0, W, GROUND_Y - 3, {
    stroke: 'none', fill: '#f7eed5', fillStyle: 'solid', roughness: 0,
  }));

  // ─── Sun ───────────────────────────────────────────────────
  const sunX = 180, sunY = 110;
  svg.appendChild(rc.circle(sunX, sunY, 100, {
    stroke: '#c97a3a', strokeWidth: 2.5,
    fill: '#f5b258', fillStyle: 'zigzag', fillWeight: 1.5, hachureGap: 6,
    roughness: 2.2, seed: seed(0),
  }));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    svg.appendChild(rc.line(
      sunX + Math.cos(a) * 58, sunY + Math.sin(a) * 58,
      sunX + Math.cos(a) * 78, sunY + Math.sin(a) * 78,
      { stroke: '#c97a3a', strokeWidth: 2.5, roughness: 2, seed: seed(i + 1) },
    ));
  }

  // ─── Far hills (scrolledT — pause when energy=0) ───────────
  const farScroll = (scrolledT * MAX_SCROLL_SPEED * 0.18) % 320;
  for (let i = -1; i < 5; i++) {
    const x = i * 320 + farScroll;
    svg.appendChild(rc.path(
      `M ${x} ${GROUND_Y} Q ${x + 160} ${GROUND_Y - 95} ${x + 320} ${GROUND_Y}`,
      { stroke: '#9aa888', strokeWidth: 2, roughness: 2.2, seed: seed(i + 10) },
    ));
  }

  // ─── Clouds (always drift gently, even when standing still) ─
  const cloudScroll = (scrolledT * MAX_SCROLL_SPEED * 0.12 + t * 6) % 1300;
  const clouds: Array<[number, number, number, number]> = [
    [120, 70, 110, 30], [420, 95, 140, 38],
    [720, 60, 95, 28], [1010, 100, 125, 34],
  ];
  clouds.forEach(([bx, y, w, h], i) => {
    const x = ((bx + cloudScroll) % 1300 + 1300) % 1300 - 200;
    svg.appendChild(rc.ellipse(x, y, w, h, {
      stroke: '#7a6a5a', strokeWidth: 1.5,
      fill: '#fdf6e6', fillStyle: 'solid',
      roughness: 1.8, seed: seed(i + 20),
    }));
  });

  // ─── Mid hills ─────────────────────────────────────────────
  const midScroll = (scrolledT * MAX_SCROLL_SPEED * 0.4) % 270;
  for (let i = -1; i < 6; i++) {
    const x = i * 270 + midScroll;
    svg.appendChild(rc.path(
      `M ${x} ${GROUND_Y} Q ${x + 135} ${GROUND_Y - 60} ${x + 270} ${GROUND_Y}`,
      {
        stroke: '#6a7a52', strokeWidth: 2,
        fill: '#a8b682', fillStyle: 'hachure', fillWeight: 1, hachureGap: 8,
        roughness: 1.8, seed: seed(i + 30),
      },
    ));
  }

  // ─── Background trees ──────────────────────────────────────
  const treeScroll = (scrolledT * MAX_SCROLL_SPEED * 0.55) % 200;
  for (let i = -1; i < 7; i++) {
    const x = i * 200 + treeScroll + 50;
    svg.appendChild(rc.line(x, GROUND_Y, x, GROUND_Y - 65, {
      stroke: '#4a3018', strokeWidth: 2.2, roughness: 1.5, seed: seed(i + 40),
    }));
    svg.appendChild(rc.circle(x, GROUND_Y - 80, 48, {
      stroke: '#3a5018', strokeWidth: 2,
      fill: '#7aa048', fillStyle: 'cross-hatch', fillWeight: 1, hachureGap: 7,
      roughness: 2, seed: seed(i + 50),
    }));
  }

  // ─── Ground line ───────────────────────────────────────────
  svg.appendChild(rc.line(0, GROUND_Y, W, GROUND_Y, {
    stroke: '#3a2818', strokeWidth: 2.5, roughness: 1.5, seed: seed(60),
  }));

  // ─── Grass tufts ───────────────────────────────────────────
  const grassScroll = (scrolledT * MAX_SCROLL_SPEED) % 55;
  for (let i = -1; i < 19; i++) {
    const x = i * 55 + grassScroll;
    const h = 7 + ((i * 11) % 9);
    svg.appendChild(rc.line(x, GROUND_Y, x + 3, GROUND_Y - h, {
      stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: seed(i + 70),
    }));
    svg.appendChild(rc.line(x + 8, GROUND_Y, x + 6, GROUND_Y - h + 2, {
      stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: seed(i + 80),
    }));
    svg.appendChild(rc.line(x + 14, GROUND_Y, x + 12, GROUND_Y - h - 1, {
      stroke: '#3a5018', strokeWidth: 2.2, roughness: 2.5, seed: seed(i + 90),
    }));
  }

  // ─── Speed lines (only kick in past mid-energy) ────────────
  if (f > 0.45) {
    const intensity = (f - 0.45) / 0.55;     // 0 → 1 from f=0.45 → 1.0
    const lineCount = Math.round(2 + intensity * 4);
    for (let i = 0; i < lineCount; i++) {
      const y = 240 + i * 30 + Math.sin(scrolledT * 8 + i) * 4;
      const len = (60 + ((i * 13) % 25)) * (0.4 + intensity * 0.6);
      const offset = ((scrolledT * MAX_SCROLL_SPEED * 1.3) + i * 90) % 320;
      const sx = 480 + offset - 60;
      svg.appendChild(rc.line(sx, y, sx + len, y, {
        stroke: '#9a7848', strokeWidth: 1.4 * (0.5 + intensity * 0.5),
        roughness: 1, seed: seed(i + 95),
      }));
    }
  }

  // ─── Kid (sprint-cycle scales with energy) ─────────────────
  const kx = 360;
  const ky = GROUND_Y;
  const leanX = lerp(0, -2, f);  // slight forward lean only when running hard

  // Head
  const headY = ky - 110 - bob;
  svg.appendChild(rc.circle(kx + leanX, headY, 36, {
    stroke: '#3a2010', strokeWidth: 2.2,
    fill: '#f4d4a8', fillStyle: 'solid',
    roughness: 1.5, seed: seed(0),
  }));

  // Hair — windswept blows back harder with energy
  const hairBlow = lerp(2, 22, f);   // tip x-offset
  svg.appendChild(rc.path(
    `M ${kx + leanX - 18} ${headY - 10} Q ${kx + leanX} ${headY - 26} ${kx + leanX + 16} ${headY - 13} L ${kx + leanX + hairBlow} ${headY - 4}`,
    { stroke: '#3a2010', strokeWidth: 2.8, roughness: 1.8, seed: seed(1) },
  ));
  if (f > 0.5) {
    svg.appendChild(rc.line(kx + leanX + 18, headY - 6, kx + leanX + 14 + hairBlow, headY - 2, {
      stroke: '#3a2010', strokeWidth: 2.2, roughness: 2, seed: seed(40),
    }));
  }

  // Eye — droops a bit when sad
  const eyeY = headY - lerp(-2, 2, f);
  svg.appendChild(rc.circle(kx + leanX - 8, eyeY, 3, {
    stroke: '#2a1808', strokeWidth: 1.5, fill: '#2a1808', fillStyle: 'solid',
    roughness: 0.8, seed: seed(2),
  }));

  // Sad eyebrow (only visible at low energy)
  if (f < 0.4) {
    const browIntensity = 1 - f / 0.4;
    svg.appendChild(rc.line(
      kx + leanX - 12, headY - 8,
      kx + leanX - 4, headY - 6 + browIntensity * 2,
      { stroke: '#2a1808', strokeWidth: 1.8, roughness: 1, seed: seed(41) },
    ));
  }

  // Mouth — frown → flat → grin as f goes 0 → 0.5 → 1
  const mouthCurve = lerp(-6, 6, f);  // control-point Y offset
  svg.appendChild(rc.path(
    `M ${kx + leanX - 16} ${headY + 8} Q ${kx + leanX - 10} ${headY + 8 + mouthCurve} ${kx + leanX - 4} ${headY + 8}`,
    { stroke: '#2a1808', strokeWidth: 1.8, roughness: 1, seed: seed(3) },
  ));

  // Shirt
  const neckY = ky - 92 - bob;
  const hipY = ky - 50 - bob;
  svg.appendChild(rc.path(
    `M ${kx + leanX - 16} ${neckY} L ${kx + leanX + 16} ${neckY} L ${kx + 14} ${hipY} L ${kx - 14} ${hipY} Z`,
    {
      stroke: '#3a2010', strokeWidth: 2.2,
      fill: '#e87850', fillStyle: 'zigzag', fillWeight: 1, hachureGap: 6,
      roughness: 1.8, seed: seed(4),
    },
  ));
  svg.appendChild(rc.line(kx + leanX - 14, neckY + 18, kx + leanX + 14, neckY + 18, {
    stroke: '#fdf6e6', strokeWidth: 2.5, roughness: 1.5, seed: seed(5),
  }));

  // Shorts
  svg.appendChild(rc.path(
    `M ${kx - 14} ${hipY} L ${kx + 14} ${hipY} L ${kx + 13} ${hipY + 14} L ${kx - 13} ${hipY + 14} Z`,
    {
      stroke: '#3a2010', strokeWidth: 2.2,
      fill: '#3a5a88', fillStyle: 'hachure', fillWeight: 1, hachureGap: 5,
      roughness: 1.8, seed: seed(6),
    },
  ));

  // Back arm — interpolates from hanging down (low energy) to raised back-up (high)
  const rShoulder = [kx + 14, neckY + 6] as const;
  const rArmRest = Math.PI / 2 + 0.15;   // hangs straight down + slight back
  const rArmRaised = -Math.PI / 4;       // back-up to kite
  const rArmAngle = lerp(rArmRest, rArmRaised, f) + phase * 0.22 * f;
  const rArmLen = 34;
  const rHandX = rShoulder[0] + Math.cos(rArmAngle) * rArmLen;
  const rHandY = rShoulder[1] + Math.sin(rArmAngle) * rArmLen;
  svg.appendChild(rc.line(rShoulder[0], rShoulder[1], rHandX, rHandY, {
    stroke: '#3a2010', strokeWidth: 2.6, roughness: 1.5, seed: seed(7),
  }));
  svg.appendChild(rc.circle(rHandX, rHandY, 8, {
    stroke: '#3a2010', strokeWidth: 1.8,
    fill: '#f4d4a8', fillStyle: 'solid', roughness: 1.2, seed: seed(8),
  }));

  // Front arm — pumping (swing scales with f)
  const lShoulder = [kx - 14, neckY + 6] as const;
  const lArmAngle = Math.PI / 2 + phaseOpp * 1.25 * f;
  const lArmLen = 30;
  const lArmEndX = lShoulder[0] + Math.cos(lArmAngle) * lArmLen;
  const lArmEndY = lShoulder[1] + Math.sin(lArmAngle) * lArmLen;
  svg.appendChild(rc.line(lShoulder[0], lShoulder[1], lArmEndX, lArmEndY, {
    stroke: '#3a2010', strokeWidth: 2.6, roughness: 1.5, seed: seed(9),
  }));

  // Legs — stride scales with f (0 = both straight down, 1 = wide sprint)
  const legAngle = phase * lerp(0, 1.15, f);
  const legLen = 44;
  const hipsX = kx;
  const leftLegEnd = [
    hipsX + Math.sin(legAngle) * legLen,
    hipY + 14 + Math.cos(legAngle) * legLen,
  ] as const;
  const rightLegEnd = [
    hipsX + Math.sin(-legAngle) * legLen,
    hipY + 14 + Math.cos(-legAngle) * legLen,
  ] as const;
  svg.appendChild(rc.line(hipsX, hipY + 14, rightLegEnd[0], rightLegEnd[1], {
    stroke: '#3a2010', strokeWidth: 2.8, roughness: 1.5, seed: seed(10),
  }));
  svg.appendChild(rc.ellipse(rightLegEnd[0] - 5, rightLegEnd[1], 18, 7, {
    stroke: '#2a1808', strokeWidth: 2,
    fill: '#2a1808', fillStyle: 'solid', roughness: 1.5, seed: seed(11),
  }));
  svg.appendChild(rc.line(hipsX, hipY + 14, leftLegEnd[0], leftLegEnd[1], {
    stroke: '#3a2010', strokeWidth: 2.8, roughness: 1.5, seed: seed(12),
  }));
  svg.appendChild(rc.ellipse(leftLegEnd[0] - 5, leftLegEnd[1], 18, 7, {
    stroke: '#2a1808', strokeWidth: 2,
    fill: '#2a1808', fillStyle: 'solid', roughness: 1.5, seed: seed(13),
  }));

  // Dust puff (only at high energy, on the push-off frame)
  if (f > 0.7 && phase < -0.5) {
    const intensity = (f - 0.7) / 0.3;
    const dustX = rightLegEnd[0] + 12;
    const dustY = rightLegEnd[1] + 4;
    svg.appendChild(rc.ellipse(dustX, dustY, 24 * intensity, 9 * intensity, {
      stroke: '#a89070', strokeWidth: 1.4, roughness: 2.5, seed: seed(100),
    }));
    svg.appendChild(rc.ellipse(dustX + 14, dustY - 4, 18 * intensity, 7 * intensity, {
      stroke: '#a89070', strokeWidth: 1.4, roughness: 2.5, seed: seed(101),
    }));
  }

  // ─── Kite — position interpolates from ground to sky ──────
  const kiteFlyingBaseX = 660;
  const kiteFlyingBaseY = 130;
  const kiteGroundX = kx + 80;       // just behind the kid on the ground
  const kiteGroundY = GROUND_Y - 22;

  const kiteCX = lerp(kiteGroundX, kiteFlyingBaseX, f) + Math.sin(t * 1.4) * 30 * f;
  const kiteCY = lerp(kiteGroundY, kiteFlyingBaseY, f) + Math.cos(t * 1.0) * 22 * f - bob * 0.4;
  const kiteFlyingRot = -0.3 + Math.sin(t * 1.6) * 0.35;
  const kiteGroundRot = Math.PI / 2 - 0.18;  // mostly lying flat
  const kiteRot = lerp(kiteGroundRot, kiteFlyingRot, f);
  const cos = Math.cos(kiteRot), sin = Math.sin(kiteRot);

  const diamond: Array<[number, number]> = [
    [0, -36], [26, 0], [0, 36], [-26, 0],
  ].map(([x, y]) => [
    kiteCX + x * cos - y * sin,
    kiteCY + x * sin + y * cos,
  ]);

  svg.appendChild(rc.polygon(diamond, {
    stroke: '#5a2818', strokeWidth: 2.5,
    fill: '#e84548', fillStyle: 'hachure', fillWeight: 1.5, hachureGap: 5,
    roughness: 2, seed: seed(14),
  }));
  svg.appendChild(rc.line(diamond[0][0], diamond[0][1], diamond[2][0], diamond[2][1], {
    stroke: '#5a2818', strokeWidth: 1.8, roughness: 1.2, seed: seed(15),
  }));
  svg.appendChild(rc.line(diamond[1][0], diamond[1][1], diamond[3][0], diamond[3][1], {
    stroke: '#5a2818', strokeWidth: 1.8, roughness: 1.2, seed: seed(16),
  }));

  // Kite tail — direction & flutter scale with f
  const tailDx = lerp(-14, 12, f);             // limp-left when on ground, right when flying
  const tailDy = lerp(0, 10, f);
  const tailWaveAmp = lerp(2, 22, f);
  const tailWaveFreq = t * lerp(2, 14, f);

  let tx = diamond[2][0], ty = diamond[2][1];
  for (let i = 1; i <= 8; i++) {
    const wave = Math.sin(tailWaveFreq + i * 0.9) * tailWaveAmp;
    const nx = tx + tailDx + wave * 0.6;
    const ny = ty + tailDy - Math.cos(tailWaveFreq + i * 0.9) * 3 * f;
    svg.appendChild(rc.line(tx, ty, nx, ny, {
      stroke: '#e84548', strokeWidth: 2.6, roughness: 2.2, seed: seed(i + 17),
    }));
    if (i % 2 === 1) {
      svg.appendChild(rc.line(nx - 6, ny - 4, nx + 8, ny - 2, {
        stroke: '#f0c548', strokeWidth: 2.2, roughness: 2, seed: seed(i + 30),
      }));
    }
    tx = nx; ty = ny;
  }

  // ─── Kite string ──────────────────────────────────────────
  const midX = (rHandX + kiteCX) / 2 + Math.sin(t * 3) * 8 * f;
  const midY = (rHandY + kiteCY) / 2 + lerp(4, 18, f);
  svg.appendChild(rc.path(
    `M ${rHandX} ${rHandY} Q ${midX} ${midY} ${kiteCX} ${kiteCY}`,
    { stroke: '#3a2818', strokeWidth: 1.4, roughness: 0.6, seed: seed(50) },
  ));
}
