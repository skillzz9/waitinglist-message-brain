'use client';

import { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
  blur?: number;
  distortion?: number;
  flexibility?: number;
  borderColor?: string;
  borderSize?: number;
  borderRadius?: number;
  borderOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  innerLightColor?: string;
  innerLightSpread?: number;
  innerLightBlur?: number;
  innerLightOpacity?: number;
  outerLightColor?: string;
  outerLightSpread?: number;
  outerLightBlur?: number;
  outerLightOpacity?: number;
  color?: string;
  chromaticAberration?: number;
  onHoverScale?: number;
  saturation?: number;
  brightness?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

function parseHex(hex: string) {
  const h = hex.replace('#', '').slice(0, 6);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export default function GlassCard({
  blur = 4,
  borderColor = '#ffffff',
  borderSize = 1,
  borderRadius = 30,
  borderOpacity = 0.4,
  backgroundOpacity = 0,
  outerLightColor = '#ffffff',
  outerLightSpread = 1,
  outerLightBlur = 10,
  outerLightOpacity = 0,
  color = '#ffffff',
  onHoverScale = 1,
  saturation = 100,
  brightness = 100,
  children,
  className = '',
  style,
  onClick,
}: GlassCardProps) {
  const bc = parseHex(borderColor);
  const borderRgba = `rgba(${bc.r}, ${bc.g}, ${bc.b}, ${borderOpacity})`;

  let outerShadow: string | undefined;
  if (outerLightOpacity > 0) {
    const ol = parseHex(outerLightColor);
    outerShadow = `0 0 ${outerLightBlur}px ${outerLightSpread}px rgba(${ol.r}, ${ol.g}, ${ol.b}, ${outerLightOpacity})`;
  }

  const cardStyle: CSSProperties = {
    backdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%) brightness(${brightness}%)`,
    backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
    border: `${borderSize}px solid ${borderRgba}`,
    borderRadius: `${borderRadius}px`,
    color,
    boxShadow: outerShadow,
    transition: 'transform 0.2s ease',
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={e => {
        if (onHoverScale !== 1) {
          (e.currentTarget as HTMLElement).style.transform = `scale(${onHoverScale})`;
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      {children}
    </div>
  );
}
