'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import StatusBar      from './iphoneParts/StatusBar';
import ChatHeader     from './iphoneParts/ChatHeader';
import MessageBubbles from './iphoneParts/MessageBubbles';
import InputBar       from './iphoneParts/InputBar';
import Keyboard       from './iphoneParts/Keyboard';
import type { SendPhase } from './iphoneParts/types';

function makeOneShot(src: string, volume = 0.7) {
  if (typeof window === 'undefined') return () => {};
  const audio = new Audio(src);
  audio.preload = 'auto';
  return () => {
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume;
    clone.play().catch(() => {});
  };
}

function makeTickPlayer(src: string) {
  if (typeof window === 'undefined') return () => {};
  const audio = new Audio(src);
  audio.preload = 'auto';
  return () => {
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.55;
    clone.play().catch(() => {});
  };
}

const SF: React.CSSProperties = {
  fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
};

/* ─── daily summary screen ───────────────────── */
function DailySummaryScreen() {
  const pills = [
    { icon: '🌙', label: 'Mood',     score: 72 },
    { icon: '🌱', label: 'Growth',   score: 85 },
    { icon: '💬', label: 'Activity', score: 91 },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', ...SF,
      background: 'linear-gradient(175deg, #1a1f3c 0%, #2d2040 30%, #6b3a2a 62%, #c47a3a 82%, #e8a84a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* atmospheric haze layer */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 50% at 50% 90%, rgba(240,200,120,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* content */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 16px 0' }}>
        {/* greeting */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>☀️ Good Morning</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 18 }}>How are you doing?</div>

        {/* score */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', marginBottom: 2 }}>Daily Score</div>
          <div style={{ fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.03em' }}>84</div>
        </div>

        {/* pill sub-scores */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
          {pills.map(p => (
            <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(232,181,94,0.45)',
                borderRadius: 100, padding: '5px 10px',
              }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#E8B55E' }}>{p.score}</span>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* journal card */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          border: '0.5px solid rgba(255,255,255,0.2)',
          borderRadius: 16, padding: '12px 14px', flex: 1,
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Today&apos;s Journal</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 8 }}>
            <svg width={22} height={18} viewBox="0 0 24 20" fill="none">
              <path d="M2 2h9v16H2zM13 2h9v16h-9z" stroke="rgba(232,181,94,0.5)" strokeWidth={1.5} strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(232,181,94,0.8)' }}>No entry yet today</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.4 }}>Keep chatting — your journal{'\n'}generates automatically</div>
          </div>
        </div>
      </div>

      {/* tab bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        background: 'rgba(10,8,20,0.7)', backdropFilter: 'blur(16px)',
        borderTop: '0.5px solid rgba(255,255,255,0.1)',
        padding: '10px 0 12px', flexShrink: 0,
      }}>
        {[
          { icon: '⊞', label: 'Dashboard', active: true },
          { icon: '📅', label: 'Calendar',  active: false },
          { icon: '⚙', label: 'Settings',  active: false },
        ].map(t => (
          <div key={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 36, height: 28, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.active ? 'rgba(232,181,94,0.2)' : 'transparent',
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
            </div>
            <span style={{ fontSize: 9, color: t.active ? '#E8B55E' : 'rgba(255,255,255,0.4)', fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── root ───────────────────────────────────── */
export default function IPhoneMockup({ switcherProgress = 0 }: { switcherProgress?: number }) {
  const [pressedKey,   setPressedKey]   = useState<string | null>(null);
  const [typedText,    setTypedText]    = useState('');
  const [welcomePhase, setWelcomePhase] = useState<'typing' | 'shown'>('typing');
  const [userMessage,  setUserMessage]  = useState<string | null>(null);
  const [sendPhase,    setSendPhase]    = useState<SendPhase>('none');

  // Scroll-driven app switcher animation
  const p = switcherProgress;
  const N = (v: number, lo: number, hi: number) => Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  const enterT  = N(p, 0, 0.35);
  const swipeT  = N(p, 0.35, 0.65);
  const launchT = N(p, 0.65, 1.0);

  // iMessage: zooms out to card size, then swipes right to reveal Fae behind it
  const imsgScale   = 1 - enterT * 0.28;
  const imsgX       = swipeT * 280;
  const imsgOpacity = 1 - Math.max(0, (swipeT - 0.7) / 0.3);
  const imsgRadius  = enterT * 14;

  // Fae: sits centered directly behind iMessage, invisible until animation starts
  const faeX       = 0;
  const faeOpacity = enterT;
  const faeScale   = 0.68 + launchT * 0.32;
  const faeRadius  = (1 - launchT) * 14;
  const bgOpacity  = Math.min(enterT * 1.5, 1);

  // Preloaded tick sound players
  const tickHighRef   = useRef<(() => void) | null>(null);
  const tickLowRef    = useRef<(() => void) | null>(null);
  const msgSendRef    = useRef<(() => void) | null>(null);
  const msgReceiveRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    tickHighRef.current   = makeTickPlayer('/tick-high.m4a');
    tickLowRef.current    = makeTickPlayer('/tick-low.m4a');
    msgSendRef.current    = makeOneShot('/msg-send.m4a', 0.75);
    msgReceiveRef.current = makeOneShot('/msg-receive.m4a', 0.75);
  }, []);

  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef       = useRef('');
  const hasSentRef    = useRef(false);
  const convTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { textRef.current = typedText; }, [typedText]);

  useEffect(() => {
    const t = setTimeout(() => setWelcomePhase('shown'), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => { convTimersRef.current.forEach(clearTimeout); }, []);

  const triggerConversation = useCallback((msg: string) => {
    msgSendRef.current?.();
    setUserMessage(msg);
    setSendPhase('none');
    const t1 = setTimeout(() => setSendPhase('read'),       900);
    const t2 = setTimeout(() => setSendPhase('fae-typing'), 1900);
    const t3 = setTimeout(() => {
      setSendPhase('fae-replied');
      msgReceiveRef.current?.();
    }, 3800);
    convTimersRef.current = [t1, t2, t3];
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when the user is typing in a real input on the page
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        return;
      }

      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      const k = e.key;

      if (k === 'Enter') {
        e.preventDefault();
        setPressedKey('return');
        tickLowRef.current?.();
        const txt = textRef.current.trim();
        if (txt && !hasSentRef.current) {
          hasSentRef.current = true;
          setTypedText('');
          triggerConversation(txt);
        } else {
          setTypedText('');
        }
      } else if (/^[a-zA-Z]$/.test(k)) {
        const lower = k.toLowerCase();
        setPressedKey(lower);
        tickHighRef.current?.();
        setTypedText(t => t + lower);
      } else if (k === 'Backspace') {
        e.preventDefault();
        setPressedKey('backspace');
        tickLowRef.current?.();
        setTypedText(t => t.slice(0, -1));
      } else if (k === ' ') {
        e.preventDefault();
        setPressedKey('space');
        tickLowRef.current?.();
        setTypedText(t => t + ' ');
      } else if (k.length === 1) {
        tickHighRef.current?.();
        setTypedText(t => t + k);
      }

      pressTimerRef.current = setTimeout(() => setPressedKey(null), 120);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, [triggerConversation]);

  return (
    <div className="w-[273px] h-[557px] bg-[#111] rounded-[46px] border-[8px] border-[#2a2a2a] phone-shell overflow-hidden flex flex-col relative shrink-0">
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-black rounded-[10px] z-20"/>
      {/* Permanent status bar — always visible, never animated */}
      <div className="relative z-20 bg-black">
        <StatusBar />
      </div>
      <div className="flex-1 relative overflow-hidden">

        {/* Switcher background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: bgOpacity,
          pointerEvents: 'none',
        }} />

        {/* iMessage card */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: '#000',
          transform: `translateX(${imsgX}px) scale(${imsgScale})`,
          transformOrigin: 'center center',
          borderRadius: imsgRadius,
          overflow: 'hidden',
          opacity: imsgOpacity,
          display: 'flex', flexDirection: 'column',
          ...(enterT > 0 ? { boxShadow: '0 6px 28px rgba(0,0,0,0.8)' } : {}),
        }}>
          <ChatHeader />
          <MessageBubbles
            welcomePhase={welcomePhase}
            userMessage={userMessage}
            sendPhase={sendPhase}
          />
          <InputBar text={typedText} />
          <Keyboard pressedKey={pressedKey} />
        </div>

        {/* Fae daily summary card */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          transform: `translateX(${faeX}px) scale(${faeScale})`,
          transformOrigin: 'center center',
          borderRadius: faeRadius,
          overflow: 'hidden',
          opacity: faeOpacity,
          ...(launchT < 0.95 ? { boxShadow: '0 6px 28px rgba(0,0,0,0.8)' } : {}),
        }}>
          <DailySummaryScreen />
        </div>
      </div>
    </div>
  );
}
