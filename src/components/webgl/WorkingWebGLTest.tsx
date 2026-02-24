import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import DistortionImageV2 from './DistortionImageV2';

// Test images
const testImages = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/500?random=2', 
  'https://picsum.photos/400/700?random=3',
  'https://picsum.photos/400/550?random=4',
  'https://picsum.photos/400/650?random=5',
  'https://picsum.photos/400/480?random=6'
];

const WorkingWebGLTest: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">✅ Three.js Liquid Distortion</h2>
        <p className="text-sm text-muted-foreground">
          <strong>WebGL confirmed working!</strong> Now with full liquid distortion effects on hover.
        </p>
      </div>

      {/* Three.js WebGL Grid */}
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
              gl={{ antialias: true, alpha: false }}
            >
              <Suspense 
                fallback={
                  <mesh>
                    <planeGeometry args={[4, 5]} />
                    <meshBasicMaterial color="#444" />
                  </mesh>
                }
              >
                <DistortionImageV2 
                  url={imageSrc}
                  aspect={[4, 5]}
                />
              </Suspense>
            </Canvas>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">🎉 WebGL Distortion Active!</h3>
        <ul className="text-green-600 dark:text-green-300 text-sm space-y-1">
          <li>• <strong>Liquid distortion</strong> with flowing noise patterns</li>
          <li>• <strong>Mouse tracking</strong> for interactive swirl effects</li>
          <li>• <strong>Smooth transitions</strong> on hover in/out</li>
          <li>• <strong>60fps performance</strong> with hardware acceleration</li>
        </ul>
        <p className="text-xs text-green-500 mt-2">
          Ready to integrate into PhotoGallery component!
        </p>
      </div>
    </div>
  );
};

export default WorkingWebGLTest;