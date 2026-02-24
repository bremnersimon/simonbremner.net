import React, { useRef, useEffect, useState } from 'react';

interface DebugWebGLImageProps {
  src: string;
  alt: string;
  className?: string;
}

const DebugWebGLImage: React.FC<DebugWebGLImageProps> = ({ src, alt, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [debug, setDebug] = useState<string[]>([]);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addDebug = (message: string) => {
    setDebug(prev => [...prev.slice(-4), message]);
  };

  useEffect(() => {
    addDebug('🎯 useEffect triggered');
    
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      addDebug(`Canvas: ${canvas ? '✅' : '❌'}, Container: ${container ? '✅' : '❌'}`);
      
      if (!canvas || !container) {
        addDebug('❌ Canvas or container not found');
        setIsWebGLSupported(false);
        return;
      }

      addDebug('🎯 Starting WebGL setup...');

    // Get WebGL context
    const gl = canvas.getContext('webgl', { 
      antialias: true, 
      alpha: false,
      premultipliedAlpha: false 
    }) || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      addDebug('❌ WebGL not supported');
      setIsWebGLSupported(false);
      return;
    }

    addDebug('✅ WebGL context created');

    // Simplified shaders for debugging
    const vertexShaderSource = `
      attribute vec4 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_hover;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 st = v_texCoord;
        
        // Simple distortion for debugging
        float dist = distance(st, u_mouse);
        float ripple = sin(dist * 20.0 - u_time * 3.0) * 0.02 * u_hover * smoothstep(0.5, 0.0, dist);
        
        vec2 distortedUv = st + vec2(ripple, ripple);
        
        vec4 color = texture2D(u_texture, distortedUv);
        
        // Add color tint for debugging
        if (u_hover > 0.0) {
          color.rgb += vec3(0.1, 0.0, 0.1) * u_hover;
        }
        
        gl_FragColor = color;
      }
    `;

    // Helper functions
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) {
        addDebug('❌ Failed to create shader');
        return null;
      }
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        addDebug(`❌ Shader error: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      setIsWebGLSupported(false);
      return;
    }

    addDebug('✅ Shaders compiled');

    // Create program
    const program = gl.createProgram();
    if (!program) {
      addDebug('❌ Failed to create program');
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      addDebug(`❌ Program error: ${gl.getProgramInfoLog(program)}`);
      return;
    }

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const hoverLocation = gl.getUniformLocation(program, 'u_hover');

    // Create geometry
    const positions = new Float32Array([
      -1, -1,  1, -1,  -1,  1,
      -1,  1,  1, -1,   1,  1
    ]);

    const texCoords = new Float32Array([
      0, 1,  1, 1,  0, 0,
      0, 0,  1, 1,  1, 0
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    addDebug('✅ Buffers created');

    // Load image
    const image = new Image();
    
    // Try without CORS first
    image.onload = () => {
      addDebug('✅ Image loaded');
      
      // Resize canvas to container
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Create texture
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      setImageLoaded(true);
      addDebug('✅ Texture created');
      
      // Animation variables
      let startTime = Date.now();
      let mouseX = 0.5;
      let mouseY = 0.5;
      let hoverValue = 0;
      let isHovered = false;

      // Mouse events
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = 1 - (e.clientY - rect.top) / rect.height;
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseenter', () => {
        isHovered = true;
        addDebug('🖱️ Mouse entered');
      });
      canvas.addEventListener('mouseleave', () => {
        isHovered = false;
        addDebug('🖱️ Mouse left');
      });

      // Render loop
      function render() {
        const currentTime = (Date.now() - startTime) * 0.001;
        
        // Smooth hover transition
        const targetHover = isHovered ? 1 : 0;
        hoverValue += (targetHover - hoverValue) * 0.08;
        
        // Set viewport
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Use program
        gl.useProgram(program);
        
        // Set uniforms
        gl.uniform1f(timeLocation, currentTime);
        gl.uniform2f(mouseLocation, mouseX, mouseY);
        gl.uniform1f(hoverLocation, hoverValue);
        gl.uniform1i(textureLocation, 0);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Set up attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        requestAnimationFrame(render);
      }
      
      addDebug('🚀 Starting render loop');
      render();
    };

    image.onerror = () => {
      addDebug('❌ Image failed to load');
      setIsWebGLSupported(false);
    };

    // Load image
    image.src = src;
    
    }, 100); // 100ms delay
    
    return () => clearTimeout(timer);

  }, [src]);

  // Show debug info and fallback
  return (
    <div ref={containerRef} className={`${className} relative`}>
      {isWebGLSupported && imageLoaded ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      )}
      
      {/* Debug overlay */}
      <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs z-10">
        <div className="font-mono">
          {debug.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
        <div className="mt-1 text-yellow-300">
          WebGL: {isWebGLSupported ? '✅' : '❌'} | 
          Image: {imageLoaded ? '✅' : '⏳'}
        </div>
      </div>
    </div>
  );
};

export default DebugWebGLImage;