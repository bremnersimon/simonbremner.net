import { useEffect, useRef, useState } from "react";

export type FluidImageItem = {
	href: string;
	src: string;
	logos?: readonly string[];
};

type FluidImageProps = {
	items: FluidImageItem[];
	activeHref: string | null;
	isVisible: boolean;
	className?: string;
};

// --- Cloth simulation tuning (adapted from twotwentytwo-studio/domgl-cloth) ---
// The demo's sheets swing from diagonal carousel movement; here the energy
// sources are the pointer brush, a gentle idle breeze and a wake impulse
// when the hovered link changes, since the menu image itself never travels.
const GRID_X = 25;
const GRID_Y = 31;
const CROWN = 1.8; // pinned radius (in cells) around the sheet's center
const SUBSTEPS = 3;
const CONSTRAINT_ITERATIONS = 2;
const STRUCT_STIFFNESS = 1.0;
const SHEAR_STIFFNESS = 0.6;
const BEND_STIFFNESS = 0.35;
const STARCH = 46; // spring back to the flat rest pose (per second^2, scaled by px)
const HOLD = 7; // velocity damping (per second)
const BREEZE = 360; // idle gust strength (px/s^2)
const SWAY = 55; // lateral in-plane wind sway (px/s^2)
const BRUSH_REACH = 0.42; // pointer brush radius as a fraction of sheet width
const BRUSH_PUSH = 26; // pointer velocity -> force coupling
const WAKE_KICK = 320; // z impulse when the active image changes (px/s)
const CROSSFADE_SECONDS = 0.65;
const CLOTH_INSET = 0; // free margin around the sheet so flapping edges stay visible
const MAX_DPR = 2;
const MAX_POINTER_SPEED = 3200;
const LOGO_BACKGROUND = "#f5f5f5";
const LOGO_CANVAS_SIZE = 768;
const LOGO_WIDTH = 300;
const LOGO_GAP = 80;
const LOGO_SPEED = 35;

const VERTEX_SHADER = `#version 300 es
in vec3 aPos;
in vec2 aUv;
uniform vec2 uResolution;
out vec2 vUv;
void main() {
	vUv = aUv;
	vec2 clip = (aPos.xy / uResolution) * 2.0 - 1.0;
	gl_Position = vec4(clip.x, -clip.y, clamp(-aPos.z * 0.0008, -0.9, 0.9), 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D uTexFrom;
uniform sampler2D uTexTo;
uniform float uProgress;
uniform vec2 uScaleFrom;
uniform vec2 uScaleTo;
in vec2 vUv;
out vec4 outColor;

vec2 coverUv(vec2 uv, vec2 scale) {
	return clamp((uv - 0.5) * scale + 0.5, 0.0, 1.0);
}

void main() {
	vec4 from = texture(uTexFrom, coverUv(vUv, uScaleFrom));
	vec4 to = texture(uTexTo, coverUv(vUv, uScaleTo));
	vec4 color = mix(from, to, uProgress);
	outColor = vec4(color.rgb, 1.0);
}`;

type TextureEntry = {
	texture: WebGLTexture;
	aspect: number;
	loaded: boolean;
};

type SimState = {
	current: string | null;
	from: string | null;
	to: string | null;
	progress: number;
	pointer: { x: number; y: number; vx: number; vy: number; seen: boolean };
	wake: number;
};

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, src);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("FluidImage shader error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function makePlaceholderTexture(gl: WebGL2RenderingContext): TextureEntry {
	const texture = gl.createTexture() as WebGLTexture;
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([0, 0, 0, 255]),
	);
	return { texture, aspect: 1, loaded: true };
}

function coverScale(meshAspect: number, imageAspect: number): [number, number] {
	return imageAspect > meshAspect
		? [meshAspect / imageAspect, 1]
		: [1, imageAspect / meshAspect];
}

/**
 * Cloth-simulated image, adapted from the Codrops "DomGL Cloth" demo
 * (twotwentytwo-studio/domgl-cloth): a verlet particle sheet with
 * structural / shear / bend constraints, pinned at its center so the free
 * edges flap. Rendered with plain WebGL2 (no deps); falls back to
 * crossfading <img> elements without WebGL2 and renders statically under
 * reduced motion.
 */
