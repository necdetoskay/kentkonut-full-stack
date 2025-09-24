import React, { useState, useEffect, useRef, useCallback } from 'react';

// Touch gesture types
export interface TouchGesture {
  type: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'pinch' | 'tap' | 'double-tap';
  distance?: number;
  velocity?: number;
  scale?: number;
  center?: { x: number; y: number };
}

// Touch gesture hook
export const useTouchGestures = (
  onGesture: (gesture: TouchGesture) => void,
  options: {
    swipeThreshold?: number;
    velocityThreshold?: number;
    pinchThreshold?: number;
    doubleTapDelay?: number;
  } = {}
) => {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.3,
    pinchThreshold = 0.1,
    doubleTapDelay = 300
  } = options;

  const [touches, setTouches] = useState<TouchList | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [startDistance, setStartDistance] = useState<number>(0);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [startCenter, setStartCenter] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    setTouches(e.touches);
    setStartTime(Date.now());

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setStartCenter({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setStartDistance(distance);
      
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setStartCenter({ x: centerX, y: centerY });
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (!touches || !startCenter) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - startTime;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startCenter.x;
      const deltaY = touch.clientY - startCenter.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      if (distance > swipeThreshold && velocity > velocityThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          onGesture({
            type: deltaX > 0 ? 'swipe-right' : 'swipe-left',
            distance,
            velocity
          });
        } else {
          onGesture({
            type: deltaY > 0 ? 'swipe-down' : 'swipe-up',
            distance,
            velocity
          });
        }
      }
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = currentDistance / startDistance;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        onGesture({
          type: 'pinch',
          scale,
          center: startCenter
        });
      }
    }
  }, [touches, startCenter, startTime, swipeThreshold, velocityThreshold, pinchThreshold, onGesture]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const currentTime = Date.now();
    const deltaTime = currentTime - startTime;

    if (e.touches.length === 0 && deltaTime < 300) {
      // Check for double tap
      if (currentTime - lastTapTime < doubleTapDelay) {
        onGesture({ type: 'double-tap' });
      } else {
        onGesture({ type: 'tap' });
      }
      setLastTapTime(currentTime);
    }

    setTouches(null);
    setStartCenter(null);
  }, [startTime, lastTapTime, doubleTapDelay, onGesture]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};

// Swipe navigation hook
export const useSwipeNavigation = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  options: {
    threshold?: number;
    velocityThreshold?: number;
  } = {}
) => {
  const { threshold = 50, velocityThreshold = 0.3 } = options;

  const handleGesture = useCallback((gesture: TouchGesture) => {
    if (gesture.type === 'swipe-left' && gesture.velocity && gesture.velocity > velocityThreshold) {
      onSwipeLeft();
    } else if (gesture.type === 'swipe-right' && gesture.velocity && gesture.velocity > velocityThreshold) {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight, velocityThreshold]);

  return useTouchGestures(handleGesture, { swipeThreshold: threshold, velocityThreshold });
};

// Pinch zoom hook
export const usePinchZoom = (
  onZoom: (scale: number, center: { x: number; y: number }) => void,
  options: {
    minScale?: number;
    maxScale?: number;
    threshold?: number;
  } = {}
) => {
  const { minScale = 0.5, maxScale = 3, threshold = 0.1 } = options;
  const [currentScale, setCurrentScale] = useState(1);

  const handleGesture = useCallback((gesture: TouchGesture) => {
    if (gesture.type === 'pinch' && gesture.scale && gesture.center) {
      const newScale = Math.max(minScale, Math.min(maxScale, currentScale * gesture.scale));
      setCurrentScale(newScale);
      onZoom(newScale, gesture.center);
    }
  }, [currentScale, minScale, maxScale, onZoom]);

  return useTouchGestures(handleGesture, { pinchThreshold: threshold });
};

// Mobile-friendly scroll hook
export const useMobileScroll = (
  onScroll: (direction: 'up' | 'down') => void,
  options: {
    threshold?: number;
    debounceDelay?: number;
  } = {}
) => {
  const { threshold = 10, debounceDelay = 100 } = options;
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback((e: Event) => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;

    if (Math.abs(deltaY) > threshold) {
      onScroll(deltaY > 0 ? 'down' : 'up');
      setLastScrollY(currentScrollY);
    }

    setIsScrolling(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, debounceDelay);
  }, [lastScrollY, threshold, debounceDelay, onScroll]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll]);

  return { isScrolling };
};

// Touch-friendly button hook
export const useTouchButton = (
  onClick: () => void,
  options: {
    hapticFeedback?: boolean;
    rippleEffect?: boolean;
  } = {}
) => {
  const { hapticFeedback = true, rippleEffect = true } = options;
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsPressed(true);
    
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (rippleEffect) {
      // Add ripple effect
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.touches[0].clientX - rect.left - size / 2;
      const y = e.touches[0].clientY - rect.top - size / 2;
      
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }, [hapticFeedback, rippleEffect]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return {
    isPressed,
    handleTouchStart,
    handleTouchEnd,
    handleClick
  };
};

// Mobile viewport hook
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportHeight(window.innerHeight);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return { isMobile, viewportHeight };
};

// CSS for ripple effect
export const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
