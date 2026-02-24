import React, { useRef, useEffect, useState } from 'react';

interface WebGLPhotoProps {
  photo: {
    _id: string;
    image: {
      thumbnail: string;
      alt: string;
    };
    altText: string;
  };
  isInView: boolean;
  className?: string;
  onLoad?: () => void;
}

const WebGLPhoto: React.FC<WebGLPhotoProps> = ({ photo, isInView, className = '', onLoad }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useWebGL, setUseWebGL] = useState(true); // Back to true for WebGL

  // Debug logging  
  // console.log(`WebGLPhoto ${photo._id}:`, {
  //   isInView,
  //   useWebGL,
  //   isLoaded,
  //   thumbnail: photo.image.thumbnail
  // });

  useEffect(() => {
    if (!isInView) {
      return;
    }

    // Small delay to ensure canvas is mounted
    const timer = setTimeout(() => {
      if (!canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!container) {
        return;
      }

      // Test WebGL support
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setUseWebGL(false);
        return;
      }

      // Set canvas size to match container
      const updateCanvasSize = () => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);
        }
      };

      updateCanvasSize();

    // Simple shaders
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform vec2 u_mouse;
      uniform float u_hover;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse;
        
        float dist = distance(uv, mouse);
        float aberrationStrength = smoothstep(0.25, 0.0, dist) * u_hover * 0.006;
        
        float r = texture2D(u_texture, uv + vec2(aberrationStrength, 0.0)).r;
        float g = texture2D(u_texture, uv).g;
        float b = texture2D(u_texture, uv - vec2(aberrationStrength, 0.0)).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    // Create shaders and program
    function createShader(type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      setUseWebGL(false);
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setUseWebGL(false);
      return;
    }

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const hoverLocation = gl.getUniformLocation(program, 'u_hover');

    // Create buffers
    const positions = new Float32Array([
      -1, -1,   1, -1,   -1,  1,
      -1,  1,   1, -1,    1,  1
    ]);

    const texCoords = new Float32Array([
      0, 0,   1, 0,   0, 1,
      0, 1,   1, 0,   1, 1
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Load image
    const image = new Image();
    // Remove crossOrigin for development - Sanity CDN blocks localhost CORS
    // image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      // Create texture
      const texture = gl.createTexture();
      if (!texture) {
        setUseWebGL(false);
        return;
      }
      
      try {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      } catch (securityError) {
        // WebGL security error with cross-origin images - fall back to regular image
        console.log('WebGL CORS security error, falling back to regular image');
        setUseWebGL(false);
        return;
      }
      
      setIsLoaded(true);
      onLoad?.();
      
      // Animation state
      let mouseX = 0.5;
      let mouseY = 0.5;
      let targetMouseX = 0.5;
      let targetMouseY = 0.5;
      let hoverValue = 0;
      let isHovered = false;
      let animationId: number;

      // Mouse events
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
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;
        hoverValue += (isHovered ? 1 : 0 - hoverValue) * 0.08;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        
        gl.uniform2f(mouseLocation, mouseX, mouseY);
        gl.uniform1f(hoverLocation, hoverValue);
        gl.uniform1i(textureLocation, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationId = requestAnimationFrame(render);
      }
      
      render();
      
      // Cleanup
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseenter', handleMouseEnter);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        cancelAnimationFrame(animationId);
      };
    };
    
    image.onerror = () => {
      setUseWebGL(false);
    };
    
    // Set image source
    image.src = photo.image.thumbnail;

    }, 100); // Close the setTimeout callback with 100ms delay

    return () => clearTimeout(timer);
  }, [isInView, photo.image.thumbnail]);

  // Fallback to regular image
  if (!useWebGL) {
    return (
      <img
        src={photo.image.thumbnail}
        alt={photo.altText}
        className={`${className} transition-all duration-300 group-hover:scale-105`}
        loading="lazy"
        onLoad={onLoad}
      />
    );
  }

  // Don't render anything if not in view
  if (!isInView) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
    );
  }

  return (
    <div ref={containerRef} className={`${className} relative`}>
      {isInView ? (
        <>
          <canvas ref={canvasRef} className="w-full h-full block" />
          {!isLoaded && <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />}
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
};

export default WebGLPhoto;