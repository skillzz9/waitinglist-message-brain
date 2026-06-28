'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import StatusBar  from './iphoneParts/StatusBar';
import ChatHeader from './iphoneParts/ChatHeader';
import MessageBubbles from './iphoneParts/MessageBubbles';
import InputBar       from './iphoneParts/InputBar';
import Keyboard       from './iphoneParts/Keyboard';
import type { SendPhase } from './iphoneParts/types';

// KiteScene uses roughjs (internally random) + performance.now() + rAF — must be client-only
const KiteScene = dynamic(
  () => import('./iphoneParts/KiteScene').then(m => ({ default: m.KiteScene })),
  {
    ssr: false,
    // Placeholder matches the component's rendered height (Math.round(273 * 520 / 900) = 158px)
    loading: () => <div style={{ width: 273, height: 158, backgroundColor: '#f7eed5', flexShrink: 0 }} />,
  }
);

const MeditateScreen = dynamic(
  () => import('./iphoneParts/MeditateScreen'),
  { ssr: false }
);

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

/* ─── tab bar icons — SF Symbol approximations ── */
function HomeIcon({ color, filled }: { color: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M12 3L3 10.5V21h5.5v-6.5h7V21H21V10.5L12 3Z"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5V21h-5.5v-6.5h-7V21H3V10.5z"/>
    </svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4.5" width="18" height="15.5" rx="2.5" stroke={color} strokeWidth="1.8"/>
      <path d="M3 9.5h18" stroke={color} strokeWidth="1.8"/>
      <path d="M8 3v3M16 3v3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="6.5" y="12" width="2.5" height="2.5" rx="0.6" fill={color}/>
      <rect x="10.75" y="12" width="2.5" height="2.5" rx="0.6" fill={color}/>
      <rect x="15" y="12" width="2.5" height="2.5" rx="0.6" fill={color}/>
      <rect x="6.5" y="15.5" width="2.5" height="2.5" rx="0.6" fill={color}/>
      <rect x="10.75" y="15.5" width="2.5" height="2.5" rx="0.6" fill={color}/>
    </svg>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={color} strokeWidth="1.8"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}

/* ─── shared tab bar ────────────────────────── */
function TabBar({ active, theme = 'dark' }: { active: 'dashboard' | 'calendar'; theme?: 'dark' | 'warm' }) {
  const isWarm = theme === 'warm';

  if (isWarm) {
    // Match the iOS squircle pill style from the screenshot
    const ACTIVE_C   = '#007AFF'; // iOS blue
    const INACTIVE_C = 'rgba(58,32,16,0.55)'; // muted dark brown
    const tabs = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'calendar',  label: 'Calendar'  },
      { id: 'settings',  label: 'Settings'  },
    ] as const;

    return (
      <div style={{ backgroundColor: '#d4b87c', padding: '5px 8px 10px', flexShrink: 0 }}>
        {/* Single squircle container — matches iOS liquid glass pill */}
        <div style={{
          display: 'flex',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '3px',
          gap: 2,
        }}>
          {tabs.map(t => {
            const isActive = t.id === active;
            const c = isActive ? ACTIVE_C : INACTIVE_C;
            return (
              <div key={t.id} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                padding: '4px 2px 3px',
                borderRadius: 15,
                background: isActive ? 'rgba(255,255,255,0.55)' : 'transparent',
              }}>
                {t.id === 'dashboard' && <HomeIcon color={c} filled={isActive} />}
                {t.id === 'calendar'  && <CalendarIcon color={c} />}
                {t.id === 'settings'  && <GearIcon color={c} />}
                <span style={{ fontSize: 8, color: c, fontWeight: isActive ? 700 : 500, letterSpacing: -0.1 }}>
                  {t.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Dark theme (calendar screen)
  const activeC   = '#facc15';
  const inactiveC = 'rgba(255,255,255,0.4)';
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'calendar',  label: 'Calendar'  },
    { id: 'settings',  label: 'Settings'  },
  ] as const;

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      background: 'rgba(10,8,20,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '0.5px solid rgba(255,255,255,0.1)',
      padding: '10px 0 14px', flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        const c = isActive ? activeC : inactiveC;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {t.id === 'dashboard' && <HomeIcon color={c} filled={isActive} />}
            {t.id === 'calendar'  && <CalendarIcon color={c} />}
            {t.id === 'settings'  && <GearIcon color={c} />}
            <span style={{ fontSize: 9, color: c, fontWeight: isActive ? 600 : 400 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── dashboard screen ───────────────────────── */
// All values scaled from mobile stylesheet at 273/390 ≈ 0.7
function DashboardScreen({ active }: { active: boolean }) {
  const SKY        = '#f7eed5';
  const GROUND     = '#d4b87c';
  const DARK       = '#3a2010';
  const CARD_MID   = '#6b5a3e';
  const CARD_LIGHT = '#9a8a78';

  // Score animates 50→100 while visible, resets to 50 when scrolled away
  const [liveScore, setLiveScore] = useState(50);
  useEffect(() => {
    if (!active) {
      setLiveScore(50);
      return;
    }
    const start = performance.now();
    const DURATION = 9000;
    let raf: number;
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setLiveScore(Math.round(50 + eased * 50));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const mood     = Math.round(liveScore * 0.88);
  const growth   = Math.round(liveScore * 0.92);
  const activity = Math.round(liveScore * 0.85);

  const pills = [
    { icon: '🌙', label: 'Mood',     score: mood },
    { icon: '🌱', label: 'Growth',   score: growth },
    { icon: '💬', label: 'Activity', score: activity },
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...SF, backgroundColor: GROUND }}>

      {/* Sky */}
      <div style={{ backgroundColor: SKY, paddingTop: 17, paddingBottom: 2, textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: 'rgba(58,32,16,0.55)', fontWeight: 500, letterSpacing: 0.35, marginBottom: 3 }}>Daily Score</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: DARK, lineHeight: '62px', letterSpacing: -1 }}>{liveScore}</div>
      </div>

      {/* -2px margins kill the sub-pixel seam lines at sky/ground boundaries */}
      <div style={{ marginTop: -2, marginBottom: -2, flexShrink: 0 }}>
        <KiteScene score={liveScore} width={273} />
      </div>

      {/* Ground — paddingTop: 24×0.7=17, paddingH: 20×0.7=14 */}
      <div style={{ flex: 1, backgroundColor: GROUND, paddingTop: 17, paddingLeft: 14, paddingRight: 14, display: 'flex', flexDirection: 'column' }}>

        {/* Pills — compact, pulled up toward KiteScene boundary */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10, marginTop: -14 }}>
          {pills.map(p => (
            <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ border: '1px solid rgba(247,238,213,0.45)', borderRadius: 50, padding: '4px 9px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: SKY }}>{p.icon} {p.score}</span>
              </div>
              <span style={{ fontSize: 7, color: 'rgba(247,238,213,0.75)', fontWeight: 500 }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Journal card — card.borderRadius 28×0.7=20 */}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 20, padding: '9px 10px', marginBottom: 10 }}>
          {/* cardSectionLabel: fontSize 11×0.7=8 */}
          <div style={{ fontSize: 8, fontWeight: 600, color: CARD_LIGHT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>TODAY&apos;S JOURNAL</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 6 }}>
            <svg width={18} height={15} viewBox="0 0 24 20" fill="none">
              <path d="M2 2h9v16H2zM13 2h9v16h-9z" stroke={CARD_LIGHT} strokeWidth={1.5} strokeLinejoin="round"/>
            </svg>
            {/* emptyText: fontSize 15×0.7=10, emptySub: fontSize 12×0.7=8 */}
            <div style={{ fontSize: 10, fontWeight: 500, color: CARD_MID }}>No entry yet today</div>
            <div style={{ fontSize: 8, color: CARD_LIGHT, textAlign: 'center', lineHeight: 1.5 }}>Keep chatting — your journal generates automatically</div>
          </div>
        </div>
      </div>

      <TabBar active="dashboard" theme="warm" />
      {/* Home-indicator safe-area — ground colour fills the ~1cm gap at the very bottom */}
      <div style={{ backgroundColor: '#d4b87c', height: 18, flexShrink: 0 }} />
    </div>
  );
}

/* ─── calendar screen ────────────────────────── */
// All sizes scaled from mobile stylesheet at 273/390 ≈ 0.7
function CalendarScreen() {
  const SKY  = '#f7eed5';
  const DARK = '#3a2010';
  const BLUE = '#3a5a88';

  const dayLabels = ['S','M','T','W','T','F','S'];
  // June 2026: starts on Tuesday (firstDay=2)
  const cells: (number | null)[] = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, null, null, null,
  ];
  const today    = 28;
  const selected = 28;
  const entries  = new Set([5, 9, 12, 15, 18, 21, 24, 26, 27, 28]);

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...SF, backgroundColor: SKY }}>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Heading */}
        <div style={{ paddingTop: 8, paddingBottom: 3, paddingLeft: 14, paddingRight: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: DARK }}>Calendar</div>
        </div>

        {/* Calendar section */}
        <div style={{ paddingLeft: 11, paddingRight: 11, paddingTop: 8, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Calendar card */}
          <div style={glassCard}>
            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 13px 7px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>June 2026</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 16, color: DARK, opacity: 0.4, lineHeight: 1 }}>‹</span>
                <span style={{ fontSize: 16, color: DARK, opacity: 0.4, lineHeight: 1 }}>›</span>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', paddingLeft: 7, paddingRight: 7, marginBottom: 5 }}>
              {dayLabels.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: 8, color: 'rgba(58,32,16,0.45)', fontWeight: 600, letterSpacing: '0.05em' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, paddingLeft: 7, paddingRight: 7, paddingBottom: 10 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} style={{ aspectRatio: '1' }} />;
                const isSel = day === selected;
                const isToday = day === today;
                const hasEntry = entries.has(day);
                return (
                  <div key={i} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7,
                      backgroundColor: isSel ? BLUE : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: isSel || isToday ? 700 : 400,
                        color: isSel ? '#fff' : isToday ? BLUE : 'rgba(58,32,16,0.85)',
                      }}>{day}</span>
                    </div>
                    {hasEntry && !isSel && (
                      <div style={{ width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: BLUE, position: 'absolute', bottom: 1 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail card */}
          <div style={{ ...glassCard, padding: '9px 11px' }}>
            <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(58,32,16,0.5)', marginBottom: 9, textTransform: 'uppercase' }}>
              Sunday, 28 June
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 20 }}>😊</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: DARK, lineHeight: '15px' }}>A good day overall</div>
                <div style={{ fontSize: 8, color: 'rgba(58,32,16,0.55)', marginTop: 2 }}>3 messages · positive</div>
              </div>
            </div>
            <div style={{ fontSize: 9.5, lineHeight: '14px', color: 'rgba(58,32,16,0.75)', marginBottom: 8 }}>
              Reflected on your goals and felt grounded. Made real progress on staying focused today.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['mindfulness', 'growth', 'goals'].map((t) => (
                <div key={t} style={{ borderRadius: 6, paddingLeft: 7, paddingRight: 7, paddingTop: 3, paddingBottom: 3, backgroundColor: 'rgba(58,32,16,0.08)' }}>
                  <span style={{ fontSize: 8.5, fontWeight: 500, color: '#8a6a3e' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <TabBar active="calendar" theme="warm" />
      <div style={{ backgroundColor: '#d4b87c', height: 18, flexShrink: 0 }} />
    </div>
  );
}

/* ─── kite app wrapper (handles tab crossfade) ── */
function KiteApp({ calendarProgress, dashboardActive }: { calendarProgress: number; dashboardActive: boolean }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - calendarProgress }}>
        <DashboardScreen active={dashboardActive} />
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
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px 22px', borderTop: '0.5px solid rgba(255,255,255,0.1)', gap: 8, flexShrink: 0 }}>
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

/* ─── meditation chat (section 4) — animated ─── */
type MeditationPhase = 'idle' | 'typing' | 'sent' | 'kite-typing' | 'kite-replied';

function MeditationChat({ opacity, triggered, onNotifReady }: { opacity: number; triggered: boolean; onNotifReady: () => void }) {
  const [typedText, setTypedText]   = useState('');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [phase, setPhase]           = useState<MeditationPhase>('idle');
  const hasStartedRef               = useRef(false);
  const timersRef                   = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const fullMessage = useMemo(() => "Hey I'm not feeling too well", []);

  useEffect(() => {
    if (!triggered || hasStartedRef.current) return;
    hasStartedRef.current = true;
    setPhase('typing');

    fullMessage.split('').forEach((char, i) => {
      const delay = 400 + i * 60;
      const k = char === ' ' ? 'space' : char.toLowerCase();
      timersRef.current.push(
        setTimeout(() => { setPressedKey(k); setTypedText(fullMessage.slice(0, i + 1)); }, delay),
        setTimeout(() => setPressedKey(null), delay + 90),
      );
    });

    const totalMs = 400 + fullMessage.length * 60;
    timersRef.current.push(
      setTimeout(() => { setTypedText(''); setPhase('sent'); }, totalMs + 300),
      setTimeout(() => setPhase('kite-typing'), totalMs + 900),
      setTimeout(() => setPhase('kite-replied'), totalMs + 2400),
      setTimeout(onNotifReady, totalMs + 3200),
    );
  }, [triggered, fullMessage]);

  // Reset when scrolled back out
  useEffect(() => {
    if (opacity < 0.01 && hasStartedRef.current) {
      clearAllTimers();
      hasStartedRef.current = false;
      setPhase('idle');
      setTypedText('');
      setPressedKey(null);
    }
  }, [opacity, clearAllTimers]);

  if (opacity <= 0) return null;

  const showKeyboard   = phase === 'idle' || phase === 'typing';
  const showUserBubble = phase === 'sent' || phase === 'kite-typing' || phase === 'kite-replied';
  const showKiteTyping = phase === 'kite-typing';
  const showKiteReply  = phase === 'kite-replied';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', opacity, display: 'flex', flexDirection: 'column', zIndex: 11, ...SF }}>
      <ChatHeader />

      {/* Message area */}
      <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10, overflow: 'hidden' }}>
        {showUserBubble && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ maxWidth: '78%', background: '#0084FF', borderRadius: '18px 18px 4px 18px', padding: '9px 13px' }}>
              <span style={{ fontSize: 12.5, color: 'white', lineHeight: 1.45 }}>Hey I&apos;m not feeling too well</span>
            </div>
          </div>
        )}
        {showKiteTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#1C1C1E', borderRadius: '4px 18px 18px 18px', padding: '11px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        {showKiteReply && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ maxWidth: '78%', background: '#1C1C1E', borderRadius: '4px 18px 18px 18px', padding: '9px 13px' }}>
                <span style={{ fontSize: 12.5, color: 'white', lineHeight: 1.45 }}>I set up a meditation for you. 🧘 Take a moment for yourself.</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: -6 }}>Delivered</div>
          </>
        )}
      </div>

      {/* Input bar + optional keyboard */}
      {showKeyboard ? (
        <>
          <InputBar text={typedText} />
          <Keyboard pressedKey={pressedKey} />
        </>
      ) : (
        <div style={{ paddingBottom: 22 }}>
          <InputBar text="" />
        </div>
      )}
    </div>
  );
}

