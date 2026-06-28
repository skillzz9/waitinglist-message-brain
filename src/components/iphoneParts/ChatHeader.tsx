export default function ChatHeader() {
  return (
    <div className="flex items-center justify-between px-[10px] pt-1 pb-[6px] border-b border-white/10">

      {/* Back button */}
      <div className="flex items-center gap-[2px] text-[#0A84FF] text-[13px] font-sf">
        <svg width={9} height={15} viewBox="0 0 9 15" fill="none">
          <path d="M8 1L1.5 7.5L8 14" stroke="#0A84FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Back</span>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-[2px]">
        <div className="w-7 h-7 rounded-full overflow-hidden">
          <img src="/logo.png" alt="Kite" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[11px] font-semibold text-white font-sf">Kite</span>
          <span className="text-[9px] text-white/45 font-sf">iMessage</span>
        </div>
      </div>

      {/* Action icon — video */}
      <svg width={20} height={13} viewBox="0 0 25.4004 16.0645" fill="#0A84FF">
        <path d="M5.04883 16.0547L15.2539 16.0547C17.6367 16.0547 19.0625 14.668 19.0625 12.2852L19.0625 3.75977C19.0625 1.38672 17.6367 0 15.2539 0L5.04883 0C2.77344 0 1.24023 1.38672 1.24023 3.75977L1.24023 12.2852C1.24023 14.668 2.66602 16.0547 5.04883 16.0547ZM5.32227 14.5801C3.7207 14.5801 2.8125 13.75 2.8125 12.0605L2.8125 3.99414C2.8125 2.29492 3.7207 1.46484 5.32227 1.46484L14.9805 1.46484C16.5723 1.46484 17.4902 2.29492 17.4902 3.99414L17.4902 12.0605C17.4902 13.75 16.5723 14.5801 14.9805 14.5801ZM18.8379 5.29297L18.8379 7.14844L23.4863 3.31055C23.5742 3.24219 23.6328 3.19336 23.7207 3.19336C23.8379 3.19336 23.8867 3.29102 23.8867 3.42773L23.8867 12.627C23.8867 12.7637 23.8379 12.8516 23.7207 12.8516C23.6328 12.8516 23.5742 12.8027 23.4863 12.7441L18.8379 8.90625L18.8379 10.752L22.7539 14.0723C23.1445 14.3945 23.5742 14.6191 23.9746 14.6191C24.834 14.6191 25.4004 13.9844 25.4004 13.0762L25.4004 2.97852C25.4004 2.07031 24.834 1.43555 23.9746 1.43555C23.5742 1.43555 23.1445 1.66016 22.7539 1.98242Z"/>
      </svg>

    </div>
  );
}
