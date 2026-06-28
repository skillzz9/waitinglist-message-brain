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
  const [calendarProgress, setCalendarProgress] = useState(0);
  const [reverseProgress, setReverseProgress] = useState(0);
  const [notificationProgress, setNotificationProgress] = useState(0);
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
      const vh = window.innerHeight;
      const sy = window.scrollY;
      // Forward switch: iMessage → Kite (0 → 1.5vh)
      setScrollProgress(Math.min(1, Math.max(0, sy / (vh * 1.5))));
      // Calendar tab crossfade (3.5vh → 4.3vh)
      setCalendarProgress(Math.min(1, Math.max(0, (sy - vh * 3.5) / (vh * 0.8))));
      // Reverse switch: Kite → iMessage (4.4vh → 5.4vh, right after calendar)
      setReverseProgress(Math.min(1, Math.max(0, (sy - vh * 4.4) / vh)));
      // Notification banner slide-in (5.6vh → 6.0vh)
      setNotificationProgress(Math.min(1, Math.max(0, (sy - vh * 5.6) / (vh * 0.4))));
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

  // Text panel opacities — crossfade in sync with phone
  const s1opacity = Math.max(0, 1 - scrollProgress / 0.25);
  const s2opacity = Math.min(1, Math.max(0, (scrollProgress - 0.7) / 0.25)) * (1 - calendarProgress);
  const s3opacity = calendarProgress * (1 - reverseProgress);
  const s4opacity = reverseProgress;

  const textPanel: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    transition: 'none',
    pointerEvents: 'none',
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
      {/* Dusk overlay — blend of #8c7d84, #6f434c, #54607c, #815d5d, fades in on scroll */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          opacity: scrollProgress,
          background: `
            radial-gradient(ellipse 70% 50% at 88% 12%, rgba(84, 96, 124, 0.75) 0%, transparent 65%),
            radial-gradient(ellipse 65% 45% at 70% 35%, rgba(129, 93, 93, 0.55) 0%, transparent 70%),
            radial-gradient(ellipse 80% 55% at 20% 75%, rgba(111, 67, 76, 0.65) 0%, transparent 70%),
            radial-gradient(ellipse 90% 60% at 45% 50%, rgba(140, 125, 132, 0.45) 0%, transparent 75%)
          `,
        }}
      />

      {/* Fixed left text panel — crossfades between sections */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: 40,
        transform: 'translateY(-50%)',
        width: 200,
        zIndex: 8,
      }}>
        {/* Section 1 — iMessage: text Kite */}
        <div style={{ ...textPanel, opacity: s1opacity, pointerEvents: s1opacity > 0.05 ? 'auto' : 'none' }}>
          <h1 style={headingStyle}>Just text<br />Kite,</h1>
          <p style={bodyStyle}>Tell it about your day and how you feel. No apps to open — it lives right in your messages.</p>
        </div>
        {/* Section 2 — Dashboard: private score */}
        <div style={{ ...textPanel, opacity: s2opacity }}>
          <h1 style={headingStyle}>Your score,<br />privately.</h1>
          <p style={bodyStyle}>Kite stores everything you share privately and builds a daily score that&apos;s completely unique to you.</p>
        </div>
        {/* Section 3 — Calendar: growth */}
        <div style={{ ...textPanel, opacity: s3opacity }}>
          <h1 style={headingStyle}>Grow every<br />day,</h1>
          <p style={bodyStyle}>In the Kite app, see how your day went, revisit past days, and find ways to become a better version of yourself.</p>
        </div>
        {/* Section 4 — Reverse switch: reminders */}
        <div style={{ ...textPanel, opacity: s4opacity }}>
          <h1 style={headingStyle}>Nothing slips<br />through,</h1>
          <p style={bodyStyle}>Kite notices what matters and asks if you need a nudge — reminders delivered straight to iMessage.</p>
        </div>
      </div>

      {/* Fixed right panel — waitlist CTA (section 1 only) */}
      <div style={{
        position: 'fixed',
        top: '50%',
        right: 40,
        transform: 'translateY(-50%)',
        width: 268,
        zIndex: 8,
        opacity: s1opacity,
        pointerEvents: s1opacity > 0.05 ? 'auto' : 'none',
      }}>
        <WaitlistCTA />
      </div>

      {/* Fixed phone */}
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
        <IPhoneMockup
          switcherProgress={scrollProgress}
          calendarProgress={calendarProgress}
          reverseProgress={reverseProgress}
          notificationProgress={notificationProgress}
        />
      </div>

      {/* Scrollable spacer — just provides scroll height, no visible content */}
      <div style={{ position: 'relative', zIndex: 5, minHeight: '800vh' }} />
    </>
  );
}
