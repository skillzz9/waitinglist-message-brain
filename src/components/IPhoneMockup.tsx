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
  return (
    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column', ...SF }}>
      <div style={{ padding: '6px 16px 10px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #E8B55E 0%, #DC5A40 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={13} height={13} viewBox="0 0 32 32" fill="none">
              <path d="M16 3 L19.5 11 L28 9 L22 16 L26 25 L16 21 L6 25 L10 16 L4 9 L12.5 11 Z" fill="white" fillOpacity="0.92" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Fae</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 3 }}>Good morning ☀️</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Thursday · Jun 27</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7, scrollbarWidth: 'none' }}>
        <div style={{ background: '#1C1C1E', borderRadius: 12, padding: '9px 12px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Messages</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: '#E8B55E', lineHeight: 1 }}>12</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>processed today</span>
          </div>
        </div>
        <div style={{ background: '#1C1C1E', borderRadius: 12, padding: '9px 12px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Top Insight</div>
          <div style={{ fontSize: 12, color: 'white', lineHeight: 1.5, fontStyle: 'italic' }}>
            &ldquo;You&apos;ve mentioned the deadline 3 times — worth addressing today.&rdquo;
          </div>
        </div>
        <div style={{ background: '#1C1C1E', borderRadius: 12, padding: '9px 12px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Today&apos;s Themes</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['work', 'family', 'health'].map(t => (
              <span key={t} style={{ background: 'rgba(232,181,94,0.12)', color: '#E8B55E', border: '0.5px solid rgba(232,181,94,0.2)', borderRadius: 100, padding: '2px 9px', fontSize: 11 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ background: '#1C1C1E', borderRadius: 12, padding: '9px 12px' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Mood Signal</div>
          <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>Focused 🎯</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8, paddingTop: 5 }}>
        <div style={{ width: 105, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
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
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#0a0814', opacity: bgOpacity, pointerEvents: 'none' }} />

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
