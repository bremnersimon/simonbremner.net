import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isVisible: boolean;
}

// Global cursor state for persistence across page transitions
let globalCursorState: CursorState = {
  x: 0,
  y: 0,
  isHovering: false,
  isVisible: false,
};

// Expose global state to window for external access
if (typeof window !== 'undefined') {
  window.globalCursorState = globalCursorState;
}

const CustomCursor: React.FC = () => {
  const [cursor, setCursor] = useState<CursorState>(globalCursorState);
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Sync local state with global state
  useEffect(() => {
    setCursor(globalCursorState);
  }, []);

  // Update global state whenever local state changes
  useEffect(() => {
    globalCursorState = cursor;
  }, [cursor]);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        const newState = { 
          ...globalCursorState, 
          x: e.clientX, 
          y: e.clientY,
          isVisible: true 
        };
        globalCursorState = newState;
        setCursor(newState);
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the element or its parent has interactive class/attributes
      const isInteractive = target.closest('.cursor-hover, button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      
      if (isInteractive) {
        const newState = { ...globalCursorState, isHovering: true };
        globalCursorState = newState;
        setCursor(newState);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // Check if we're moving to a non-interactive element
      const isLeavingInteractive = target.closest('.cursor-hover, button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      const isEnteringInteractive = relatedTarget?.closest?.('.cursor-hover, button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      
      if (isLeavingInteractive && !isEnteringInteractive) {
        const newState = { ...globalCursorState, isHovering: false };
        globalCursorState = newState;
        setCursor(newState);
      }
    };

    const handleMouseLeaveWindow = () => {
      const newState = { ...globalCursorState, isVisible: false };
      globalCursorState = newState;
      setCursor(newState);
    };

    const handleMouseEnterWindow = () => {
      const newState = { ...globalCursorState, isVisible: true };
      globalCursorState = newState;
      setCursor(newState);
    };

    // View Transitions API support
    const handleViewTransition = () => {
      // Maintain cursor state during transitions
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '1';
      }
    };

    // Mouse move tracking
    document.addEventListener('mousemove', updateCursor);
    
    // Hover detection using mouseover/mouseout (these bubble unlike mouseenter/mouseleave)
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    // Visibility tracking
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    // View transition events
    document.addEventListener('astro:page-load', handleViewTransition);
    document.addEventListener('astro:after-swap', handleViewTransition);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
      document.removeEventListener('astro:page-load', handleViewTransition);
      document.removeEventListener('astro:after-swap', handleViewTransition);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`
        fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference
        transition-all duration-200 ease-out origin-center
      `}
      style={{
        transform: `translate(${cursor.x}px, ${cursor.y}px) translate(-50%, -50%)`,
        willChange: 'transform',
        viewTransitionName: 'custom-cursor',
      }}
    >
      <div
        className={`
          hidden md:flex min-w-8 min-h-8 rounded-full border border-white/50
          bg-background/10 backdrop-blur-sm
          flex items-center justify-center
          transition-all duration-200 ease-out 
          ${cursor.isVisible ? 'opacity-100' : 'opacity-0'}
          ${cursor.isHovering ? 'w-16 h-16 bg-background/20' : 'w-8 h-8'}
        `}
      >
        {cursor.isHovering && (
          <Plus 
            className="w-3 h-3 text-white transition-all duration-200 ease-out" 
            strokeWidth={2}
          />
        )}
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    globalCursorState: CursorState;
  }
}

export default CustomCursor;