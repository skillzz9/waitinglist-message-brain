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

/* ─── shared tab bar ────────────────────────── */
function TabBar({ active }: { active: 'dashboard' | 'calendar' }) {
  const tabs = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'calendar',  icon: '📅', label: 'Calendar'  },
    { id: 'settings',  icon: '⚙',  label: 'Settings'  },
  ] as const;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      background: 'rgba(10,8,20,0.75)', backdropFilter: 'blur(16px)',
      borderTop: '0.5px solid rgba(255,255,255,0.1)',
      padding: '10px 0 12px', flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 36, height: 28, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'rgba(232,181,94,0.2)' : 'transparent',
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
            </div>
            <span style={{ fontSize: 9, color: isActive ? '#E8B55E' : 'rgba(255,255,255,0.4)', fontWeight: isActive ? 600 : 400 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── dashboard screen ───────────────────────── */
function DashboardScreen() {
  const pills = [
    { icon: '🌙', label: 'Mood',     score: 72 },
    { icon: '🌱', label: 'Growth',   score: 85 },
    { icon: '💬', label: 'Activity', score: 91 },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...SF,
      background: 'linear-gradient(175deg, #1a1f3c 0%, #2d2040 30%, #6b3a2a 62%, #c47a3a 82%, #e8a84a 100%)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 50% at 50% 90%, rgba(240,200,120,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 16px 0' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>☀️ Good Morning</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 18 }}>How are you doing?</div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', marginBottom: 2 }}>Daily Score</div>
          <div style={{ fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.03em' }}>84</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
          {pills.map(p => (
            <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(232,181,94,0.45)', borderRadius: 100, padding: '5px 10px' }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#E8B55E' }}>{p.score}</span>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{p.label}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '12px 14px', flex: 1 }}>
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
      <TabBar active="dashboard" />
    </div>
  );
}

/* ─── calendar screen ────────────────────────── */
function CalendarScreen() {
  const days = ['S','M','T','W','T','F','S'];
  const weeks = [
    [null,null,1,2,3,4,5],
    [6,7,8,9,10,11,12],
    [13,14,15,16,17,18,19],
    [20,21,22,23,24,25,26],
    [27,28,29,30,null,null,null],
  ];
  const today = 27;
  const events = [
    { day: 27, label: 'Morning check-in', color: '#E8B55E' },
    { day: 28, label: 'Focus block',       color: '#DC5A40' },
    { day: 30, label: 'Weekly review',     color: '#7B8FE8' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...SF, background: '#0e0e14' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 1 }}>2026</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>June</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 12 }}>‹</span>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 12 }}>›</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {week.map((day, di) => (
                <div key={di} style={{
                  height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: day === today ? '#E8B55E' : 'transparent',
                }}>
                  <span style={{ fontSize: 11, fontWeight: day === today ? 700 : 400, color: day === today ? '#000' : day ? 'rgba(255,255,255,0.75)' : 'transparent' }}>
                    {day ?? '·'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Upcoming</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ width: 3, height: 28, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>{ev.label}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>Jun {ev.day}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="calendar" />
    </div>
  );
}

/* ─── kite app wrapper (handles tab crossfade) ── */
function KiteApp({ calendarProgress }: { calendarProgress: number }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - calendarProgress }}>
        <DashboardScreen />
      </div>
      <div style={{ position: 'absolute', inset: 0, opacity: calendarProgress }}>
        <CalendarScreen />
      </div>
    </div>
  );
}

/* ─── reminder chat (overlay: reverse-switch iMessage scene) ── */
function ReminderChat({ opacity }: { opacity: number }) {
  if (opacity <= 0) return null;
  const messages = [
    { from: 'kite' as const, text: 'By the way — I noticed you have a deadline coming up. Want me to remind you tomorrow at 9am? 🔔' },
    { from: 'user' as const, text: 'Yes please!' },
    { from: 'kite' as const, text: "Done ✓ I'll send you a reminder right here in iMessage." },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', opacity, display: 'flex', flexDirection: 'column', zIndex: 10, ...SF }}>
      <ChatHeader />
      <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10, overflow: 'hidden' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '78%',
              background: msg.from === 'user' ? '#0084FF' : '#1C1C1E',
              borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: '9px 13px',
            }}>
              <span style={{ fontSize: 12.5, color: 'white', lineHeight: 1.45 }}>{msg.text}</span>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: -6 }}>Delivered</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderTop: '0.5px solid rgba(255,255,255,0.1)', gap: 8, flexShrink: 0 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: '7px 12px', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          iMessage
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: '#0084FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6l5-5 5 5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── iOS-style notification banner ─────────── */
function NotificationBanner({ progress }: { progress: number }) {
  if (progress <= 0) return null;
  const top = -100 + progress * 148; // slides from off-screen to 48px (below status bar)
  return (
    <div style={{
      position: 'absolute', left: 8, right: 8, top, zIndex: 50,
      background: 'rgba(28,28,30,0.94)',
      backdropFilter: 'blur(20px)',
      borderRadius: 14,
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
      border: '0.5px solid rgba(255,255,255,0.12)',
      ...SF,
    }}>
      {/* iMessage app icon — green Messages bubble */}
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: 'linear-gradient(180deg, #6DD75A 0%, #34C759 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={22} height={21} viewBox="0 0 22 21" fill="white">
          <path d="M11 0C4.925 0 0 4.253 0 9.5c0 2.79 1.3 5.29 3.375 7.033L2.5 21l4.45-2.22C8.2 19.57 9.56 19.75 11 19.75 17.075 19.75 22 15.497 22 9.5S17.075 0 11 0z"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Kite</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>iMessage</span>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>now</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>⏰ Reminder: your deadline is tomorrow at 9am</div>
      </div>
    </div>
  );
}

