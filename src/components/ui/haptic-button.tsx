import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/use-haptics';
import { forwardRef } from 'react';

interface HapticButtonProps extends React.ComponentProps<typeof Button> {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticType = 'light', onClick, children, ...props }, ref) => {
    const { triggerHaptic } = useHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic(hapticType);
      onClick?.(e);
    };

    return (
      <Button ref={ref} onClick={handleClick} {...props}>
        {children}
      </Button>
    );
  }
);

HapticButton.displayName = 'HapticButton';