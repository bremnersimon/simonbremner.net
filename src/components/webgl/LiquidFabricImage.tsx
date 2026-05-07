import type React from "react";
import { useEffect, useRef, useState } from "react";

interface LiquidFabricImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	fillContainer?: boolean;
	style?: React.CSSProperties;
}

const LiquidFabricImage = ({
	src,
	alt,
	width,
	height,
	className = "",
	fillContainer = false,
	style = {},
}: LiquidFabricImageProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isReady, setIsReady] = useState(false);
	const [isReducedMotion, setIsReducedMotion] = useState(false);
	const [useStaticFallback, setUseStaticFallback] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setIsReducedMotion(mediaQuery.matches);
		update();

		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		if (isReducedMotion) {
			setUseStaticFallback(true);
			setIsReady(true);
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) return;

		setUseStaticFallback(false);
		setIsReady(false);

		let gl = canvas.getContext("webgl");
		if (!gl) {
			setUseStaticFallback(true);
			setIsReady(true);
			return;
		}

		const image = new Image();
		image.crossOrigin = "anonymous";

		let animationFrameId: number | null = null;
		let resizeObserver: ResizeObserver | null = null;
		let isDisposed = false;
		const startTime = performance.now();

		image.onload = () => {
			if (isDisposed || !gl) return;

			if (fillContainer && canvas.parentElement) {
				const containerRect = canvas.parentElement.getBoundingClientRect();
				canvas.width = containerRect.width;
				canvas.height = containerRect.height;
			} else {
				canvas.width = width || image.naturalWidth;
				canvas.height = height || image.naturalHeight;
			}

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
        uniform vec2 u_prevMouse;
        uniform float u_hover;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_imageSize;

        varying vec2 v_texCoord;

        vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageSize) {
          float canvasAspect = resolution.x / resolution.y;
          float imageAspect = imageSize.x / imageSize.y;
          vec2 scale = vec2(1.0);

          if (canvasAspect > imageAspect) {
            scale.y = canvasAspect / imageAspect;
          } else {
            scale.x = imageAspect / canvasAspect;
          }

          return (uv - 0.5) / scale + 0.5;
        }

        void main() {
          vec2 uv = coverUv(v_texCoord, u_resolution, u_imageSize);

          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }

          vec2 cursorDelta = u_mouse - u_prevMouse;
          float velocity = clamp(length(cursorDelta) * 36.0, 0.0, 1.0);

          vec2 toCursor = uv - u_mouse;
          float dist = length(toCursor);
          vec2 direction = dist > 0.0001 ? normalize(toCursor) : vec2(0.0);

          float radius = mix(0.36, 0.2, velocity);
          float influence = smoothstep(radius, 0.0, dist) * u_hover;

          float ripple = sin((dist * 32.0) - (u_time * 4.5));
          vec2 weave = vec2(
            sin((uv.y * 90.0) + (u_time * 1.7)),
            cos((uv.x * 85.0) - (u_time * 1.4))
          ) * 0.0009;

          vec2 flow = cursorDelta * influence * 0.08;
          vec2 displacement = direction * influence * (0.012 + velocity * 0.022) * ripple;
          displacement += weave * influence;
          displacement += flow;

          vec2 displacedUv = clamp(uv + displacement, 0.0, 1.0);
          vec3 color = texture2D(u_texture, displacedUv).rgb;

          float sheen = influence * (0.25 + 0.75 * (0.5 + 0.5 * ripple));
          color += vec3(0.035, 0.04, 0.045) * sheen;

          gl_FragColor = vec4(color, 1.0);
        }
      `;

			const createShader = (type: number, source: string) => {
				if (!gl) return null;
				const shader = gl.createShader(type);
				if (!shader) return null;

				gl.shaderSource(shader, source);
				gl.compileShader(shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					return null;
				}

				return shader;
			};

			const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
			const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
			if (!vertexShader || !fragmentShader || !gl) {
				setUseStaticFallback(true);
				setIsReady(true);
				return;
			}

			const program = gl.createProgram();
			if (!program) {
				setUseStaticFallback(true);
				setIsReady(true);
				return;
			}

			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				setUseStaticFallback(true);
				setIsReady(true);
				return;
			}

			const positionLocation = gl.getAttribLocation(program, "a_position");
			const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
			const textureLocation = gl.getUniformLocation(program, "u_texture");
			const mouseLocation = gl.getUniformLocation(program, "u_mouse");
			const prevMouseLocation = gl.getUniformLocation(program, "u_prevMouse");
			const hoverLocation = gl.getUniformLocation(program, "u_hover");
			const timeLocation = gl.getUniformLocation(program, "u_time");
			const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
			const imageSizeLocation = gl.getUniformLocation(program, "u_imageSize");

			const positions = new Float32Array([
				-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
			]);

			const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

			const positionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

			const texCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				image,
			);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

			let mouseX = 0.5;
			let mouseY = 0.5;
			let targetMouseX = 0.5;
			let targetMouseY = 0.5;
			let hoverValue = 0;
			let isHovered = false;

			canvas.onmousemove = (event) => {
				const rect = canvas.getBoundingClientRect();
				targetMouseX = (event.clientX - rect.left) / rect.width;
				targetMouseY = 1 - (event.clientY - rect.top) / rect.height;
			};

			canvas.onmouseenter = () => {
				isHovered = true;
			};

			canvas.onmouseleave = () => {
				isHovered = false;
			};

			const render = () => {
				if (!gl || isDisposed) return;

				const previousMouseX = mouseX;
				const previousMouseY = mouseY;

				mouseX += (targetMouseX - mouseX) * 0.14;
				mouseY += (targetMouseY - mouseY) * 0.14;
				hoverValue += ((isHovered ? 1 : 0) - hoverValue) * 0.08;

				gl.viewport(0, 0, canvas.width, canvas.height);
				gl.clear(gl.COLOR_BUFFER_BIT);
				gl.useProgram(program);

				if (mouseLocation) gl.uniform2f(mouseLocation, mouseX, mouseY);
				if (prevMouseLocation)
					gl.uniform2f(prevMouseLocation, previousMouseX, previousMouseY);
				if (hoverLocation) gl.uniform1f(hoverLocation, hoverValue);
				if (timeLocation)
					gl.uniform1f(timeLocation, (performance.now() - startTime) * 0.001);
				if (textureLocation) gl.uniform1i(textureLocation, 0);
				if (resolutionLocation)
					gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
				if (imageSizeLocation)
					gl.uniform2f(
						imageSizeLocation,
						image.naturalWidth,
						image.naturalHeight,
					);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);

				gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
				gl.enableVertexAttribArray(positionLocation);
				gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
				gl.enableVertexAttribArray(texCoordLocation);
				gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

				gl.drawArrays(gl.TRIANGLES, 0, 6);

				animationFrameId = requestAnimationFrame(render);
			};

			render();
			setIsReady(true);

			if (fillContainer && canvas.parentElement) {
				resizeObserver = new ResizeObserver(() => {
					if (!canvas.parentElement || !gl) return;
					const containerRect = canvas.parentElement.getBoundingClientRect();
					canvas.width = containerRect.width;
					canvas.height = containerRect.height;
					gl.viewport(0, 0, canvas.width, canvas.height);
				});
				resizeObserver.observe(canvas.parentElement);
			}
		};

		image.onerror = () => {
			setUseStaticFallback(true);
			setIsReady(true);
		};

		image.src = src;

		return () => {
			isDisposed = true;
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			canvas.onmousemove = null;
			canvas.onmouseenter = null;
			canvas.onmouseleave = null;

			if (gl) {
				const loseContextExt = gl.getExtension("WEBGL_lose_context");
				if (loseContextExt) {
					loseContextExt.loseContext();
				}
			}
			gl = null;
		};
	}, [src, width, height, fillContainer, isReducedMotion]);

	if (useStaticFallback) {
		return (
			<div
				className={`${className} transition-opacity duration-500 ${isReady ? "opacity-100" : "opacity-0"}`}
				style={{
					position: "relative",
					width: "100%",
					height: fillContainer ? "100%" : "auto",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<img
					src={src}
					alt={alt}
					width={width}
					height={height}
					className="block"
					style={{
						width: "100%",
						height: fillContainer ? "100%" : "auto",
						objectFit: fillContainer ? "cover" : "contain",
						...(style?.maxHeight && { maxHeight: style.maxHeight }),
						...(style?.maxWidth && { maxWidth: style.maxWidth }),
					}}
				/>
			</div>
		);
	}

	return (
		<div
			className={`${className} transition-opacity duration-700 ease-in-out ${
				isReady ? "opacity-100" : "opacity-0"
			}`}
			style={{
				position: "relative",
				width: "100%",
				height: fillContainer ? "100%" : "auto",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<canvas
				ref={canvasRef}
				className="block cursor-crosshair"
				style={{
					width: "100%",
					height: fillContainer ? "100%" : "auto",
					display: "block",
					objectFit: fillContainer ? "cover" : "contain",
					...(style?.maxHeight && { maxHeight: style.maxHeight }),
					...(style?.maxWidth && { maxWidth: style.maxWidth }),
				}}
			/>
		</div>
	);
};

export default LiquidFabricImage;