/* ─── root ───────────────────────────────────── */
export default function IPhoneMockup({
  switcherProgress = 0,
  calendarProgress = 0,
  reverseProgress = 0,
  notificationProgress = 0,
}: {
  switcherProgress?: number;
  calendarProgress?: number;
  reverseProgress?: number;
  notificationProgress?: number;
}) {
  const [pressedKey,   setPressedKey]   = useState<string | null>(null);
  const [typedText,    setTypedText]    = useState('');
  const [welcomePhase, setWelcomePhase] = useState<'typing' | 'shown'>('typing');
  const [userMessage,  setUserMessage]  = useState<string | null>(null);
  const [sendPhase,    setSendPhase]    = useState<SendPhase>('none');

  // ── Forward app-switch animation (iMessage → Kite) ──
  const p = switcherProgress;
  const N = (v: number, lo: number, hi: number) => Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
  const enterT  = N(p, 0, 0.35);
  const swipeT  = N(p, 0.35, 0.65);
  const launchT = N(p, 0.65, 1.0);

  const imsgScale   = 1 - enterT * 0.28;
  const imsgX       = swipeT * 280;
  const imsgOpacity = 1 - Math.max(0, (swipeT - 0.7) / 0.3);
  const imsgRadius  = enterT * 14;

  const kiteX       = 0;
  const kiteOpacity = enterT;
  const kiteScale   = 0.68 + launchT * 0.32;
  const kiteRadius  = (1 - launchT) * 14;
  const bgOpacity   = Math.min(enterT * 1.5, 1);

  // ── Reverse app-switch animation (Kite → iMessage) ──
  const rp = reverseProgress;
  const revEnterT  = N(rp, 0, 0.35);  // Kite card zooms out to card size
  const revSwipeT  = N(rp, 0.35, 0.65); // Kite exits right, iMessage enters from left
  const revLaunchT = N(rp, 0.65, 1.0);  // iMessage launches to full screen

  const inReverse = rp > 0;

  // Blended final values — reverse overrides forward when active
  const finalImsgScale   = inReverse ? (0.68 + revLaunchT * 0.32) : imsgScale;
  const finalImsgX       = inReverse ? (-(1 - revSwipeT) * 280)   : imsgX;
  const finalImsgOpacity = inReverse ? 1                           : imsgOpacity;
  const finalImsgRadius  = inReverse ? (1 - revLaunchT) * 14      : imsgRadius;

  const finalKiteScale   = inReverse ? (1 - revEnterT * 0.28)                           : kiteScale;
  const finalKiteX       = inReverse ? revSwipeT * 280                                   : kiteX;
  const finalKiteOpacity = inReverse ? (1 - Math.max(0, (revSwipeT - 0.7) / 0.3))       : kiteOpacity;
  const finalKiteRadius  = inReverse ? revEnterT * 14                                    : kiteRadius;

  // During reverse: bg stays at 1 through enter+swipe, fades as iMessage launches
  const finalBgOpacity   = inReverse ? Math.max(0, 1 - revLaunchT) : bgOpacity;

  // ── Audio ──
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
    <div
      className="w-[273px] h-[557px] bg-[#111] rounded-[46px] border-[8px] border-[#2a2a2a] phone-shell overflow-hidden flex flex-col relative shrink-0"
      style={{ isolation: 'isolate' }}
    >
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-black rounded-[10px] z-20"/>

      {/* Permanent status bar — always visible, never animated */}
      <div className="relative z-20 bg-black">
        <StatusBar />
      </div>

      <div className="flex-1 relative overflow-hidden">

        {/* Switcher background — visible during both forward and reverse switch */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: finalBgOpacity,
          pointerEvents: 'none',
        }} />

        {/* iMessage card */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: '#000',
          transform: `translateX(${finalImsgX}px) scale(${finalImsgScale})`,
          transformOrigin: 'center center',
          borderRadius: finalImsgRadius,
          overflow: 'hidden',
          opacity: finalImsgOpacity,
          display: 'flex', flexDirection: 'column',
          ...(enterT > 0 || inReverse ? { boxShadow: '0 6px 28px rgba(0,0,0,0.8)' } : {}),
        }}>
          <ChatHeader />
          <MessageBubbles
            welcomePhase={welcomePhase}
            userMessage={userMessage}
            sendPhase={sendPhase}
          />
          <InputBar text={typedText} />
          <Keyboard pressedKey={pressedKey} />
          {/* Reminder conversation fades in as iMessage launches during reverse switch */}
          <ReminderChat opacity={revLaunchT} />
        </div>

        {/* Kite daily summary card */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          transform: `translateX(${finalKiteX}px) scale(${finalKiteScale})`,
          transformOrigin: 'center center',
          borderRadius: finalKiteRadius,
          overflow: 'hidden',
          opacity: finalKiteOpacity,
          ...(launchT < 0.95 || inReverse ? { boxShadow: '0 6px 28px rgba(0,0,0,0.8)' } : {}),
        }}>
          <KiteApp calendarProgress={calendarProgress} />
        </div>

      </div>

      {/* iOS notification banner — slides down from top of phone screen */}
      <NotificationBanner progress={notificationProgress} />
    </div>
  );
}
