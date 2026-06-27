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

export default function IPhoneMockup() {
  const [pressedKey,   setPressedKey]   = useState<string | null>(null);
  const [typedText,    setTypedText]    = useState('');
  const [welcomePhase, setWelcomePhase] = useState<'typing' | 'shown'>('typing');
  const [userMessage,  setUserMessage]  = useState<string | null>(null);
  const [sendPhase,    setSendPhase]    = useState<SendPhase>('none');

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
      {/* Dynamic Island notch */}
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-black rounded-[10px] z-10"/>

      <div className="flex-1 bg-black flex flex-col">
        <StatusBar/>
        <ChatHeader/>
        <MessageBubbles
          welcomePhase={welcomePhase}
          userMessage={userMessage}
          sendPhase={sendPhase}
        />
        <InputBar text={typedText}/>
        <Keyboard pressedKey={pressedKey}/>
      </div>
    </div>
  );
}
