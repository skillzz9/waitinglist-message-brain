'use client';

import { useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';
import type { SendPhase } from './types';

interface Props {
  welcomePhase: 'typing' | 'shown';
  userMessage: string | null;
  sendPhase: SendPhase;
}

export default function MessageBubbles({ welcomePhase, userMessage, sendPhase }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [welcomePhase, userMessage, sendPhase]);

  const showRead     = sendPhase === 'read' || sendPhase === 'fae-typing' || sendPhase === 'fae-replied';
  const showFaeType  = sendPhase === 'fae-typing';
  const showFaeReply = sendPhase === 'fae-replied';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-[10px] pb-[6px] flex flex-col gap-[4px] bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      {/* Pushes messages to bottom */}
      <div className="flex-1"/>

      {welcomePhase === 'typing' && !userMessage && <TypingIndicator/>}

      {welcomePhase === 'shown' && (
        <div className="shrink-0 flex justify-start">
          <div className="imsg-pop bg-[#2C2C2E] text-white rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[4px] px-3 py-2 text-[12px] leading-[1.3] max-w-[85%] break-words font-sf">
            welcome to message brain, send whats on your mind?
          </div>
        </div>
      )}

      {userMessage && (
        <div className="shrink-0 flex justify-end">
          <div className="imsg-pop bg-[#0A84FF] text-white rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[18px] rounded-br-[4px] px-3 py-2 text-[12px] leading-[1.3] max-w-[85%] break-words font-sf">
            {userMessage}
          </div>
        </div>
      )}

      {showRead && (
        <div className="imsg-fade shrink-0 text-right text-[10px] text-white/40 pr-1 font-sf">
          Read
        </div>
      )}

      {showFaeType && <TypingIndicator/>}

      {showFaeReply && (
        <div className="shrink-0 flex justify-start">
          <div className="imsg-pop bg-[#2C2C2E] text-white rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[4px] px-3 py-2 text-[12px] leading-[1.3] max-w-[85%] break-words font-sf">
            join waiting list
          </div>
        </div>
      )}

      <div ref={bottomRef}/>
    </div>
  );
}
