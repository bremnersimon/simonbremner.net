import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import DistortionImage from './DistortionImage';

// Test images - using placeholder images for now
const testImages = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/500?random=2', 
  'https://picsum.photos/400/700?random=3',
  'https://picsum.photos/400/550?random=4',
  'https://picsum.photos/400/650?random=5',
  'https://picsum.photos/400/480?random=6'
];

// Error boundary for WebGL failures
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('WebGL Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const WebGLTest: React.FC = () => {
  // Simple fallback for when WebGL fails
  const fallbackContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testImages.map((imageSrc, index) => (
        <div 
          key={index}
          className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
        >
          <img
            src={imageSrc}
            alt={`Test image ${index + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Liquid Distortion Effect Test</h2>
        <p className="text-sm text-muted-foreground">
          Hover over the images below to see the WebGL fluid distortion effect
        </p>
      </div>

      {/* Test Grid with WebGL Canvas */}
      <WebGLErrorBoundary fallback={fallbackContent}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testImages.map((imageSrc, index) => (
            <div 
              key={index}
              className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <Canvas
                camera={{ position: [0, 0, 1] }}
                className="w-full h-full"
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
                fallback={
                  <img
                    src={imageSrc}
                    alt={`Fallback image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                }
              >
                <Suspense fallback={null}>
                  <DistortionImage 
                    url={imageSrc}
                    aspect={[4, 5]}
                  />
                </Suspense>
              </Canvas>
            </div>
          ))}
        </div>
      </WebGLErrorBoundary>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-card rounded-lg text-sm text-card-foreground">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Effect: Liquid/Fluid distortion with noise-based displacement</li>
          <li>• Trigger: Mouse hover with smooth transitions</li>
          <li>• Performance: Desktop-optimized with 60fps target</li>
          <li>• Fallback: Plain images on WebGL-unsupported devices</li>
        </ul>
      </div>
    </div>
  );
};

export default WebGLTest;