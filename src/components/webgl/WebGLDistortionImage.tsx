import React, { useRef, useEffect, useState } from 'react';

interface WebGLDistortionImageProps {
  src: string;
  alt: string;
  className?: string;
}

const WebGLDistortionImage: React.FC<WebGLDistortionImageProps> = ({ src, alt, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setIsWebGLSupported(false);
      return;
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec4 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
      }
    `;

    // Fragment shader with liquid distortion
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_hover;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;
      
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
        vec2 st = v_texCoord;
        
        // Distance from mouse
        float dist = distance(st, u_mouse);
        float influence = smoothstep(0.8, 0.0, dist) * u_hover * 0.6;
        
        // Time-based liquid motion
        float time = u_time * 0.4;
        
        // Create flowing liquid distortion
        vec2 noiseInput = st * 3.0 + vec2(time * 0.15, time * 0.1);
        float noiseValue = smoothNoise(noiseInput) - 0.5;
        
        // Swirl effect near mouse
        float angle = atan(st.y - u_mouse.y, st.x - u_mouse.x);
        vec2 swirl = vec2(
          cos(angle + time + noiseValue) * dist,
          sin(angle + time + noiseValue) * dist
        ) * 0.04;
        
        // Combine effects
        vec2 distortion = swirl * influence;
        vec2 finalUv = st + distortion;
        
        // Sample texture
        vec4 color = texture2D(u_texture, finalUv);
        
        // Add subtle color shift on hover
        if (u_hover > 0.0) {
          float colorShift = influence * 0.1;
          color.rgb += vec3(colorShift * 0.15, colorShift * 0.08, -colorShift * 0.05);
        }
        
        gl_FragColor = color;
      }
    `;

    // Helper functions
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    }

    function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
      }

      return program;
    }

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      setIsWebGLSupported(false);
      return;
    }

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      setIsWebGLSupported(false);
      return;
    }

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const hoverLocation = gl.getUniformLocation(program, 'u_hover');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    // Create buffers
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);

    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      0, 0,
      1, 1,
      1, 0
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Load image and create texture
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      // Resize canvas to match container
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      
      setImageLoaded(true);
      
      // Animation state
      let startTime = Date.now();
      let mouseX = 0.5;
      let mouseY = 0.5;
      let targetMouseX = 0.5;
      let targetMouseY = 0.5;
      let hoverValue = 0;
      let isHovered = false;

      // Mouse event handlers
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left) / rect.width;
        targetMouseY = 1 - (e.clientY - rect.top) / rect.height;
      };

      const handleMouseEnter = () => {
        isHovered = true;
      };

      const handleMouseLeave = () => {
        isHovered = false;
      };

      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);

      // Render loop
      function render() {
        const currentTime = (Date.now() - startTime) * 0.001;
        
        // Smooth mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
        
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
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
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
      
      render();
      
      // Cleanup
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
    };

    image.onerror = () => {
      setIsWebGLSupported(false);
    };

    image.src = src;

  }, [src]);

  // Fallback to regular image if WebGL not supported or not loaded
  if (!isWebGLSupported || !imageLoaded) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} transition-all duration-300 hover:scale-105`}
        style={{ aspectRatio: 'auto' }}
      />
    );
  }

  return (
    <div ref={containerRef} className={`${className} relative`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ aspectRatio: 'auto' }}
      />
    </div>
  );
};

export default WebGLDistortionImage;