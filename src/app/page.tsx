'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useCallback, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import IPhoneMockup from '@/components/IPhoneMockup';

const SideRays = dynamic(() => import('@/components/SideRays'), { ssr: false });

function FaeLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 3 L19.5 11 L28 9 L22 16 L26 25 L16 21 L6 25 L10 16 L4 9 L12.5 11 Z"
        fill="white"
        fillOpacity="0.92"
      />
      <circle cx="16" cy="16" r="3.5" fill="white" fillOpacity="0.25" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width={17} height={13} viewBox="0 0 17 13" fill="none">
      <rect y="0" width="17" height="2" rx="1" fill="white" />
      <rect y="5.5" width="13" height="2" rx="1" fill="white" />
      <rect y="11" width="17" height="2" rx="1" fill="white" />
    </svg>
  );
}

function GradientBorderButton({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`gradient-border-btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-[7px] text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-75 ${className}`}
    >
      {children}
    </button>
  );
}

function QuizCTA() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <GlassCard
        blur={18}
        borderColor="#ffffff"
        borderSize={1}
        borderRadius={100}
        borderOpacity={0.16}
        backgroundOpacity={0.07}
        onHoverScale={1.02}
        style={{
          padding: '13px 13px 13px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: 'white', whiteSpace: 'nowrap' }}>
          Take the 3-min quiz
        </span>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
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
        </div>
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

const LERP = 0.055; // fraction per frame — lower = slower/smoother

export default function Home() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Single persistent lerp loop — runs as long as there's something to animate
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
        {/* Navbar */}
        <nav className="flex items-center justify-between px-10 pt-6 pb-2">
          <FaeLogo size={22} />
          <GradientBorderButton className="!px-[10px] !py-[9px]">
            <HamburgerIcon />
          </GradientBorderButton>
        </nav>

        {/* Three-column layout */}
        <div className="flex-1 flex items-center px-10 gap-0">
          {/* Left — Headline, pulled close to the iPhone */}
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1
              style={{
                fontSize: 46,
                fontFamily: '"Exposure VAR", serif',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'white',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              AI for the
              <br />
              cultured
            </h1>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.48)',
                lineHeight: 1.65,
                maxWidth: 190,
                margin: 0,
              }}
            >
              Fae is a friend that has your back and understands you, starting with your FIPTI.
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
              width: 268,
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
