"use client";

import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/use-haptics';
import { forwardRef } from 'react';

// Define HapticButtonProps by extending standard HTML button attributes
// and explicitly adding common shadcn/ui Button props like variant and size.
interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticType = 'light', onClick, children, variant, size, ...props }, ref) => {
    const { triggerHaptic } = useHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic(hapticType);
      onClick?.(e); // Call the original onClick if it exists
    };

    return (
      <Button ref={ref} onClick={handleClick} variant={variant} size={size} {...props}>
        {children}
      </Button>
    );
  }
);

HapticButton.displayName = 'HapticButton';