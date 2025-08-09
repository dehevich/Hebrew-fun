import { useCallback } from 'react';

// Simple haptic feedback implementation for web
export const useHaptics = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' = 'light') => {
    // Vibration API for mobile devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 20, 10],
        error: [30, 50, 30],
        warning: [20, 30]
      };
      
      try {
        navigator.vibrate(patterns[type]);
      } catch (error) {
        // Silently fail if vibration is not supported
        console.log('Haptic feedback not supported');
      }
    }
    
    // For desktop, we can use a subtle audio feedback if needed
    // This is optional and can be enhanced later
  }, []);

  return { triggerHaptic };
};