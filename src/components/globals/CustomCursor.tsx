import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isVisible: boolean;
}

const CustomCursor: React.FC = () => {
  const [cursor, setCursor] = useState<CursorState>({
    x: 0,
    y: 0,
    isHovering: false,
    isVisible: false,
  });

  useEffect(() => {
    let animationFrame: number;

    const updateCursor = (e: MouseEvent) => {
      animationFrame = requestAnimationFrame(() => {
        setCursor(prev => ({ 
          ...prev, 
          x: e.clientX, 
          y: e.clientY,
          isVisible: true 
        }));
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the element or its parent has interactive class/attributes
      const isInteractive = target.closest('.cursor-hover, button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      
      if (isInteractive) {
        setCursor(prev => ({ ...prev, isHovering: true }));
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // Check if we're moving to a non-interactive element
      const isLeavingInteractive = target.closest('.cursor-hover, button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      const isEnteringInteractive = relatedTarget?.closest?.('.cursor-hover, button, a, [role="button"], [tabindex]:not([tabindex="-1"])');
      
      if (isLeavingInteractive && !isEnteringInteractive) {
        setCursor(prev => ({ ...prev, isHovering: false }));
      }
    };

    const handleMouseLeaveWindow = () => {
      setCursor(prev => ({ ...prev, isVisible: false }));
    };

    const handleMouseEnterWindow = () => {
      setCursor(prev => ({ ...prev, isVisible: true }));
    };

    // Mouse move tracking
    document.addEventListener('mousemove', updateCursor);
    
    // Hover detection using mouseover/mouseout (these bubble unlike mouseenter/mouseleave)
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    // Visibility tracking
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, []);

  return (
    <div
      className={`
        fixed top-0 left-0 pointer-events-none z-100
        transition-all duration-200 ease-out origin-center -translate-1/2
        
      `}
      style={{
        transform: `translate(${cursor.x}px , ${cursor.y}px)`,
        willChange: 'transform',
      }}
    >
      <div
        className={`
         min-w-8 min-h-8 rounded-full border border-white/50
          backdrop-blur-xs bg-background/10
          flex items-center justify-center
          transition-all duration-200 ease-out 
          ${cursor.isVisible ? 'opacity-100' : 'opacity-0'}
        ${cursor.isHovering ? 'w-16 h-16' : 'w-8 h-8'}
        `}
      >
        {cursor.isHovering && (
          <Plus 
            className="w-3 h-3 text-white transition-opacity duration-200" 
            strokeWidth={2}
          />
        )}
      </div>
    </div>
  );
};

export default CustomCursor;