/* ─── Kite app notification banner (section 4) ── */
function KiteNotificationBanner({ show }: { show: boolean }) {
  const hasShownRef = useRef(false);
  if (show) hasShownRef.current = true;
  if (!hasShownRef.current) return null;
  return (
    <div style={{
      position: 'absolute', left: 8, right: 8, zIndex: 51,
      top: show ? 48 : -100,
      transition: 'top 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
      background: 'rgba(28,28,30,0.94)',
      backdropFilter: 'blur(20px)',
      borderRadius: 14,
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
      border: '0.5px solid rgba(255,255,255,0.12)',
      ...SF,
    }}>
      {/* Kite app icon */}
      <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Kite" width={36} height={36} style={{ width: 36, height: 36, objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Kite</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>now</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>🧘 I&apos;ve set up a meditation for you</div>
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
  section5Progress = 0,
  meditationNotifProgress = 0,
}: {
  switcherProgress?: number;
  calendarProgress?: number;
  reverseProgress?: number;
  notificationProgress?: number;
  section5Progress?: number;
  meditationNotifProgress?: number;
}) {
  const [pressedKey,         setPressedKey]         = useState<string | null>(null);
  const [typedText,          setTypedText]          = useState('');
  const [welcomePhase,       setWelcomePhase]       = useState<'typing' | 'shown'>('typing');
  const [userMessage,        setUserMessage]        = useState<string | null>(null);
  const [sendPhase,          setSendPhase]          = useState<SendPhase>('none');
  const [meditationNotifShow, setMeditationNotifShow] = useState(false);
  const [meditateUIShow,      setMeditateUIShow]      = useState(false);

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
  // Guard: only allow reverse when calendar has been fully shown (calendarProgress>=1),
  // otherwise a tiny blip in reverseProgress at the dashboard section causes a flash.
  const rp = calendarProgress >= 1 ? reverseProgress : 0;
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

  // Status bar: blend toward beige sky when dashboard is the top visible layer
  // Only go beige once the kite card is actually filling the screen (launchT for forward, 1-revEnterT for reverse)
  const kiteFullscreen = inReverse ? (1 - revEnterT) : launchT;
  // Both dashboard and calendar are beige — stay warm whenever Kite app is the top visible layer
  let statusBarBlend = Math.max(0, Math.min(1, finalKiteOpacity * (1 - finalImsgOpacity) * kiteFullscreen));
  
  if (meditateUIShow) {
    // When Meditate UI is visible, force it to beige, blending out if section 5 comes in
    statusBarBlend = Math.max(statusBarBlend, 1 - section5Progress);
  }

  const statusBarBg = `rgb(${Math.round(statusBarBlend * 247)},${Math.round(statusBarBlend * 238)},${Math.round(statusBarBlend * 213)})`;
  const statusBarDark = statusBarBlend > 0.5;

  // ── Meditation notification — hide when scrolled back or S5 starts ──
  useEffect(() => { 
    if (reverseProgress < 0.5) {
      setMeditationNotifShow(false);
      setMeditateUIShow(false);
    }
  }, [reverseProgress]);
  useEffect(() => { 
    if (section5Progress > 0.05) {
      setMeditationNotifShow(false);
      setMeditateUIShow(false);
    }
  }, [section5Progress]);
  const handleMeditationNotifReady = useCallback(() => {
    setMeditationNotifShow(true);
    setTimeout(() => {
      setMeditateUIShow(true);
    }, 1500);
  }, []);

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
    // Outer wrapper: clips to rounded corners AND provides reference frame for border overlay
    <div style={{ position: 'relative', flexShrink: 0, width: 273, height: 557, borderRadius: 46, overflow: 'hidden' }}>

    {/* Phone screen — clips all content to the rounded screen area */}
    <div
      className="w-[273px] h-[557px] bg-[#111] rounded-[46px] phone-shell overflow-hidden flex flex-col relative"
      style={{ isolation: 'isolate' }}
    >
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[80px] h-[20px] rounded-[10px] z-20" style={{ backgroundColor: '#1a1a1a' }}/>

      {/* Status bar — bg transitions to sky beige when dashboard fills screen; -1px overlap kills sub-pixel seam */}
      <div className="relative z-20" style={{ backgroundColor: statusBarBg, marginBottom: -1, transition: 'background-color 0.6s ease' }}>
        <StatusBar dark={statusBarDark} />
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
          {/* Meditation chat (S4): fades in on reverse switch, animation triggers when fully visible */}
          <MeditationChat opacity={revLaunchT * (1 - section5Progress)} triggered={revLaunchT >= 0.95} onNotifReady={handleMeditationNotifReady} />
          <MeditateScreen opacity={meditateUIShow ? (1 - section5Progress) : 0} />
          {/* Reminder chat (S5): crossfades in over the meditation chat */}
          <ReminderChat opacity={section5Progress} />
        </div>

        {/* Kite daily summary card — only mount once visible to avoid corner artifact on first load */}
        {finalKiteOpacity > 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            transform: `translateX(${finalKiteX}px) scale(${finalKiteScale})`,
            transformOrigin: 'center center',
            borderRadius: finalKiteRadius,
            overflow: 'hidden',
            opacity: finalKiteOpacity,
            ...(launchT < 0.95 || inReverse ? { boxShadow: '0 6px 28px rgba(0,0,0,0.8)' } : {}),
          }}>
            <KiteApp calendarProgress={calendarProgress} dashboardActive={launchT >= 0.5} />
          </div>
        )}

      </div>

      {/* S4 Kite App meditation banner — timer-driven, hides when S5 starts */}
      <KiteNotificationBanner show={meditationNotifShow && !meditateUIShow} />
      {/* S5 iMessage reminder banner */}
      <NotificationBanner progress={meditationNotifProgress} />
    </div>

    {/* Phone border overlay — sibling outside overflow:hidden so it's always on top */}
    <div style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 46,
      border: '8px solid #2a2a2a',
      pointerEvents: 'none',
      zIndex: 200,
    }} />

    </div>
  );
}
