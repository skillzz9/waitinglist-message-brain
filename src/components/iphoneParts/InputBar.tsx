import { SmoothBox } from '@/components/ui/SmoothBox';

export default function InputBar({ text }: { text: string }) {
  const hasText = text.length > 0;

  return (
    <div className="flex items-center gap-[7px] py-[7px] pr-[10px] pl-[10px] bg-[#1C1C1E] border-t border-white/10">

      {/* + button — circle */}
      <div className="w-7 h-7 rounded-full bg-[#3A3A3C] flex items-center justify-center shrink-0">
        <svg width={11} height={11} viewBox="0 0 16.4746 16.123" fill="white">
          <path d="M8.93555 15.2441L8.93555 0.869141C8.93555 0.400391 8.53516 0 8.05664 0C7.57812 0 7.1875 0.400391 7.1875 0.869141L7.1875 15.2441C7.1875 15.7129 7.57812 16.1133 8.05664 16.1133C8.53516 16.1133 8.93555 15.7129 8.93555 15.2441ZM0.869141 8.92578L15.2441 8.92578C15.7129 8.92578 16.1133 8.53516 16.1133 8.05664C16.1133 7.57812 15.7129 7.17773 15.2441 7.17773L0.869141 7.17773C0.400391 7.17773 0 7.57812 0 8.05664C0 8.53516 0.400391 8.92578 0.869141 8.92578Z"/>
        </svg>
      </div>

      {/* Text input — squircle */}
      <SmoothBox
        radius={14}
        background="#2C2C2E"
        showBorder
        borderColor="rgba(255,255,255,0.1)"
        containerClassName="flex-1"
        className="flex items-center gap-[6px] pl-[10px] pr-2 py-[3px]"
      >
        {/* Text + cursor */}
        <div className="flex-1 min-w-0">
          {!hasText && (
            <span className="imsg-cursor inline-block w-[2px] h-[14px] bg-[#0A84FF] rounded-[1px] align-middle mr-[2px]"/>
          )}
          <span className={`text-[12px] whitespace-pre-wrap break-words leading-[1.15] font-sf ${hasText ? 'text-white' : 'text-white/35'}`}>
            {hasText ? text : 'Message'}
          </span>
          {hasText && (
            <span className="imsg-cursor inline-block w-[2px] h-[14px] bg-[#0A84FF] rounded-[1px] align-middle ml-[2px]"/>
          )}
        </div>

        {/* Right icon — audio wave when empty, send button (circle) when typing */}
        <div className="shrink-0 flex items-center">
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
            <div className="w-[22px] h-[22px] rounded-full bg-[#0A84FF] flex items-center justify-center">
              <svg width={10} height={12} viewBox="0 0 15.166 18.4473" fill="white">
                <path d="M0.839844 8.27148C1.07422 8.27148 1.30859 8.19336 1.45508 8.03711L3.68164 5.84961L7.39258 1.76758L11.123 5.84961L13.3496 8.03711C13.5059 8.19336 13.7305 8.27148 13.9648 8.27148C14.4531 8.27148 14.8047 7.90039 14.8047 7.42188C14.8047 7.1875 14.7266 6.98242 14.541 6.78711L8.05664 0.292969C7.87109 0.0976562 7.64648 0 7.40234 0C7.1582 0 6.93359 0.0976562 6.74805 0.292969L0.273438 6.78711C0.0878906 6.98242 0 7.1875 0 7.42188C0 7.90039 0.351562 8.27148 0.839844 8.27148ZM7.40234 18.4473C7.91016 18.4473 8.27148 18.0957 8.27148 17.5879L8.27148 4.72656L8.17383 1.81641C8.17383 1.35742 7.86133 1.04492 7.40234 1.04492C6.94336 1.04492 6.63086 1.35742 6.63086 1.81641L6.5332 4.72656L6.5332 17.5879C6.5332 18.0957 6.89453 18.4473 7.40234 18.4473Z"/>
              </svg>
            </div>
          )}
        </div>
      </SmoothBox>

    </div>
  );
}
