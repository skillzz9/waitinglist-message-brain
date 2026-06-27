'use client';

import { useRef, useState, useLayoutEffect, forwardRef, ElementType, ComponentPropsWithoutRef } from 'react';

// Figma 60% corner smoothing — same algorithm as cake-clone's smoothBox.js
function getSquirclePath(w: number, h: number, r: number): string {
  const maxR = Math.min(w / 2, h / 2);
  const safeR = Math.min(r, maxR);
  const curveStart = Math.min(safeR * 1.28, maxR);
  const control = curveStart * 0.28;

  return [
    `M 0,${curveStart}`,
    `C 0,${control} ${control},0 ${curveStart},0`,
    `L ${w - curveStart},0`,
    `C ${w - control},0 ${w},${control} ${w},${curveStart}`,
    `L ${w},${h - curveStart}`,
    `C ${w},${h - control} ${w - control},${h} ${w - curveStart},${h}`,
    `L ${curveStart},${h}`,
    `C ${control},${h} 0,${h - control} 0,${h - curveStart}`,
    `Z`,
  ].join(' ');
}

type SmoothBoxProps<T extends ElementType = 'div'> = {
  as?: T;
  radius?: number;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  background?: string;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'radius' | 'showBorder' | 'borderColor' | 'borderWidth' | 'background' | 'children' | 'className' | 'style'>;

export const SmoothBox = forwardRef<HTMLDivElement, SmoothBoxProps>(
  (
    {
      as: Component = 'div',
      radius = 24,
      showBorder = false,
      borderColor = 'rgba(255, 255, 255, 0.08)',
      borderWidth = 1,
      background = '#151518',
      children,
      className = '',
      containerClassName = '',
      style = {},
      ...props
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const elementRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
      const el = elementRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });

      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      });

      observer.observe(el);
      return () => observer.disconnect();
    }, [elementRef]);

    const hasSize = size.width > 0 && size.height > 0;
    const squirclePath = hasSize ? getSquirclePath(size.width, size.height, radius) : null;

    const Tag = Component as ElementType;

    return (
      <div
        ref={elementRef}
        className={containerClassName}
        style={{ position: 'relative', isolation: 'isolate', ...style }}
      >
        {squirclePath && showBorder && (
          <svg
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 2,
              overflow: 'visible',
            }}
          >
            <path
              d={squirclePath}
              fill="none"
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </svg>
        )}

        <Tag
          style={{
            background,
            position: 'relative',
            zIndex: 0,
            width: '100%',
            clipPath: squirclePath ? `path('${squirclePath}')` : 'none',
            WebkitClipPath: squirclePath ? `path('${squirclePath}')` : 'none',
          }}
          className={className}
          {...props}
        >
          {children}
        </Tag>
      </div>
    );
  },
);

SmoothBox.displayName = 'SmoothBox';
