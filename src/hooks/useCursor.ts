import { useCallback, useEffect, useState } from 'react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isVisible: boolean;
}

// Global cursor state (this is the same instance used in CustomCursor)
declare let globalCursorState: CursorState;

/**
 * Hook to interact with the global cursor state
 * Can be used by other components to trigger cursor states
 */
export const useCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    isHovering: false,
    isVisible: false,
  });

  // Sync with global state
  useEffect(() => {
    const syncState = () => {
      if (typeof window !== 'undefined' && window.globalCursorState) {
        setCursorState(window.globalCursorState);
      }
    };

    syncState();
    
    // Poll for changes (could be improved with a more sophisticated state management system)
    const interval = setInterval(syncState, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, []);

  const setHovering = useCallback((hovering: boolean) => {
    if (typeof window !== 'undefined' && window.globalCursorState) {
      window.globalCursorState.isHovering = hovering;
    }
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    if (typeof window !== 'undefined' && window.globalCursorState) {
      window.globalCursorState.isVisible = visible;
    }
  }, []);

  const setPosition = useCallback((x: number, y: number) => {
    if (typeof window !== 'undefined' && window.globalCursorState) {
      window.globalCursorState.x = x;
      window.globalCursorState.y = y;
    }
  }, []);

  return {
    cursorState,
    setHovering,
    setVisible,
    setPosition,
  };
};

// Utility function to easily trigger cursor hover states
export const triggerCursorHover = (hovering: boolean = true) => {
  if (typeof window !== 'undefined' && window.globalCursorState) {
    window.globalCursorState.isHovering = hovering;
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    globalCursorState: CursorState;
  }
}