export const FluidImage = ({
	items,
	activeHref,
	isVisible,
	className,
}: FluidImageProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const visibleRef = useRef(isVisible);
	visibleRef.current = isVisible;
	const logoItem = items.find((item) => item.logos);
	const [logos, setLogos] = useState<HTMLImageElement[]>([]);
	const [fallbackLogo, setFallbackLogo] = useState<string | null>(null);
	const logosRef = useRef<HTMLImageElement[]>([]);
	logosRef.current = logos;
	const fallbackLogoRef = useRef(fallbackLogo);
	fallbackLogoRef.current = fallbackLogo;
	const stateRef = useRef<SimState>({
		current: null,
		from: null,
		to: null,
		progress: 1,
		pointer: { x: 0, y: 0, vx: 0, vy: 0, seen: false },
		wake: 0,
	});
	const [supported, setSupported] = useState(true);

	useEffect(() => {
		if (!logoItem?.logos) return;
		let disposed = false;
		const images = logoItem.logos.map((src) => {
			const image = new Image();
			const loaded = new Promise<HTMLImageElement | null>((resolve) => {
				image.onload = () => resolve(image);
				image.onerror = () => {
					console.error("FluidImage logo failed to load:", src);
					resolve(null);
				};
			});
			image.src = src;
			return { image, loaded };
		});
		void Promise.all(images.map(({ loaded }) => loaded)).then((results) => {
			if (disposed) return;
			const available = results.filter(
				(image): image is HTMLImageElement => image !== null,
			);
			setLogos(available);
			setFallbackLogo(
				available.length
					? available[Math.floor(Math.random() * available.length)].src
					: null,
			);
		});
		return () => {
			disposed = true;
			for (const { image } of images) {
				image.onload = null;
				image.onerror = null;
			}
		};
	}, [logoItem]);

	useEffect(() => {
		const state = stateRef.current;
		if (activeHref) {
			if (!state.current) {
				state.from = activeHref;
				state.to = activeHref;
				state.progress = 1;
				state.wake = 1; // unfurl when the sheet first appears
			} else if (activeHref !== state.current) {
				state.from = state.current;
				state.to = activeHref;
				state.progress = 0;
				state.wake = 1;
			}
			state.current = activeHref;
		}
	}, [activeHref]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const gl = canvas.getContext("webgl2", {
			alpha: true,
			antialias: true,
			premultipliedAlpha: true,
		});
		if (!gl) {
			setSupported(false);
			return;
		}

		const motionPreference = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		);
		let reducedMotion = motionPreference.matches;

		const logoCanvas = document.createElement("canvas");
		logoCanvas.width = LOGO_CANVAS_SIZE;
		logoCanvas.height = LOGO_CANVAS_SIZE;
		const logoContext = logoCanvas.getContext("2d");
		if (logoItem && !logoContext) {
			console.error("FluidImage could not create the logo canvas.");
			gl.getExtension("WEBGL_lose_context")?.loseContext();
			setSupported(false);
			return;
		}

		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fragmentShader = compileShader(
			gl,
			gl.FRAGMENT_SHADER,
			FRAGMENT_SHADER,
		);
		if (!vertexShader || !fragmentShader) {
			setSupported(false);
			return;
		}
		const program = gl.createProgram() as WebGLProgram;
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error("FluidImage link error:", gl.getProgramInfoLog(program));
			setSupported(false);
			return;
		}
		gl.useProgram(program);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		// --- Particle sheet ---
		const count = GRID_X * GRID_Y;
		const pos = new Float32Array(count * 3);
		const prev = new Float32Array(count * 3);
		const home = new Float32Array(count * 2); // flat rest pose (canvas px)
		const pinned = new Uint8Array(count);
		// 0 at the pinned center, 1 at the free corners: the wind grips the
		// loose edges hardest, like a flag held at its middle
		const edgeWeight = new Float32Array(count);
		const uvs = new Float32Array(count * 2);

		const halfI = (GRID_X - 1) / 2;
		const halfJ = (GRID_Y - 1) / 2;
		const farthest = Math.hypot(halfI, halfJ);
		for (let j = 0; j < GRID_Y; j++) {
			for (let i = 0; i < GRID_X; i++) {
				const k = j * GRID_X + i;
				uvs[k * 2] = i / (GRID_X - 1);
				uvs[k * 2 + 1] = j / (GRID_Y - 1);
				const di = i - halfI;
				const dj = j - halfJ;
				const ring = Math.hypot(di, dj);
				pinned[k] = ring <= CROWN ? 1 : 0;
				edgeWeight[k] = Math.min(1, ring / farthest);
			}
		}

		// Constraints: structural, shear and bend links (as in the demo's sim)
		const linkA: number[] = [];
		const linkB: number[] = [];
		const linkKind: number[] = []; // 0 struct, 1 shear, 2 bend
		const addLink = (
			i0: number,
			j0: number,
			i1: number,
			j1: number,
			kind: number,
		) => {
			if (i1 < 0 || i1 >= GRID_X || j1 >= GRID_Y) return;
			linkA.push(j0 * GRID_X + i0);
			linkB.push(j1 * GRID_X + i1);
			linkKind.push(kind);
		};
		for (let j = 0; j < GRID_Y; j++) {
			for (let i = 0; i < GRID_X; i++) {
				addLink(i, j, i + 1, j, 0);
				addLink(i, j, i, j + 1, 0);
				addLink(i, j, i + 1, j + 1, 1);
				addLink(i, j, i - 1, j + 1, 1);
				addLink(i, j, i + 2, j, 2);
				addLink(i, j, i, j + 2, 2);
			}
		}
		const linkCount = linkA.length;
		const restLength = new Float32Array(linkCount);
		const stiffness = Float32Array.from(linkKind, (kind) =>
			kind === 0
				? STRUCT_STIFFNESS
				: kind === 1
					? SHEAR_STIFFNESS
					: BEND_STIFFNESS,
		);

		let sheetW = 1;
		let sheetH = 1;
		let originX = 0;
		let originY = 0;

		// (Re)build rest pose from the current canvas CSS size
		const layout = () => {
			const cssW = canvas.clientWidth || 1;
			const cssH = canvas.clientHeight || 1;
			sheetW = cssW * (1 - CLOTH_INSET * 2);
			sheetH = cssH * (1 - CLOTH_INSET * 2);
			originX = cssW * CLOTH_INSET;
			originY = cssH * CLOTH_INSET;
			for (let j = 0; j < GRID_Y; j++) {
				for (let i = 0; i < GRID_X; i++) {
					const k = j * GRID_X + i;
					home[k * 2] = originX + (i / (GRID_X - 1)) * sheetW;
					home[k * 2 + 1] = originY + (j / (GRID_Y - 1)) * sheetH;
					pos[k * 3] = home[k * 2];
					pos[k * 3 + 1] = home[k * 2 + 1];
					pos[k * 3 + 2] = 0;
				}
			}
			prev.set(pos);
			const dx = sheetW / (GRID_X - 1);
			const dy = sheetH / (GRID_Y - 1);
			for (let l = 0; l < linkCount; l++) {
				const a = linkA[l];
				const b = linkB[l];
				const ix = (a % GRID_X) - (b % GRID_X);
				const iy = Math.floor(a / GRID_X) - Math.floor(b / GRID_X);
				restLength[l] = Math.hypot(ix * dx, iy * dy);
			}
		};

		// --- GPU buffers ---
		const indices: number[] = [];
		for (let j = 0; j < GRID_Y - 1; j++) {
			for (let i = 0; i < GRID_X - 1; i++) {
				const k = j * GRID_X + i;
				indices.push(k, k + GRID_X, k + 1, k + 1, k + GRID_X, k + GRID_X + 1);
			}
		}
		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices),
			gl.STATIC_DRAW,
		);

		const posBuffer = gl.createBuffer();
		const uvBuffer = gl.createBuffer();
		const aPos = gl.getAttribLocation(program, "aPos");
		const aUv = gl.getAttribLocation(program, "aUv");

		gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(aUv);
		gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

		const uniforms = {
			resolution: gl.getUniformLocation(program, "uResolution"),
			texFrom: gl.getUniformLocation(program, "uTexFrom"),
			texTo: gl.getUniformLocation(program, "uTexTo"),
			progress: gl.getUniformLocation(program, "uProgress"),
			scaleFrom: gl.getUniformLocation(program, "uScaleFrom"),
			scaleTo: gl.getUniformLocation(program, "uScaleTo"),
		};

		// --- Textures ---
		const placeholder = makePlaceholderTexture(gl);
		const textures = new Map<string, TextureEntry>();
		for (const item of items) {
			const texture = gl.createTexture() as WebGLTexture;
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 0, 255]),
			);
			const entry: TextureEntry = { texture, aspect: 1, loaded: false };
			textures.set(item.href, entry);
			if (item.logos) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				continue;
			}
			const image = new Image();
			image.onload = () => {
				entry.aspect = image.naturalWidth / image.naturalHeight;
				gl.bindTexture(gl.TEXTURE_2D, texture);
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
				entry.loaded = true;
			};
			image.src = item.src;
		}

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
			const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
			const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
				gl.viewport(0, 0, width, height);
			}
			layout();
		};
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);
		resize();
		const onMotionPreferenceChange = () => {
			reducedMotion = motionPreference.matches;
			if (reducedMotion) layout();
		};
		motionPreference.addEventListener("change", onMotionPreferenceChange);

		// --- Pointer brush ---
		let lastPointerTime = 0;
		const onPointerMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const now = performance.now();
			const pointer = stateRef.current.pointer;
			if (pointer.seen && lastPointerTime) {
				const dt = Math.max((now - lastPointerTime) / 1000, 1 / 240);
				const vx = (x - pointer.x) / dt;
				const vy = (y - pointer.y) / dt;
				const speed = Math.hypot(vx, vy);
				const limit = speed > MAX_POINTER_SPEED ? MAX_POINTER_SPEED / speed : 1;
				pointer.vx = vx * limit;
				pointer.vy = vy * limit;
			}
			pointer.x = x;
			pointer.y = y;
			pointer.seen = true;
			lastPointerTime = now;
		};
		window.addEventListener("pointermove", onPointerMove, { passive: true });

		// --- Simulation step (verlet + constraint relaxation) ---
		let time = 0;
		const step = (dt: number) => {
			const state = stateRef.current;
			const pointer = state.pointer;
			const h = dt / SUBSTEPS;
			const hh = h * h;
			const reach = sheetW * BRUSH_REACH;
			const brushSpeed = Math.hypot(pointer.vx, pointer.vy);

			// Wake impulse: radial z-kick that unfurls outward from the pin
			if (state.wake > 0) {
				const midX = originX + sheetW / 2;
				const midY = originY + sheetH / 2;
				const far = Math.hypot(sheetW, sheetH) / 2;
				for (let k = 0; k < count; k++) {
					if (pinned[k]) continue;
					const fall =
						Math.hypot(pos[k * 3] - midX, pos[k * 3 + 1] - midY) / far;
					prev[k * 3 + 2] =
						pos[k * 3 + 2] +
						WAKE_KICK * dt * Math.sin(fall * Math.PI) * state.wake;
				}
				state.wake = 0;
			}

			for (let s = 0; s < SUBSTEPS; s++) {
				time += h;
				const damp = Math.max(0, 1 - HOLD * h);
				// Slowly varying gust strength so the wind breathes rather than hums
				const gust =
					0.55 +
					0.45 * Math.sin(time * 0.6) * Math.sin(time * 0.23 + 1.7) +
					0.25 * Math.sin(time * 1.1 + 0.6);
				for (let k = 0; k < count; k++) {
					const k3 = k * 3;
					if (pinned[k]) {
						pos[k3] = home[k * 2];
						pos[k3 + 1] = home[k * 2 + 1];
						pos[k3 + 2] = 0;
						prev[k3] = pos[k3];
						prev[k3 + 1] = pos[k3 + 1];
						prev[k3 + 2] = pos[k3 + 2];
						continue;
					}
					const x = pos[k3];
					const y = pos[k3 + 1];
					const z = pos[k3 + 2];

					// Spring back to the flat rest pose (the demo's "starch")
					let ax = (home[k * 2] - x) * STARCH;
					let ay = (home[k * 2 + 1] - y) * STARCH;
					let az = -z * STARCH;

					// Flag-in-the-wind idle breeze: a travelling wave with gusty
					// amplitude that grips the free edges hardest
					const grip = 0.3 + 0.7 * edgeWeight[k];
					az +=
						BREEZE *
						grip *
						gust *
						(Math.sin(x * 0.013 - time * 2.1 + y * 0.005) +
							0.6 * Math.sin(y * 0.017 + time * 1.4 + x * 0.004));
					// Gentle in-plane sway so the silhouette flutters too
					ax += SWAY * edgeWeight[k] * Math.sin(time * 0.8 + y * 0.012);
					ay +=
						SWAY * 0.7 * edgeWeight[k] * Math.sin(time * 0.66 + x * 0.01 + 2.0);

					// Pointer brush with distance falloff
					if (pointer.seen && brushSpeed > 1) {
						const dist = Math.hypot(x - pointer.x, y - pointer.y);
						if (dist < reach) {
							const fall = 1 - dist / reach;
							ax += pointer.vx * BRUSH_PUSH * fall;
							ay += pointer.vy * BRUSH_PUSH * fall;
							az -= brushSpeed * BRUSH_PUSH * 0.9 * fall;
						}
					}

					const nx = x + (x - prev[k3]) * damp + ax * hh;
					const ny = y + (y - prev[k3 + 1]) * damp + ay * hh;
					const nz = z + (z - prev[k3 + 2]) * damp + az * hh;
					prev[k3] = x;
					prev[k3 + 1] = y;
					prev[k3 + 2] = z;
					pos[k3] = nx;
					pos[k3 + 1] = ny;
					pos[k3 + 2] = nz;
				}

				for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
					for (let l = 0; l < linkCount; l++) {
						const a = linkA[l];
						const b = linkB[l];
						const a3 = a * 3;
						const b3 = b * 3;
						const dx = pos[b3] - pos[a3];
						const dy = pos[b3 + 1] - pos[a3 + 1];
						const dz = pos[b3 + 2] - pos[a3 + 2];
						const dist = Math.hypot(dx, dy, dz) || 1e-6;
						const diff = ((dist - restLength[l]) / dist) * stiffness[l];
						const wa = pinned[a] ? 0 : 1;
						const wb = pinned[b] ? 0 : 1;
						const total = wa + wb;
						if (total === 0) continue;
						const sa = (0.5 * diff * (2 * wa)) / total;
						const sb = (0.5 * diff * (2 * wb)) / total;
						pos[a3] += dx * sa;
						pos[a3 + 1] += dy * sa;
						pos[a3 + 2] += dz * sa;
						pos[b3] -= dx * sb;
						pos[b3 + 1] -= dy * sb;
						pos[b3 + 2] -= dz * sb;
					}
				}
			}

			// Pointer velocity decays between events
			pointer.vx *= 0.82;
			pointer.vy *= 0.82;
		};

		// --- Render loop ---
		let frame = 0;
		let lastFrame = 0;
		let logoOffset = 0;
		const render = (now: number) => {
			const state = stateRef.current;
			const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 1 / 30) : 0;
			lastFrame = now;

			if (!reducedMotion && dt > 0) {
				step(dt);
				if (state.progress < 1) {
					state.progress = Math.min(1, state.progress + dt / CROSSFADE_SECONDS);
				}
			} else {
				state.progress = 1;
			}
			const logoEntry = logoItem && textures.get(logoItem.href);
			if (
				logoItem &&
				logoEntry &&
				logoContext &&
				visibleRef.current &&
				(state.to === logoItem.href ||
					(state.progress < 1 && state.from === logoItem.href))
			) {
				const images = logosRef.current;
				logoContext.fillStyle = LOGO_BACKGROUND;
				logoContext.fillRect(0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
				if (reducedMotion) {
					const image = images.find(
						(item) => item.src === fallbackLogoRef.current,
					);
					if (image) {
						const height = (LOGO_WIDTH * image.naturalHeight) / image.naturalWidth;
						logoContext.drawImage(
							image,
							(LOGO_CANVAS_SIZE - LOGO_WIDTH) / 2,
							(LOGO_CANVAS_SIZE - height) / 2,
							LOGO_WIDTH,
							height,
						);
					}
				} else if (images.length > 0) {
					const stride = LOGO_WIDTH + LOGO_GAP;
					const cycle = images.length * stride;
					logoOffset = (logoOffset + dt * LOGO_SPEED) % cycle;
					for (let x = -logoOffset; x < LOGO_CANVAS_SIZE; x += cycle) {
						for (let i = 0; i < images.length; i++) {
							const image = images[i];
							const height = (LOGO_WIDTH * image.naturalHeight) / image.naturalWidth;
							logoContext.drawImage(
								image,
								x + i * stride,
								(LOGO_CANVAS_SIZE - height) / 2,
								LOGO_WIDTH,
								height,
							);
						}
					}
				}
				gl.bindTexture(gl.TEXTURE_2D, logoEntry.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logoCanvas);
				logoEntry.loaded = true;
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);

			const fromEntry = (state.from && textures.get(state.from)) || placeholder;
			const toEntry = (state.to && textures.get(state.to)) || placeholder;
			const meshAspect = sheetW / Math.max(1, sheetH);

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.uniform2f(
				uniforms.resolution,
				canvas.clientWidth || 1,
				canvas.clientHeight || 1,
			);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(
				gl.TEXTURE_2D,
				fromEntry.loaded ? fromEntry.texture : placeholder.texture,
			);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(
				gl.TEXTURE_2D,
				toEntry.loaded ? toEntry.texture : placeholder.texture,
			);
			gl.uniform1i(uniforms.texFrom, 0);
			gl.uniform1i(uniforms.texTo, 1);
			gl.uniform1f(uniforms.progress, state.progress);
			gl.uniform2f(
				uniforms.scaleFrom,
				...coverScale(meshAspect, fromEntry.aspect),
			);
			gl.uniform2f(uniforms.scaleTo, ...coverScale(meshAspect, toEntry.aspect));

			gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
			frame = requestAnimationFrame(render);
		};
		frame = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			motionPreference.removeEventListener("change", onMotionPreferenceChange);
			window.removeEventListener("pointermove", onPointerMove);
			for (const entry of textures.values()) {
				gl.deleteTexture(entry.texture);
			}
			gl.deleteTexture(placeholder.texture);
			gl.deleteBuffer(posBuffer);
			gl.deleteBuffer(uvBuffer);
			gl.deleteBuffer(indexBuffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		};
	}, [items, logoItem]);

	if (!supported) {
		// Plain crossfading images when WebGL2 is unavailable
		return (
			<div className={`relative ${className ?? ""}`}>
				{items.map((item) => (
					<div
						key={item.href}
						className={`absolute inset-0 transition-opacity duration-500 ${
							item.href === activeHref ? "opacity-100" : "opacity-0"
						}`}
					>
						{item.logos ? (
							<div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: LOGO_BACKGROUND }}>
								{fallbackLogo && <img src={fallbackLogo} alt="" aria-hidden="true" className="w-[39%]" />}
							</div>
						) : (
							<img src={item.src} alt="" aria-hidden="true" className="h-full w-full object-cover" />
						)}
					</div>
				))}
			</div>
		);
	}

	return (
		<canvas
			ref={canvasRef}
			className={`block h-full w-full ${className ?? ""}`}
		/>
	);
};
