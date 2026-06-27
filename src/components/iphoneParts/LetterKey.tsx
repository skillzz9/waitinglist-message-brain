import KeyCallout from './KeyCallout';

interface Props {
  label: string;
  pressedKey: string | null;
}

export default function LetterKey({ label, pressedKey }: Props) {
  const active = pressedKey === label;
  return (
    <div className="relative shrink-0">
      {active && <KeyCallout label={label}/>}
      <div className={`w-[21px] h-[40px] rounded-[6px] flex items-center justify-center text-[15px] text-white font-sf ${active ? 'bg-[#555]' : 'bg-[#3a3a3c]'}`}>
        {label}
      </div>
    </div>
  );
}
