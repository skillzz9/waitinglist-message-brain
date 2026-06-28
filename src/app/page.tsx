'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { SmoothBox } from '@/components/ui/SmoothBox';
import IPhoneMockup from '@/components/IPhoneMockup';
import HandDrawnBackground from '@/components/HandDrawnBackground';
import { addToWaitlist } from '@/lib/firebase';

type WaitlistStatus = 'idle' | 'loading' | 'success' | 'error' | 'duplicate' | 'invalid';

function WaitlistCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<WaitlistStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const disabled = status === 'loading' || status === 'success';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setStatus('loading');
    setErrorMessage('');
    const result = await addToWaitlist(email);
    if (result.ok) setStatus('success');
    else {
      setStatus(result.reason);
      if ('message' in result && result.message) {
        setErrorMessage(result.message);
      }
    }
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
  const statusColor = isSuccess ? 'rgba(60,120,50,0.95)' : isError ? 'rgba(180,50,40,0.95)' : 'rgba(58,40,24,0.6)';

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          color: 'rgba(42,24,8,0.75)',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          paddingLeft: 10,
          visibility: 'hidden',
        }}
      >
        Join waitlist
      </span>
      <GlassCard
        radius={20}
        borderColor="rgba(255,255,255,0.7)"
        padding="p-0"
        className="flex items-center gap-[10px] pl-[18px] pr-[10px] py-[13px] lg:py-2.5"
      >
        <input
          type="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          placeholder="your@email.com"
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-[#2a1808] text-[16px] lg:text-[14px] placeholder:text-[#2a1808]/45 disabled:opacity-60"
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
            containerClassName="w-12 lg:w-10 shrink-0"
            className="h-12 lg:h-10 flex items-center justify-center"
          >
            {isSuccess ? (
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                <path d="M3 7.5l3.5 3.5L12 5" stroke="#2a1808" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : status === 'loading' ? (
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                <circle cx="7.5" cy="7.5" r="5.5" stroke="#2a1808" strokeOpacity="0.25" strokeWidth={1.8}/>
                <path d="M13 7.5a5.5 5.5 0 0 0-5.5-5.5" stroke="#2a1808" strokeWidth={1.8} strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
                <path
                  d="M2.5 7.5h10M9 3.5l4 4-4 4"
                  stroke="#2a1808"
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
            <circle cx="6.5" cy="6.5" r="5.75" stroke="rgba(58,40,24,0.4)" strokeWidth={1} />
            <path
              d="M4 6.5l2 2 3-3"
              stroke="rgba(58,40,24,0.7)"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span style={{ fontSize: 12, color: statusColor, letterSpacing: '0.01em' }}>
          {errorMessage || statusText[status]}
        </span>
      </div>
    </form>
  );
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [calendarProgress, setCalendarProgress] = useState(0);
  const [reverseProgress, setReverseProgress] = useState(0);
  const [notificationProgress, setNotificationProgress] = useState(0);
  const [section5Progress, setSection5Progress] = useState(0);
  const [meditationNotifProgress, setMeditationNotifProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      setWindowHeight(window.innerHeight);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Safe layout calculations for mobile to guarantee no overlap
  const isShortScreen = isMobile && windowHeight < 750;
  // Text panel height depends on text wrapping
  const textPanelHeight = isMobile && window.innerWidth < 400 ? (isShortScreen ? 140 : 170) : 125;
  
  // The phone's base position calculations
  const baseWaitlistBottomPx = (windowHeight * (isShortScreen ? 0.02 : 0.06)) + textPanelHeight + 5 + 58;
  const phoneTopEdge = baseWaitlistBottomPx + 10;
  const availablePhoneHeight = isMobile ? windowHeight - phoneTopEdge - 5 : 850;
  const basePhoneScale = isMobile 
    ? Math.max(0.65, Math.min(0.78, availablePhoneHeight / 850))
    : Math.min(1.0, windowHeight / 900);
    
  // The user requested scaling the phone size by 20% but anchoring its center
  const phoneScale = basePhoneScale * 1.2;
  const phoneTopPx = isMobile ? phoneTopEdge + (850 * basePhoneScale / 2) : 0;
  
  // The phone grew upwards by this amount:
  const phoneTopOverlapPx = isMobile ? (850 * basePhoneScale * 0.1) : 0;
  const newPhoneTopEdge = phoneTopEdge - phoneTopOverlapPx;
  
  // Place the waitlist box with a NEGATIVE margin relative to the phone's top edge
  // This pulls it down into the phone's bounding box (which has some transparent space)
  // to avoid it overlapping the top text panel and pushing the title off-screen!
  const waitlistTopPxAdjusted = isMobile ? newPhoneTopEdge - 58 + 40 : 0;
  
  // Ensure the text panel is pushed up high enough so it doesn't overlap the waitlist box,
  // but NEVER let it go off the screen (minimum 15px from top).
  const textPanelTopPx = isMobile ? Math.max(15, Math.min(windowHeight * (isShortScreen ? 0.02 : 0.06), waitlistTopPxAdjusted - textPanelHeight - 5)) : 0;

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      // Forward switch: iMessage → Kite (0 → 1.5vh)
      setScrollProgress(Math.min(1, Math.max(0, sy / (vh * 1.5))));
      // Calendar tab crossfade (2.2vh → 3.0vh)
      setCalendarProgress(Math.min(1, Math.max(0, (sy - vh * 2.2) / (vh * 0.8))));
      // Reverse switch: Kite → iMessage (3.1vh → 4.1vh, right after calendar)
      setReverseProgress(Math.min(1, Math.max(0, (sy - vh * 3.1) / vh)));
      // Notification banner slide-in (4.3vh → 4.7vh)
      setNotificationProgress(Math.min(1, Math.max(0, (sy - vh * 4.3) / (vh * 0.4))));
      // Section 5: meditation chat crossfade (5.2vh → 5.9vh)
      setSection5Progress(Math.min(1, Math.max(0, (sy - vh * 5.2) / (vh * 0.7))));
      // Kite App meditation notification (6.5vh → 6.9vh)
      setMeditationNotifProgress(Math.min(1, Math.max(0, (sy - vh * 6.5) / (vh * 0.4))));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headingStyle: React.CSSProperties = {
    fontSize: isMobile ? 36 : 46,
    fontFamily: '"Exposure VAR", serif',
    fontWeight: 400,
    lineHeight: 1.1,
    color: '#2a1808',
    letterSpacing: '-0.01em',
    margin: 0,
  };
  const bodyStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'rgba(58,40,24,0.7)',
    lineHeight: 1.65,
    maxWidth: isMobile ? 'none' : 190,
    margin: isMobile ? '0 auto' : 0,
  };

  // Text panel opacities — crossfade in sync with phone
  const s1opacity = Math.max(0, 1 - scrollProgress / 0.25);
  const s2opacity = Math.min(1, Math.max(0, (scrollProgress - 0.7) / 0.25)) * (1 - calendarProgress);
  const s3opacity = calendarProgress * (1 - reverseProgress);
  const s4opacity = reverseProgress * (1 - section5Progress);
  const s5opacity = section5Progress;

  const textPanel: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: isShortScreen ? 4 : 16,
    transition: 'none',
    pointerEvents: 'none',
  };

  return (
    <>
      {/* Hand-drawn scrolling background — zooms in to solid beige as user scrolls */}
      <HandDrawnBackground scrollProgress={scrollProgress} />

      {/* Layout container — centres and caps width on wide screens */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 1100,
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 8,
      }}>
        {/* Left text panel */}
        <div style={{
          position: 'absolute',
          pointerEvents: 'auto',
          ...(isMobile ? {
            top: `${textPanelTopPx}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '82vw',
            textAlign: 'center',
          } : {
            top: '30%',
            left: 40,
            transform: 'translateY(-50%)',
            width: 200,
          }),
          zIndex: 1,
        }}>
          {/* Section 1 — iMessage: text Kite */}
          <div style={{ ...textPanel, opacity: s1opacity, pointerEvents: s1opacity > 0.05 ? 'auto' : 'none' }}>
            <h1 style={headingStyle}>Just text<br />Kite,</h1>
            <p style={bodyStyle}>Tell it about your day like a diary, it&apos;s here to listen whenever you need it.</p>
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
          {/* Section 4 — Reverse switch: meditation */}
          <div style={{ ...textPanel, opacity: s4opacity }}>
            <h1 style={headingStyle}>Gives you what you need,</h1>
            <p style={bodyStyle}>Meditation app built in, set up based on how YOU feel.</p>
          </div>
          {/* Section 5 — Reminders */}
          <div style={{ ...textPanel, opacity: s5opacity }}>
            <h1 style={headingStyle}>Nothing slips<br />through,</h1>
            <p style={bodyStyle}>Kite notices what matters and asks if you need a nudge — reminders delivered straight to iMessage.</p>
          </div>
        </div>

        {/* Waitlist CTA — desktop: right side; mobile: above the phone */}
        <div style={{
          position: 'absolute',
          pointerEvents: 'auto',
          ...(isMobile ? {
            top: `${waitlistTopPxAdjusted}px`,
            left: '50%',
            transform: 'translateX(-50%) scale(0.75)',
            transformOrigin: 'top center',
            width: '82vw',
          } : {
            top: '50%',
            right: 40,
            transform: 'translateY(-50%)',
            width: 268,
          }),
          zIndex: 1,
        }}>
          <WaitlistCTA />
        </div>

        {/* Phone */}
        <div style={{
          position: 'absolute',
          top: isMobile ? `${phoneTopPx}px` : '50%',
          left: '50%',
          transform: isMobile
            ? `translate(-50%, -50%) scale(${phoneScale})`
            : `translate(-50%, -50%) scale(${phoneScale})`,
          zIndex: 10,
          willChange: 'transform',
          pointerEvents: 'auto',
        }}>
          <IPhoneMockup
            switcherProgress={scrollProgress}
            calendarProgress={calendarProgress}
            reverseProgress={reverseProgress}
            notificationProgress={notificationProgress}
            section5Progress={section5Progress}
            meditationNotifProgress={meditationNotifProgress}
          />
        </div>
      </div>

      {/* Scrollable spacer — just provides scroll height, no visible content */}
      <div style={{ position: 'relative', zIndex: 5, minHeight: '850vh' }} />
    </>
  );
}
