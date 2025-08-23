'use client';

import { cn } from '@/lib/utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  delay = 0,
  borderWidth = 1.5,
  anchor = 90,
  colorFrom = '#3B82F6',
  colorTo = '#6366F1',
}: BorderBeamProps) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:1px_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        className,
      )}
      style={{
        background: `conic-gradient(from ${anchor}deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
        animation: `border-beam ${duration}s infinite linear`,
        animationDelay: `${delay}s`,
      }}
    >
      <style jsx>{`
        @keyframes border-beam {
          0% {
            background: conic-gradient(from ${anchor}deg, transparent, transparent, transparent);
          }
          20% {
            background: conic-gradient(from ${anchor}deg, transparent, ${colorFrom}40, ${colorTo}40, transparent);
          }
          40% {
            background: conic-gradient(from ${anchor}deg, transparent, ${colorFrom}, ${colorTo}, transparent);
          }
          60% {
            background: conic-gradient(from ${anchor}deg, transparent, ${colorFrom}40, ${colorTo}40, transparent);
          }
          100% {
            background: conic-gradient(from ${anchor}deg, transparent, transparent, transparent);
          }
        }
      `}</style>
    </div>
  );
};
