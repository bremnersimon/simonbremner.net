import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector2, Clock } from 'three';
import * as THREE from 'three';

interface DistortionImageProps {
  url: string;
  aspect?: [number, number];
}

const DistortionImage: React.FC<DistortionImageProps> = ({ url, aspect = [1, 1] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const mouseRef = useRef(new Vector2(0.5, 0.5));
  const targetMouseRef = useRef(new Vector2(0.5, 0.5));
  const hoverValueRef = useRef(0);

  // Load texture
  const texture = useLoader(TextureLoader, url);

  // Vertex shader
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader with liquid distortion
  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    
    varying vec2 vUv;

    // Simple noise function
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
    
    void main() {
      vec2 st = vUv;
      
      // Distance from mouse
      float dist = distance(st, uMouse);
      float influence = smoothstep(0.7, 0.0, dist) * uHover * 0.8;
      
      // Time-based liquid motion
      float time = uTime * 0.3;
      
      // Create flowing liquid distortion
      vec2 noiseInput = st * 4.0 + vec2(time * 0.2, time * 0.15);
      float noiseValue = smoothNoise(noiseInput) - 0.5;
      
      // Swirl effect near mouse
      float angle = atan(st.y - uMouse.y, st.x - uMouse.x);
      vec2 swirl = vec2(
        cos(angle + time + noiseValue) * dist,
        sin(angle + time + noiseValue) * dist
      ) * 0.03;
      
      // Combine effects
      vec2 distortion = swirl * influence;
      vec2 finalUv = st + distortion;
      
      // Sample texture with distorted coordinates
      vec4 color = texture2D(uTexture, finalUv);
      
      // Add subtle color shift on hover
      if (uHover > 0.0) {
        float colorShift = influence * 0.15;
        color.rgb += vec3(colorShift * 0.1, colorShift * 0.05, -colorShift * 0.05);
      }
      
      gl_FragColor = color;
    }
  `;

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uTexture: { value: texture },
    uResolution: { value: new Vector2(aspect[0], aspect[1]) }
  }), [texture, aspect]);

  // Animation frame
  useFrame((state) => {
    if (!meshRef.current) return;

    // Update time
    uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth mouse interpolation
    mouseRef.current.lerp(targetMouseRef.current, 0.08);
    uniforms.uMouse.value.copy(mouseRef.current);
    
    // Smooth hover transition
    const targetHover = hovered ? 1 : 0;
    hoverValueRef.current += (targetHover - hoverValueRef.current) * 0.08;
    uniforms.uHover.value = hoverValueRef.current;
  });

  // Mouse move handler
  const handlePointerMove = (event: any) => {
    if (event.uv) {
      targetMouseRef.current.set(event.uv.x, 1 - event.uv.y);
    }
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
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={false}
      />
    </mesh>
  );
};

export default DistortionImage;