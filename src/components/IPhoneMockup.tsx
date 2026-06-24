'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── sizing ─────────────────────────────────── */
const PHONE_W   = 273;
const KEY_W     = 21;
const KEY_GAP   = 4;
const KEY_H     = 40;
const ROW_GAP   = 6;
const KBD_PAD_H = 6;
const KBD_PAD_V = 6;

const SF: React.CSSProperties = {
  fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
};

/* ─── message send/receive sounds ────────────── */
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

/* ─── iOS key callout ────────────────────────── */
function KeyCallout({ label }: { label: string }) {
  return (
    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 2, zIndex: 1000, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ background: '#E0E0E5', borderRadius: 9, width: KEY_W + 16, height: KEY_H + 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 300, color: '#000', boxShadow: '0 3px 12px rgba(0,0,0,0.5)', ...SF }}>
        {label.toUpperCase()}
      </div>
      <div style={{ width: KEY_W, height: 7, background: '#E0E0E5', borderRadius: '0 0 5px 5px', marginTop: -1 }} />
    </div>
  );
}

/* ─── individual letter key ──────────────────── */
function LetterKey({ label, pressedKey }: { label: string; pressedKey: string | null }) {
  const active = pressedKey === label;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {active && <KeyCallout label={label} />}
      <div style={{ width: KEY_W, height: KEY_H, background: active ? '#555' : '#3a3a3c', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: '#fff', ...SF }}>
        {label}
      </div>
    </div>
  );
}

/* ─── keyboard ───────────────────────────────── */
const ROW1     = ['q','w','e','r','t','y','u','i','o','p'];
const ROW2     = ['a','s','d','f','g','h','j','k','l'];
const ROW3_MID = ['z','x','c','v','b','n','m'];

const specKey: React.CSSProperties = {
  height: KEY_H, background: '#1d1d1f', borderRadius: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, color: '#fff', flexShrink: 0, ...SF,
};

function KeyRow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: KEY_GAP, justifyContent: 'center', alignItems: 'center', ...style }}>
      {children}
    </div>
  );
}

