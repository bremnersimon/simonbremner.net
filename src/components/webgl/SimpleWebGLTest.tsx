import React, { useEffect, useRef, useState } from 'react';
import FilmDistortionImage from './FilmDistortionImage';

// Test images
const testImages = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/500?random=2', 
  'https://picsum.photos/400/700?random=3',
];

// Simple Canvas-based distortion test
const SimpleWebGLTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Test WebGL support
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setIsWebGLSupported(false);
      return;
    }

    // Simple render loop for the test canvas
    let startTime = Date.now();
    function render() {
      const time = (Date.now() - startTime) * 0.001;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.2, 0.2, 0.3, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      requestAnimationFrame(render);
    }
    render();

  }, []);

  if (!isWebGLSupported) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">WebGL Not Supported</h3>
        <p className="text-red-600 dark:text-red-300 text-sm">
          Your browser doesn't support WebGL or it's disabled. The distortion effects will fall back to regular images.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">� Chromatic Aberration Effect</h2>
        <p className="text-sm text-muted-foreground">
          <strong>Mouse-responsive chromatic aberration</strong> - move your cursor over the images to see color separation.
        </p>
      </div>

      {/* Basic WebGL Canvas (verification) */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">WebGL Support Test</h3>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <canvas 
            ref={canvasRef}
            width={400}
            height={200}
            className="border border-gray-300 dark:border-gray-600 rounded"
          />
          <p className="text-sm text-muted-foreground mt-2">
            ☝️ Purple box = WebGL working
          </p>
        </div>
      </div>

      {/* Chromatic Aberration Images */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">🌈 Chromatic Aberration Gallery</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testImages.map((imageSrc, index) => (
            <div 
              key={index}
              className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md relative"
            >
              <FilmDistortionImage
                src={imageSrc}
                alt={`Chromatic aberration ${index + 1}`}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          � <strong>Move your mouse over the images</strong> to see:
          <br />
          • <strong>Chromatic aberration</strong> - red, green, blue color separation
          <br />
          • <strong>Smooth mouse tracking</strong> - effect follows your cursor
          <br />
          • <strong>Circular falloff</strong> - effect is strongest near cursor, fades outward
        </p>
      </div>

      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">� Chromatic Aberration Features</h4>
        <ul className="text-purple-600 dark:text-purple-300 text-sm space-y-1">
          <li>• <strong>Mouse-tracking effect</strong> - color separation follows cursor position</li>
          <li>• <strong>RGB channel separation</strong> - red and blue channels offset from green</li>
          <li>• <strong>Circular influence area</strong> - effect radius around cursor</li>
          <li>• <strong>Smooth transitions</strong> - effects fade in/out naturally on hover</li>
          <li>• <strong>Performance optimized</strong> - 60fps with minimal GPU load</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleWebGLTest;