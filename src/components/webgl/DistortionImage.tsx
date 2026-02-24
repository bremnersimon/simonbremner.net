import React, { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector2 } from 'three';
import * as THREE from 'three';

// Vertex shader - simple pass-through
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader with liquid/fluid distortion
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  
  varying vec2 vUv;

  // Noise function for organic distortion
  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  // Smooth noise
  float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(noise(i + vec2(0.0,0.0)), noise(i + vec2(1.0,0.0)), u.x),
      mix(noise(i + vec2(0.0,1.0)), noise(i + vec2(1.0,1.0)), u.x), 
      u.y
    );
  }
  
  // Fractal noise for more complex patterns
  float fractalNoise(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }

  void main() {
    vec2 st = vUv;
    
    // Distance from mouse position
    float dist = distance(st, uMouse);
    
    // Create a smooth falloff from mouse position
    float influence = smoothstep(0.8, 0.0, dist) * uHover;
    
    // Time-based animation for fluid motion
    float timeOffset = uTime * 0.5;
    
    // Multi-layered noise for complex liquid distortion
    vec2 noiseInput1 = st * 3.0 + vec2(timeOffset * 0.2, timeOffset * 0.15);
    vec2 noiseInput2 = st * 6.0 + vec2(-timeOffset * 0.1, timeOffset * 0.25);
    
    float noise1 = fractalNoise(noiseInput1);
    float noise2 = fractalNoise(noiseInput2);
    
    // Combine noise patterns for organic flow
    vec2 distortion = vec2(
      noise1 - 0.5,
      noise2 - 0.5
    ) * 0.1;
    
    // Add swirling motion near mouse
    float angle = atan(st.y - uMouse.y, st.x - uMouse.x);
    float radius = dist;
    
    vec2 swirl = vec2(
      -sin(angle + timeOffset) * radius,
      cos(angle + timeOffset) * radius  
    ) * 0.05;
    
    // Combine distortions with influence falloff
    vec2 finalDistortion = (distortion + swirl) * influence;
    
    // Apply distortion to texture coordinates
    vec2 distortedUv = st + finalDistortion;
    
    // Sample the texture with distorted coordinates
    vec4 color = texture2D(uTexture, distortedUv);
    
    // Add subtle color shift on hover for extra liquid effect
    if (uHover > 0.0) {
      float colorShift = influence * 0.1;
      color.rgb += vec3(colorShift * 0.2, colorShift * 0.1, -colorShift * 0.1);
    }
    
    gl_FragColor = color;
  }
`;

interface DistortionImageProps {
  url: string;
  aspect?: number[];
}

const DistortionImage: React.FC<DistortionImageProps> = ({ url, aspect = [1, 1] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const mouse = useRef(new Vector2(0.5, 0.5));
  const currentMouse = useRef(new Vector2(0.5, 0.5));
  const hoverValue = useRef(0);
  
  // Load texture
  const texture = useLoader(TextureLoader, url);
  
  // Create uniforms object directly (avoiding useMemo for now)
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uTexture: { value: texture },
    uResolution: { value: new Vector2(1, aspect[1] / aspect[0]) }
  });
  
  // Update texture when it changes
  if (uniformsRef.current.uTexture.value !== texture) {
    uniformsRef.current.uTexture.value = texture;
  }

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const uniforms = uniformsRef.current;
    
    // Update time
    uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth mouse interpolation
    currentMouse.current.lerp(mouse.current, 0.1);
    uniforms.uMouse.value.copy(currentMouse.current);
    
    // Smooth hover transition
    const targetHover = hovered ? 1 : 0;
    hoverValue.current += (targetHover - hoverValue.current) * 0.1;
    uniforms.uHover.value = hoverValue.current;
  });

  // Handle mouse events
  const handlePointerMove = (event: any) => {
    const rect = event.object.geometry.boundingBox;
    if (!rect) return;
    
    // Convert to UV coordinates
    const x = (event.uv.x);
    const y = 1 - (event.uv.y); // Flip Y for correct orientation
    
    mouse.current.set(x, y);
  };

  return (
    <mesh
      ref={meshRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <planeGeometry args={[aspect[0], aspect[1]]} />
      <shaderMaterial
        uniforms={uniformsRef.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={false}
      />
    </mesh>
  );
};

export default DistortionImage;