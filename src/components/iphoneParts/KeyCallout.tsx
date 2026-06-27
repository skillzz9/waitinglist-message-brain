export default function KeyCallout({ label }: { label: string }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0.5 z-[1000] pointer-events-none flex flex-col items-center">
      <div className="w-[37px] h-[60px] bg-[#E0E0E5] rounded-[9px] flex items-center justify-center text-[22px] font-light text-black shadow-[0_3px_12px_rgba(0,0,0,0.5)] font-sf">
        {label.toUpperCase()}
      </div>
      <div className="w-[21px] h-[7px] bg-[#E0E0E5] rounded-b-[5px] -mt-px"/>
    </div>
  );
}
