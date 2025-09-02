import React from 'react';
import { cn } from '@/lib/utils';

interface DiscountAnimationProps {
  enabled: boolean;
  color: string;
  className?: string;
  children: React.ReactNode;
}

export const DiscountAnimation: React.FC<DiscountAnimationProps> = ({
  enabled,
  color,
  className,
  children
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden animate-pulse",
        "before:absolute before:inset-0 before:rounded-lg before:opacity-60",
        "before:pointer-events-none",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        border: `2px solid ${color}`,
      }}
    >
      {children}
    </div>
  );
};