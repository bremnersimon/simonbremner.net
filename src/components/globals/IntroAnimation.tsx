import { useEffect, useLayoutEffect, useState } from "react";
import { LogoTransition } from "./LogoTransition";

const STORAGE_KEY = "intro-played";

const markPlayed = () => {
	try {
		sessionStorage.setItem(STORAGE_KEY, "1");
	} catch {
		// Storage unavailable (private mode, blocked) — play anyway
	}
};

const clearPendingCover = () => {
	document.documentElement.removeAttribute("data-intro");
};

/**
 * Plays the LogoTransition opening animation once per browser tab session.
 * Skipped entirely on subsequent full loads (sessionStorage gate), on
 * ClientRouter navigations (mounted with transition:persist), and for
 * users who prefer reduced motion.
 */
export const IntroAnimation = () => {
	const [play, setPlay] = useState(false);

	useEffect(() => {
		let alreadyPlayed = false;
		try {
			alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) !== null;
		} catch {
			// Storage unavailable — treat as not played
		}

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		markPlayed();
		if (alreadyPlayed || reducedMotion) {
			clearPendingCover();
			return;
		}
		setPlay(true);
	}, []);

	// Remove the static anti-flash cover only once the React overlay has
	// committed (before paint), so the handoff between the two is seamless.
	useLayoutEffect(() => {
		if (play) clearPendingCover();
	}, [play]);

	if (!play) return null;

	return <LogoTransition onComplete={() => setPlay(false)} />;
};
