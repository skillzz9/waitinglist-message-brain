'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useCallback, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { SmoothBox } from '@/components/ui/SmoothBox';
import IPhoneMockup from '@/components/IPhoneMockup';
import { addToWaitlist } from '@/lib/firebase';

const SideRays = dynamic(() => import('@/components/SideRays'), { ssr: false });

type WaitlistStatus = 'idle' | 'loading' | 'success' | 'error' | 'duplicate' | 'invalid';

function WaitlistCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<WaitlistStatus>('idle');
  const disabled = status === 'loading' || status === 'success';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setStatus('loading');
    const result = await addToWaitlist(email);
    if (result.ok) setStatus('success');
    else setStatus(result.reason);
  };

  const statusText: Record<WaitlistStatus, string> = {
    idle: 'fully private',
    loading: 'joining…',
    success: "you're on the list",
    error: 'something went wrong — try again',
    duplicate: 'already on the list',
    invalid: 'enter a valid email',
  };

  const isError = status === 'error' || status === 'invalid' || status === 'duplicate';
  const isSuccess = status === 'success';
  const statusColor = isSuccess ? 'rgba(150,220,150,0.85)' : isError ? 'rgba(255,150,140,0.85)' : 'rgba(255,255,255,0.4)';

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <GlassCard
        radius={20}
        borderColor="rgba(255,255,255,0.16)"
        padding="p-0"
        className="flex items-center gap-[10px] pl-[18px] pr-[10px] py-[10px]"
      >
        <input
          type="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          placeholder="your@email.com"
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-[14px] placeholder:text-white/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className="appearance-none bg-transparent border-none p-0 disabled:cursor-not-allowed"
          style={{ cursor: disabled ? 'default' : 'pointer' }}
          aria-label="Join the waitlist"
        >
          <SmoothBox
            radius={12}
            showBorder
            borderColor="rgba(255,255,255,0.22)"
            background={isSuccess ? 'rgba(150,220,150,0.18)' : 'rgba(255,255,255,0.1)'}
            containerClassName="w-10 shrink-0"
            className="h-10 flex items-center justify-center"
          >
            {isSuccess ? (
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                <path d="M3 7.5l3.5 3.5L12 5" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : status === 'loading' ? (
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                <circle cx="7.5" cy="7.5" r="5.5" stroke="white" strokeOpacity="0.25" strokeWidth={1.8}/>
                <path d="M13 7.5a5.5 5.5 0 0 0-5.5-5.5" stroke="white" strokeWidth={1.8} strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                <path
                  d="M2.5 7.5h10M9 3.5l4 4-4 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </SmoothBox>
        </button>
      </GlassCard>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 10 }}>
        {status === 'idle' && (
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
        )}
        <span style={{ fontSize: 12, color: statusColor, letterSpacing: '0.01em' }}>
          {statusText[status]}
        </span>
      </div>
    </form>
  );
}

const LERP = 0.055;

export default function Home() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
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

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 8,
        y: (e.clientY / window.innerHeight - 0.5) * -6,
      };
      startLoop();
    };
    const onLeave = () => { targetRef.current = { x: 0, y: 0 }; startLoop(); };
    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [startLoop]);

  useEffect(() => {
    const onScroll = () => {
      const range = window.innerHeight * 1.5;
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / range)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headingStyle: React.CSSProperties = {
    fontSize: 46,
    fontFamily: '"Exposure VAR", serif',
    fontWeight: 400,
    lineHeight: 1.1,
    color: 'white',
    letterSpacing: '-0.01em',
    margin: 0,
  };
  const bodyStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'rgba(255,255,255,0.48)',
    lineHeight: 1.65,
    maxWidth: 190,
    margin: 0,
  };

  return (
    <>
      {/* Fixed background */}
      <div className="fixed inset-0" style={{ zIndex: 0, background: '#0d0804' }}>
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
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 82% 18%, rgba(232, 181, 94, 0.32) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 95% 5%,  rgba(220, 90, 64, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 60% 70%, rgba(232, 137, 90, 0.14) 0%, transparent 60%)
          `,
        }}
      />

      {/* Fixed phone — stays centred while everything scrolls */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          zIndex: 10,
          willChange: 'transform',
        }}
      >
        <IPhoneMockup switcherProgress={scrollProgress} />
      </div>

      {/* Scrollable content */}
      <div style={{ position: 'relative', zIndex: 5, minHeight: '300vh' }}>

        {/* Section 1 — hero copy (visible at scroll 0) */}
        <div
          className="flex items-center px-10"
          style={{ height: '100vh' }}
        >
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={headingStyle}>If AI had a<br />phone number,</h1>
            <p style={bodyStyle}>you'd already be texting it. Fae is the AI that lives in your messages.</p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 268, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WaitlistCTA />
          </div>
        </div>

        {/* 100vh spacer — phone animation plays here, no competing text */}
        <div style={{ height: '100vh' }} />

        {/* Section 2 — slides in exactly as daily summary fills the phone */}
        <div
          className="flex items-center px-10"
          style={{ height: '100vh' }}
        >
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h1 style={headingStyle}>Your day,<br />at a glance</h1>
            <p style={bodyStyle}>Fae processes all your messages and surfaces what matters — every morning.</p>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 268, flexShrink: 0 }} />
        </div>
      </div>
    </>
  );
}
