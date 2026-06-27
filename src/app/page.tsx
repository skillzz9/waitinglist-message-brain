'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useCallback, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { SmoothBox } from '@/components/ui/SmoothBox';
import IPhoneMockup from '@/components/IPhoneMockup';

const SideRays = dynamic(() => import('@/components/SideRays'), { ssr: false });

function QuizCTA() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <GlassCard
        radius={20}
        borderColor="rgba(255,255,255,0.16)"
        padding="p-0"
        className="flex items-center gap-[18px] pl-[22px] pr-[13px] py-[13px] cursor-pointer"
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: 'white', whiteSpace: 'nowrap' }}>
          Take the 3-min quiz
        </span>
        <SmoothBox
          radius={12}
          showBorder
          borderColor="rgba(255,255,255,0.22)"
          background="rgba(255,255,255,0.1)"
          containerClassName="shrink-0"
          className="w-10 h-10 flex items-center justify-center"
        >
          <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
            <path
              d="M2.5 7.5h10M9 3.5l4 4-4 4"
              stroke="white"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SmoothBox>
      </GlassCard>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 10 }}>
        <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.75" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          <path
            d="M4 6.5l2 2 3-3"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>
          fully private
        </span>
      </div>
    </div>
  );
}

const LERP = 0.055;

export default function Home() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const runLoop = useCallback(() => {
    const cx = currentRef.current.x + (targetRef.current.x - currentRef.current.x) * LERP;
    const cy = currentRef.current.y + (targetRef.current.y - currentRef.current.y) * LERP;
    currentRef.current = { x: cx, y: cy };
    setTilt({ x: cx, y: cy });

    const settled =
      Math.abs(cx - targetRef.current.x) < 0.005 &&
      Math.abs(cy - targetRef.current.y) < 0.005;

    if (settled) {
      currentRef.current = { ...targetRef.current };
      setTilt({ ...targetRef.current });
      rafRef.current = null;
    } else {
      rafRef.current = requestAnimationFrame(runLoop);
    }
  }, []);

  const startLoop = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(runLoop);
  }, [runLoop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    const nx = (clientX - left) / width - 0.5;
    const ny = (clientY - top) / height - 0.5;
    targetRef.current = { x: nx * 8, y: ny * -6 };
    startLoop();
  }, [startLoop]);

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
    startLoop();
  }, [startLoop]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <main
      className="relative h-screen w-screen overflow-hidden flex flex-col"
      style={{ background: '#0d0804' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* WebGL SideRays background */}
      <div className="absolute inset-0 z-0">
        <SideRays
          rayColor1="#E8B55E"
          rayColor2="#DC5A40"
          origin="top-right"
          speed={2.5}
          intensity={2.2}
          spread={2.2}
          tilt={0}
          saturation={1.8}
          blend={0.55}
          falloff={1.5}
          opacity={1}
        />
      </div>

      {/* Warm ambient overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 82% 18%, rgba(232, 181, 94, 0.32) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 95% 5%,  rgba(220, 90, 64, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 60% 70%, rgba(232, 137, 90, 0.14) 0%, transparent 60%)
          `,
        }}
      />

      {/* UI layer */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Three-column layout */}
        <div className="flex-1 flex items-center px-6 gap-0">
          {/* Left — Headline */}
          <div style={{ width: 170, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1
              style={{
                fontSize: 42,
                fontFamily: '"Exposure VAR", serif',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'white',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Journal with the help of message brain
            </h1>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.48)',
                lineHeight: 1.65,
                maxWidth: 170,
                margin: 0,
              }}
            >
              AI that helps you think things through.
            </p>
          </div>

          {/* Center — iPhone with subtle parallax tilt */}
          <div className="flex-1 flex items-center justify-center">
            <div
              style={{
                position: 'relative',
                transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                willChange: 'transform',
              }}
            >
              <IPhoneMockup />
            </div>
          </div>

          {/* Right — Quiz CTA */}
          <div
            style={{
              width: 230,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QuizCTA />
          </div>
        </div>
      </div>
    </main>
  );
}
