import React, { useRef, useEffect, useState } from 'react';

interface BasicCanvasTestProps {
  src: string;
  alt: string;
  className?: string;
}

const BasicCanvasTest: React.FC<BasicCanvasTestProps> = ({ src, alt, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Starting...');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkCanvas = () => {
      attempts++;
      const canvas = canvasRef.current;
      
      if (!canvas) {
        setStatus(`Trying... ${attempts}/${maxAttempts}`);
        if (attempts < maxAttempts) {
          setTimeout(checkCanvas, 100);
        } else {
          setStatus('❌ Canvas failed');
          setWorking(false);
        }
        return;
      }

      setStatus('Canvas OK! Loading...');
      
      // Simple 2D canvas test
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setStatus('❌ No context');
        return;
      }
      
      // Set canvas size
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width || 400;
        canvas.height = rect.height || 300;
      }
      
      // Load and draw image
      const img = new Image();
      
      img.onload = () => {
        setStatus('✅ Image loaded');
        
        // Clear and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        setStatus('✅ Canvas Ready');
        setWorking(true);
        
        // Simple hover effect
        let isHovered = false;
        
        canvas.onmouseenter = () => {
          isHovered = true;
          setStatus('🎨 Hover Effect');
          canvas.style.filter = 'sepia(0.3) contrast(1.2)';
        };
        
        canvas.onmouseleave = () => {
          isHovered = false;
          setStatus('✅ Canvas Ready');
          canvas.style.filter = 'none';
        };
      };
      
      img.onerror = () => {
        setStatus('❌ Image failed');
        console.error('Failed to load:', src);
      };
      
      img.src = src;
    };
    
    // Start checking for canvas
    checkCanvas();
    
  }, [src]);

  return (
    <div className={`${className} relative`}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full block cursor-pointer"
      />
      
      <div className={`absolute top-1 left-1 text-white text-xs px-1 py-0.5 font-mono ${
        working ? 'bg-green-600' : 'bg-red-600'
      }`}>
        {status}
      </div>
      
      {/* Fallback image (hidden by default) */}
      {!working && (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
};

export default BasicCanvasTest;