function Keyboard({ pressedKey }: { pressedKey: string | null }) {
  return (
    <div style={{ background: '#131314', padding: `${KBD_PAD_V}px ${KBD_PAD_H}px 21px`, display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>
      <KeyRow>{ROW1.map(k => <LetterKey key={k} label={k} pressedKey={pressedKey} />)}</KeyRow>
      <KeyRow style={{ paddingLeft: 13, paddingRight: 13 }}>
        {ROW2.map(k => <LetterKey key={k} label={k} pressedKey={pressedKey} />)}
      </KeyRow>
      <KeyRow>
        <div style={{ ...specKey, width: 42 }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
        </div>
        {ROW3_MID.map(k => <LetterKey key={k} label={k} pressedKey={pressedKey} />)}
        <div style={{ ...specKey, width: 42, background: pressedKey === 'backspace' ? '#333' : '#1d1d1f' }}>
          <svg width={17} height={13} viewBox="0 0 24 18" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8L2 9z"/>
            <line x1="15" y1="6" x2="11" y2="12"/><line x1="11" y1="6" x2="15" y2="12"/>
          </svg>
        </div>
      </KeyRow>
      <KeyRow>
        <div style={{ ...specKey, width: 40, fontSize: 13 }}>123</div>
        <div style={{ ...specKey, width: 40 }}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20"/>
          </svg>
        </div>
        <div style={{ ...specKey, flex: 1, width: 'auto', background: pressedKey === 'space' ? '#555' : '#3a3a3c', fontSize: 13 }}>space</div>
        <div style={{ ...specKey, width: 84, background: pressedKey === 'return' ? '#333' : '#1d1d1f', fontSize: 13 }}>return</div>
      </KeyRow>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
        <div style={{ width: 105, height: 4, background: '#555', borderRadius: 2 }}/>
      </div>
    </div>
  );
}

/* ─── status bar ─────────────────────────────── */
function StatusBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 21px 4px', color: 'white', fontSize: 13, fontWeight: 600, ...SF }}>
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width={17} height={13} viewBox="0 0 16 12" fill="white">
          <rect x="0" y="8" width="2.5" height="4" rx="0.5"/><rect x="3.5" y="5.5" width="2.5" height="6.5" rx="0.5"/>
          <rect x="7" y="3" width="2.5" height="9" rx="0.5"/><rect x="10.5" y="0" width="2.5" height="12" rx="0.5"/>
        </svg>
        <svg width={25} height={13} viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="19" height="11" rx="2.5" stroke="white" strokeOpacity="0.35"/>
          <rect x="2" y="2" width="14" height="8" rx="1.5" fill="white"/>
          <path d="M21 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

/* ─── iMessage nav ───────────────────────────── */
function IMessageHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 6px', background: 'rgba(28,28,30,0.92)', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0A84FF', fontSize: 13, ...SF }}>
        <svg width={9} height={15} viewBox="0 0 9 15" fill="none"><path d="M8 1L1.5 7.5L8 14" stroke="#0A84FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontSize: 13 }}>Back</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #E8B55E 0%, #DC5A40 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white', ...SF }}>F</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'white', ...SF }}>Fae</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', ...SF }}>iMessage</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M15 10l4.55-4.55A1 1 0 0 1 21 6.2v11.6a1 1 0 0 1-1.45.9L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke="#0A84FF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#0A84FF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

/* ─── chat bubbles ───────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ background: '#2C2C2E', borderRadius: '18px 18px 18px 4px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div className="imsg-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }}/>
        <div className="imsg-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }}/>
        <div className="imsg-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }}/>
      </div>
    </div>
  );
}

type SendPhase = 'none' | 'read' | 'fae-typing' | 'fae-replied';

function IMessageBubbles({
  welcomePhase,
  userMessage,
  sendPhase,
}: {
  welcomePhase: 'typing' | 'shown';
  userMessage: string | null;
  sendPhase: SendPhase;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever conversation advances
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [welcomePhase, userMessage, sendPhase]);

  const showRead     = sendPhase === 'read' || sendPhase === 'fae-typing' || sendPhase === 'fae-replied';
  const showFaeType  = sendPhase === 'fae-typing';
  const showFaeReply = sendPhase === 'fae-replied';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 6px', display: 'flex', flexDirection: 'column', gap: 5, background: '#000', scrollbarWidth: 'none' }}>

      {/* Spacer — pushes messages to the bottom like real iMessage */}
      <div style={{ flex: 1 }} />

      {/* Welcome / initial typing */}
      {welcomePhase === 'typing' && !userMessage && <TypingIndicator />}
      {welcomePhase === 'shown' && (
        <div className="imsg-pop" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ background: '#2C2C2E', color: 'white', borderRadius: '18px 18px 18px 4px', padding: '8px 12px', fontSize: 12, lineHeight: 1.45, maxWidth: '85%', wordBreak: 'break-word', ...SF }}>
            welcome to message brain, send whats on your mind?
          </div>
        </div>
      )}

      {/* User's sent message */}
      {userMessage && (
        <div className="imsg-pop" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#0A84FF', color: 'white', borderRadius: '18px 18px 4px 18px', padding: '8px 12px', fontSize: 12, lineHeight: 1.45, maxWidth: '85%', wordBreak: 'break-word', ...SF }}>
            {userMessage}
          </div>
        </div>
      )}

      {/* Read receipt */}
      {showRead && (
        <div className="imsg-fade" style={{ textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.42)', paddingRight: 4, ...SF }}>
          Read
        </div>
      )}

      {/* Fae typing */}
      {showFaeType && <TypingIndicator />}

      {/* Fae reply */}
      {showFaeReply && (
        <div className="imsg-pop" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ background: '#2C2C2E', color: 'white', borderRadius: '18px 18px 18px 4px', padding: '8px 12px', fontSize: 12, lineHeight: 1.45, maxWidth: '85%', wordBreak: 'break-word', ...SF }}>
            join waiting list
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

/* ─── input bar ──────────────────────────────── */
function InputBar({ text }: { text: string }) {
  const hasText = text.length > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px 7px 6px', background: '#1C1C1E', borderTop: '0.5px solid rgba(255,255,255,0.12)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <line x1="6" y1="1" x2="6" y2="11" stroke="white" strokeWidth={2} strokeLinecap="round"/>
          <line x1="1" y1="6" x2="11" y2="6" stroke="white" strokeWidth={2} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ flex: 1, height: 32, background: '#2C2C2E', borderRadius: 16, border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 8, overflow: 'hidden' }}>
        {/* text + cursor together, clips on the right */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden' }}>
          {!hasText && <div className="imsg-cursor" style={{ width: 2, height: 16, background: '#0A84FF', borderRadius: 1, flexShrink: 0 }}/>}
          <span style={{ fontSize: 12, whiteSpace: 'nowrap', color: hasText ? 'white' : 'rgba(255,255,255,0.35)', ...SF }}>
            {hasText ? text : 'Message'}
          </span>
          {hasText && <div className="imsg-cursor" style={{ width: 2, height: 15, background: '#0A84FF', borderRadius: 1, flexShrink: 0 }}/>}
        </div>
        {/* icon always pinned right */}
        <div style={{ flexShrink: 0, marginLeft: 6, display: 'flex', alignItems: 'center' }}>
          {!hasText ? (
            <svg width={18} height={14} viewBox="0 0 18 14" fill="none">
              <rect x="0"  y="5"  width="2" height="4"  rx="1" fill="rgba(255,255,255,0.4)"/>
              <rect x="3"  y="3"  width="2" height="8"  rx="1" fill="rgba(255,255,255,0.4)"/>
              <rect x="6"  y="1"  width="2" height="12" rx="1" fill="rgba(255,255,255,0.4)"/>
              <rect x="9"  y="3"  width="2" height="8"  rx="1" fill="rgba(255,255,255,0.4)"/>
              <rect x="12" y="5"  width="2" height="4"  rx="1" fill="rgba(255,255,255,0.4)"/>
              <rect x="15" y="4"  width="2" height="6"  rx="1" fill="rgba(255,255,255,0.4)"/>
            </svg>
          ) : (
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                <path d="M5.5 9.5V1.5M1.5 5.5l4-4 4 4" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── tick sound playback ─────────────────────── */
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

/* ─── root ───────────────────────────────────── */
export default function IPhoneMockup() {
  const [pressedKey,   setPressedKey]   = useState<string | null>(null);
  const [typedText,    setTypedText]    = useState('');
  const [welcomePhase, setWelcomePhase] = useState<'typing' | 'shown'>('typing');
  const [userMessage,  setUserMessage]  = useState<string | null>(null);
  const [sendPhase,    setSendPhase]    = useState<SendPhase>('none');

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

  // Refs used inside stable event handler
  const pressTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef        = useRef('');          // mirror of typedText
  const hasSentRef     = useRef(false);       // prevent double-send
  const convTimersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { textRef.current = typedText; }, [typedText]);

  // Welcome animation
  useEffect(() => {
    const t = setTimeout(() => setWelcomePhase('shown'), 2000);
    return () => clearTimeout(t);
  }, []);

  // Clean up conversation timers on unmount
  useEffect(() => () => { convTimersRef.current.forEach(clearTimeout); }, []);

  const triggerConversation = useCallback((msg: string) => {
    msgSendRef.current?.();
    setUserMessage(msg);
    setSendPhase('none');

    const t1 = setTimeout(() => setSendPhase('read'),        900);
    const t2 = setTimeout(() => setSendPhase('fae-typing'),  1900);
    const t3 = setTimeout(() => {
      setSendPhase('fae-replied');
      msgReceiveRef.current?.();
    }, 3800);
    convTimersRef.current = [t1, t2, t3];
  }, []);

  // Global keyboard listener
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
        // numbers, punctuation — add to text, no key animation
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
    <div style={{ width: PHONE_W, height: 557, background: '#111', borderRadius: 46, border: '8px solid #2a2a2a', boxShadow: '0 0 0 1px #3a3a3a, 0 32px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #0a0a0a', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 95, height: 27, background: '#000', borderRadius: 14, zIndex: 10 }}/>
      <div style={{ flex: 1, background: '#000', display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <IMessageHeader />
        <IMessageBubbles
          welcomePhase={welcomePhase}
          userMessage={userMessage}
          sendPhase={sendPhase}
        />
        <InputBar text={typedText} />
        <Keyboard pressedKey={pressedKey} />
      </div>
    </div>
  );
}
