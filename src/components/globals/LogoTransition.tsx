import { useEffect, useState } from "react";

type LogoTransitionProps = {
	onComplete?: () => void;
};

// Timings for the play-once sequence (ms)
const FADE_IN_MS = 150;
const HOLD_FULL_MS = 350;
const COLLAPSE_MS = 500;
const HOLD_COMPACT_MS = 150;
const FADE_MS = 300;

// Expo-out: fast start that glides smoothly to rest
const FLUID_EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

type Phase = "enter" | "full" | "compact" | "fade" | "done";

/**
 * Standalone page-transition animation based on the navbar wordmark.
 * Plays once: fades in "Simon Bremner." centered fullscreen, collapses it
 * to "SB.", then fades the overlay out. Remount (e.g. via a React key)
 * to replay.
 */
export const LogoTransition = ({ onComplete }: LogoTransitionProps) => {
	const [phase, setPhase] = useState<Phase>("enter");

	useEffect(() => {
		// Brief delay so the opacity-0 start state paints before fading in
		const timeouts = [
			window.setTimeout(() => setPhase("full"), 20),
			window.setTimeout(() => setPhase("compact"), FADE_IN_MS + HOLD_FULL_MS),
			window.setTimeout(
				() => setPhase("fade"),
				FADE_IN_MS + HOLD_FULL_MS + COLLAPSE_MS + HOLD_COMPACT_MS,
			),
			window.setTimeout(
				() => setPhase("done"),
				FADE_IN_MS + HOLD_FULL_MS + COLLAPSE_MS + HOLD_COMPACT_MS + FADE_MS,
			),
		];
		return () => {
			for (const timeout of timeouts) {
				window.clearTimeout(timeout);
			}
		};
	}, []);

	useEffect(() => {
		if (phase === "done") onComplete?.();
	}, [phase, onComplete]);

	if (phase === "done") return null;

	const isCompact = phase === "compact" || phase === "fade";

	// Same grid-collapse technique as the Navbar wordmark
	const wordmarkTailClass = `grid transition-[grid-template-columns,opacity] duration-[500ms] ${FLUID_EASE} motion-reduce:transition-none ${
		isCompact ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100"
	}`;

	return (
		<div
			aria-hidden="true"
			className={`bg-background pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-[300ms] ease-out motion-reduce:transition-none ${
				phase === "fade" ? "opacity-0" : "opacity-100"
			}`}
		>
			<span
				className={`flex text-[clamp(2.5rem,10vw,7rem)] font-bold transition-opacity duration-[150ms] ease-out motion-reduce:transition-none ${
					phase === "enter" ? "opacity-0" : "opacity-100"
				}`}
			>
				S
				<span className={wordmarkTailClass}>
					<span className="min-w-0 overflow-hidden whitespace-pre">
						{"imon "}
					</span>
				</span>
				B
				<span className={wordmarkTailClass}>
					<span className="min-w-0 overflow-hidden whitespace-pre">remner</span>
				</span>
				<span className="text-primary font-bold">.</span>
			</span>
		</div>
	);
};
