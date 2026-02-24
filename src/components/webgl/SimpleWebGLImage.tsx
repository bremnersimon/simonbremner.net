import React, { useRef, useEffect, useState } from 'react';

interface SimpleWebGLImageProps {
  src: string;
  alt: string;
  className?: string;
}

const SimpleWebGLImage: React.FC<SimpleWebGLImageProps> = ({ src, alt, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setStatus('No canvas');
      return;
    }

    setStatus('Getting WebGL context...');
    
    const gl = canvas.getContext('webgl');
    if (!gl) {
      setStatus('WebGL not supported');
      return;
    }

    setStatus('WebGL context OK');

    // Set canvas size
    canvas.width = 400;
    canvas.height = 500;

    // Simple vertex shader
    const vertexSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    // Simple fragment shader with basic distortion
    const fragmentSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_hover;
      varying vec2 v_texCoord;
      
      void main() {
        vec2 uv = v_texCoord;
        
        // Simple wave distortion
        if (u_hover > 0.0) {
          float wave = sin(uv.y * 10.0 + u_time * 2.0) * 0.02 * u_hover;
          uv.x += wave;
        }
        
        vec4 color = texture2D(u_texture, uv);
        
        // Add red tint on hover for debugging
        if (u_hover > 0.0) {
          color.r += 0.3 * u_hover;
        }
        
        gl_FragColor = color;
      }
    `;

    // Create shader function
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

    setStatus('Shaders compiled');

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setStatus('Program error: ' + gl.getProgramInfoLog(program));
      return;
    }

    setStatus('Program linked');

    // Get locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
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

    setStatus('Buffers created');

    // Load image
    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = () => {
      setStatus('Image loaded - creating texture');
      
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      
      setStatus('Texture created - starting render');
      setIsWorking(true);
      
      // Animation state
      let startTime = Date.now();
      let mouseX = 0.5;
      let mouseY = 0.5;
      let hoverValue = 0;
      let isHovered = false;

      // Mouse events
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = 1 - (e.clientY - rect.top) / rect.height;
      };
      
      canvas.onmouseenter = () => {
        isHovered = true;
        setStatus('Mouse entered - should see red tint!');
      };
      
      canvas.onmouseleave = () => {
        isHovered = false;
        setStatus('Mouse left');
      };

      // Render loop
      function render() {
        const time = (Date.now() - startTime) * 0.001;
        
        // Smooth hover
        hoverValue += (isHovered ? 1 : 0 - hoverValue) * 0.1;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        gl.useProgram(program);
        
        // Set uniforms
        gl.uniform1f(timeLocation, time);
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
        
        requestAnimationFrame(render);
      }
      
      render();
    };
    
    image.onerror = () => {
      setStatus('Image failed to load');
    };
    
    setStatus('Loading image...');
    image.src = src;

  }, [src]);

  return (
    <div className={className}>
      <canvas 
        ref={canvasRef}
        className="w-full h-full block"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      
      {/* Status overlay */}
      <div className="absolute top-2 left-2 bg-black/90 text-white text-xs p-2 rounded font-mono">
        <div>{status}</div>
        <div className="text-green-400">Working: {isWorking ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default SimpleWebGLImage;