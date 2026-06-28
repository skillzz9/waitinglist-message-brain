'use client';

import { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';

const SKY    = "#f7eed5";
const DARK   = "#3a2010";
const MUTED  = "rgba(58,32,16,0.55)";
const BDR    = "rgba(58,32,16,0.13)";

const SUN_FILL   = "#f5b258";
const SUN_STROKE = "#c97a3a";
const SUN_CX = 110;
const SUN_CY = 110;
const SUN_R  = 78;

const RING_RADIUS = 108;

function opsTod(ops: Array<{ op: string; data: number[] }>): string {
  return ops.map(op => {
    if (op.op === 'move')     return `M ${op.data[0]} ${op.data[1]}`;
    if (op.op === 'lineTo')   return `L ${op.data[0]} ${op.data[1]}`;
    if (op.op === 'bcurveTo') return `C ${op.data[0]} ${op.data[1]} ${op.data[2]} ${op.data[3]} ${op.data[4]} ${op.data[5]}`;
    return '';
  }).filter(Boolean).join(' ');
}

function R({ d, stroke = 'none', fill = 'none', sw = 1 }: { d: any; stroke?: string; fill?: string; sw?: number }) {
  return (
    <>
      {d.sets.map((set: any, i: number) => {
        const pd = opsTod(set.ops);
        if (set.type === 'path')     return <path key={i} d={pd} stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />;
        if (set.type === 'fillPath') return <path key={i} d={pd} fill={fill} stroke="none" />;
        return <path key={i} d={pd} stroke={fill} strokeWidth={d.options?.fillWeight ?? 1} fill="none" strokeLinecap="round" />;
      })}
    </>
  );
}

export default function MeditateScreen({ opacity }: { opacity: number }) {
  const [boilSeed, setBoilSeed] = useState(1);
  const boilRef = useRef(1);

  useEffect(() => {
    if (opacity <= 0) return;
    const id = setInterval(() => {
      boilRef.current += 1;
      setBoilSeed(boilRef.current);
    }, 150);
    return () => clearInterval(id);
  }, [opacity]);

  const gen = rough.generator();

  const sunCircle = gen.circle(SUN_CX, SUN_CY, SUN_R * 2, {
    fill: SUN_FILL, fillStyle: "zigzag", fillWeight: 1.5, hachureGap: 7,
    roughness: 2.2, stroke: SUN_STROKE, strokeWidth: 2.5, seed: boilSeed,
  });

  const sunRays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return gen.line(
      SUN_CX + Math.cos(a) * (SUN_R + 8),  SUN_CY + Math.sin(a) * (SUN_R + 8),
      SUN_CX + Math.cos(a) * (SUN_R + 22), SUN_CY + Math.sin(a) * (SUN_R + 22),
      { stroke: SUN_STROKE, strokeWidth: 2.5, roughness: 2, seed: boilSeed + i + 1 },
    );
  });

  return (
    <div style={{
      position: 'absolute', top: -2, left: -1, right: -1, bottom: -1,
      backgroundColor: SKY,
      opacity,
      transform: `scale(${opacity > 0.01 ? 1 : 0.85})`,
      display: 'flex', flexDirection: 'column',
      zIndex: 20,
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      pointerEvents: opacity > 0.9 ? 'auto' : 'none',
      transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      padding: '26px 20px 24px 20px',
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Meditate</div>
          <div style={{ fontSize: 11, marginTop: 2, color: MUTED }}>2 min · 4-4-4-2 box breathing</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(58,32,16,0.08)', padding: '4px 8px', borderRadius: 12 }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: DARK }}>0</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
      </div>

      {/* Orb */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 220, transform: 'scale(0.85)' }}>
          <svg width={220} height={220} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle cx={110} cy={110} r={RING_RADIUS} stroke={SUN_STROKE} strokeWidth={3.5} fill="none" opacity={0.25} />
          </svg>
          <svg width={220} height={220} style={{ position: 'absolute', inset: 0 }}>
            <R d={sunCircle} stroke={SUN_STROKE} fill={SUN_FILL} sw={2.5} />
            {sunRays.map((ray, i) => <R key={i} d={ray} stroke={SUN_STROKE} fill={SUN_STROKE} sw={2.5} />)}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ fontSize: 17, fontWeight: 500, color: DARK, opacity: 0.9 }}>Ready</div>
            <div style={{ fontSize: 13, color: DARK, opacity: 0.7 }}>tap to begin</div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
        <div style={{ backgroundColor: '#2a1808', color: '#fff', textAlign: 'center', padding: '14px', borderRadius: 30, fontSize: 16, fontWeight: 600 }}>Begin</div>
        <div style={{ border: '1.5px solid rgba(58,32,16,0.3)', backgroundColor: 'rgba(255,255,255,0.25)', color: DARK, textAlign: 'center', padding: '12px', borderRadius: 30, fontSize: 14, fontWeight: 500 }}>Breathe ∞</div>
      </div>

    </div>
  );
}
