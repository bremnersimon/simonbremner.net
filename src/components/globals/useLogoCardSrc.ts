import { useEffect, useState } from "react";

const CARD_WIDTH = 800;
const CARD_HEIGHT = 1000;
const FONT_FAMILY = '"Lato", ui-sans-serif, system-ui, sans-serif';

function readColor(variable: string, fallback: string) {
	const value = getComputedStyle(document.documentElement)
		.getPropertyValue(variable)
		.trim();
	return value || fallback;
}

async function drawLogoCard() {
	const fontSize = 300;
	const font = `700 ${fontSize}px ${FONT_FAMILY}`;
	try {
		await document.fonts.load(font, "SB.");
	} catch {
		// Fall back to whatever font is available
	}

	const canvas = document.createElement("canvas");
	canvas.width = CARD_WIDTH;
	canvas.height = CARD_HEIGHT;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	const foreground = readColor("--foreground", "#111");
	const background = readColor("--background", "#fff");
	const primary = readColor("--primary", "#ea580c");

	ctx.fillStyle = foreground;
	ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

	ctx.font = font;
	ctx.textBaseline = "alphabetic";
	const letters = "SB";
	const lettersWidth = ctx.measureText(letters).width;
	const dotWidth = ctx.measureText(".").width;
	const metrics = ctx.measureText(`${letters}.`);
	const x = (CARD_WIDTH - (lettersWidth + dotWidth)) / 2;
	const y =
		CARD_HEIGHT / 2 +
		(metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;

	ctx.fillStyle = background;
	ctx.fillText(letters, x, y);
	ctx.fillStyle = primary;
	ctx.fillText(".", x + lettersWidth, y);

	return canvas.toDataURL("image/png");
}

/**
 * Renders the "SB." logo card (background-colored letters with a primary
 * dot on a foreground-colored rectangle) to a data URL, regenerating it
 * whenever the light/dark theme class changes.
 */
export function useLogoCardSrc() {
	const [src, setSrc] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		const render = () => {
			drawLogoCard().then((url) => {
				if (!cancelled && url) setSrc(url);
			});
		};
		render();
		const observer = new MutationObserver(render);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => {
			cancelled = true;
			observer.disconnect();
		};
	}, []);

	return src;
}
