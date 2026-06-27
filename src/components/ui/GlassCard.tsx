import { SmoothBox } from './SmoothBox';

type GlassCardProps = {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  padding?: string;
  radius?: number;
  borderColor?: string;
  borderWidth?: number;
};

/**
 * Glassmorphism card with squircle corners (Figma 60% smoothing).
 *
 * Usage:
 *   <GlassCard>…children…</GlassCard>
 *   <GlassCard className="h-[320px]" padding="p-4">…</GlassCard>
 *   <GlassCard radius={32} borderColor="rgba(255,255,255,0.12)">…</GlassCard>
 */
export default function GlassCard({
  children,
  className = '',
  containerClassName = '',
  padding = 'p-5',
  radius = 24,
  borderColor = 'rgba(255, 255, 255, 0.09)',
  borderWidth = 1,
}: GlassCardProps) {
  return (
    <SmoothBox
      showBorder
      radius={radius}
      borderColor={borderColor}
      borderWidth={borderWidth}
      background="rgba(255, 255, 255, 0.035)"
      containerClassName={containerClassName}
      className={['backdrop-blur-md', padding, className].filter(Boolean).join(' ')}
    >
      {children}
    </SmoothBox>
  );
}
