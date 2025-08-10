import { useEffect } from 'react';

export const useMobileBackButton = (
  onBack: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      onBack();
      
      // Push a new state to prevent browser back navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Initialize history state
    window.history.pushState(null, '', window.location.pathname);

    // Add event listener
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [onBack, enabled]);
};