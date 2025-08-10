import { useEffect, useRef, useCallback } from 'react';

interface TouchHandlers {
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const useTouchOptimization = (
  elementRef: React.RefObject<HTMLElement | null>, // Changed this line to allow null
  handlers: TouchHandlers = {},
  enabled: boolean = true
) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    handlers.onTouchStart?.(e);
  }, [handlers, enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    // Prevent scrolling during touch interactions
    e.preventDefault();

    handlers.onTouchMove?.(e);
  }, [handlers, enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touchEnd = e.changedTouches[0];
    const touchStart = touchStartRef.current;
    
    const deltaX = touchEnd.clientX - touchStart.x;
    const deltaY = touchEnd.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Minimum distance and time for swipe
    const minDistance = 50;
    const maxTime = 500;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance && deltaTime < maxTime) {
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minDistance && deltaTime < maxTime) {
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }

    touchStartRef.current = null;
    handlers.onTouchEnd?.(e);
  }, [handlers, enabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);
};

export const preventBodyScroll = (prevent: boolean) => {
  if (prevent) {
    document.body.classList.add('game-active');
  } else {
    document.body.classList.remove('game-active');
  }
};