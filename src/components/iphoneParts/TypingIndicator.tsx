export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#2C2C2E] rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[4px] px-[14px] py-[10px] flex items-center gap-[5px]">
        <div className="imsg-dot w-[7px] h-[7px] rounded-full bg-white/75"/>
        <div className="imsg-dot w-[7px] h-[7px] rounded-full bg-white/75"/>
        <div className="imsg-dot w-[7px] h-[7px] rounded-full bg-white/75"/>
      </div>
    </div>
  );
}
