import React, { useRef, useEffect, useState } from 'react';


interface FilmDistortionImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}


const FilmDistortionImage: React.FC<FilmDistortionImageProps> = ({ src, alt, width = 400, height = 400, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setStatus('No canvas');
      return;
    }

    let gl = canvas.getContext('webgl');
    if (!gl) {
      setStatus('WebGL not supported');
      return;
    }

    // Set canvas size based on props for natural aspect ratio
    canvas.width = width;
    canvas.height = height;

    // Vertex shader
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Chromatic aberration fragment shader
    const fragmentSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform vec2 u_mouse;
      uniform float u_hover;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        vec2 mouse = u_mouse;
        
        // Distance from mouse cursor
        float dist = distance(uv, mouse);
        
        // Create chromatic aberration radius around mouse
        float aberrationRadius = 0.25;
        float aberrationStrength = smoothstep(aberrationRadius, 0.0, dist) * u_hover * 0.002;
        
        // Sample RGB channels with slight offsets for chromatic aberration
        float r = texture2D(u_texture, uv + vec2(aberrationStrength, 0.0)).r;
        float g = texture2D(u_texture, uv).g;
        float b = texture2D(u_texture, uv - vec2(aberrationStrength, 0.0)).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    // Shader creation (same as before)
    function createShader(type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        setStatus('Shader error: ' + gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setStatus('Program error: ' + gl.getProgramInfoLog(program));
      return;
    }

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const hoverLocation = gl.getUniformLocation(program, 'u_hover');

    // Create buffers (same as before)
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
    image.crossOrigin = 'anonymous';
    
    let animationFrameId: number | null = null;
    let cleanup = false;

    image.onload = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Flip Y axis to fix upside down images
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      
      setStatus('Chromatic aberration ready!');
      setIsWorking(true);
      
      // Animation state
      let mouseX = 0.5;
      let mouseY = 0.5;
      let targetMouseX = 0.5;
      let targetMouseY = 0.5;
      let hoverValue = 0;
      let isHovered = false;

      // Smooth mouse tracking
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = (e.clientX - rect.left) / rect.width;
        targetMouseY = 1 - (e.clientY - rect.top) / rect.height;
      };
      
      canvas.onmouseenter = () => {
        isHovered = true;
        setStatus('Chromatic aberration active!');
      };
      
      canvas.onmouseleave = () => {
        isHovered = false;
        setStatus('Chromatic aberration ready!');
      };

      // Render loop
      function render() {
        if (cleanup) return;
        // Smooth mouse interpolation for fluid movement
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;
        
        // Smooth hover transition
        hoverValue += (isHovered ? 1 : 0 - hoverValue) * 0.08;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        
        // Set uniforms
        gl.uniform2f(mouseLocation, mouseX, mouseY);
        gl.uniform1f(hoverLocation, hoverValue);
        gl.uniform1i(textureLocation, 0);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        animationFrameId = requestAnimationFrame(render);
      }
      
      render();
    };
    
    image.onerror = () => {
      setStatus('Image failed to load');
    };
    
    image.src = src;

    // Cleanup function to stop animation and release context
    return () => {
      cleanup = true;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      // Remove canvas event listeners
      canvas.onmousemove = null;
      canvas.onmouseenter = null;
      canvas.onmouseleave = null;
      // Try to lose the WebGL context if possible
      // @ts-ignore
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) {
        // @ts-ignore
        ext.loseContext();
      }
      gl = null;
    };
  }, [src]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block cursor-crosshair cursor-hover"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'block',
        }}
      />
      {/* Status overlay removed */}
    </div>
  );
};

export default FilmDistortionImage;