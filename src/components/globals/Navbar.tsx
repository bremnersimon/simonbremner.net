import {
	isTransitionBeforePreparationEvent,
	isTransitionBeforeSwapEvent,
	navigate,
} from "astro:transitions/client";
import acfpLogo from "@/assets/clients/acfp.svg?url";
import deviceMagicLogo from "@/assets/clients/devicemagic.svg?url";
import momentfeedLogo from "@/assets/clients/momentfeed.svg?url";
import payorsightLogo from "@/assets/clients/payorsight.svg?url";
import galleryImage from "@/assets/main-og-image.jpg";
import aboutImage from "@/assets/sb-headshot.jpg";
import { FluidImage } from "@/components/globals/FluidImage";
import { ThemeToggle } from "@/components/globals/ThemeToggle";
import { useLogoCardSrc } from "@/components/globals/useLogoCardSrc";
import {
	type NavigationLinkProps,
	navigationLinks,
} from "@/utils/navigationLinks";
import type { ImageMetadata } from "astro";
import {
	AnimatePresence,
	animate,
	motion,
	useMotionValue,
	useReducedMotion,
} from "motion/react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const wordmarkScrollThreshold = 64;

function isLinkActive(pathname: string, href: string) {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

const portfolioLogos = [
	acfpLogo,
	deviceMagicLogo,
	momentfeedLogo,
	payorsightLogo,
];

// Placeholder images for the menu hover effect; "/" uses the generated logo card
const menuImages: Record<string, ImageMetadata> = {
	"/gallery": galleryImage,
	"/about": aboutImage,
};

function buildMenuImageItems(logoCardSrc: string | null) {
	return navigationLinks
		.map((link) => ({
			href: link.href,
			logos: link.href === "/portfolio" ? portfolioLogos : undefined,
			src:
				link.href === "/"
					? (logoCardSrc ?? "")
					: (menuImages[link.href]?.src ?? ""),
		}))
		.filter((item) => item.src !== "" || item.logos);
}

// Expo-out: fast start that glides smoothly to rest
const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const LEAVE_DURATION = 0.45;
const LEAVE_STAGGER = 0.05;

const overlayVariants = {
	closed: {
		clipPath: "inset(0 0 100% 0)",
		transition: {
			duration: 0.6,
			ease: EXPO_EASE,
			when: "afterChildren",
			staggerChildren: 0.08,
			staggerDirection: -1,
		},
	},
	open: {
		clipPath: "inset(0 0 0% 0)",
		transition: {
			duration: 0.6,
			ease: EXPO_EASE,
			when: "beforeChildren",
			staggerChildren: 0.08,
			delayChildren: 0.05,
		},
	},
	// Navigating: the overlay stays solid (hiding the old page) while the
	// links animate out; it's revealed once the new page has swapped in
	leaving: {
		clipPath: "inset(0 0 0% 0)",
		transition: { staggerChildren: LEAVE_STAGGER, staggerDirection: -1 },
	},
	reveal: {
		opacity: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
} as const;

// How long hover/focus lingers after the pointer leaves the link text or image
const HOVER_CLEAR_DELAY_MS = 500;

const linkVariants = {
	closed: {
		y: "115%",
		opacity: 0,
		transition: {
			y: { duration: 0.6, ease: EXPO_EASE },
			opacity: { duration: 0.4, ease: "easeIn" },
		},
	},
	open: {
		y: "0%",
		opacity: 1,
		transition: {
			y: { duration: 0.7, ease: EXPO_EASE },
			opacity: { duration: 0.5, ease: "easeOut" },
		},
	},
	leaving: {
		y: "115%",
		opacity: 0,
		transition: {
			y: { duration: LEAVE_DURATION, ease: [0.7, 0, 0.84, 0] },
			opacity: { duration: LEAVE_DURATION * 0.8, ease: "easeIn" },
		},
	},
} as const;

const reducedOverlayVariants = {
	closed: { opacity: 0, transition: { duration: 0.2 } },
	open: { opacity: 1, transition: { duration: 0.2 } },
	leaving: { opacity: 1 },
	reveal: { opacity: 0, transition: { duration: 0.2 } },
} as const;

const reducedLinkVariants = {
	closed: { opacity: 0 },
	open: { opacity: 1 },
	leaving: { opacity: 0, transition: { duration: 0.2 } },
} as const;

type MenuIconProps = {
	isOpen: boolean;
};

type MenuNavigation = {
	href: string;
	started: boolean;
	swapped: boolean;
};

// Hamburger: three lines with a primary-colored dot ending the last
// (shorter) line; the outer lines morph into an X when the menu is open.
const MenuIcon = ({ isOpen }: MenuIconProps) => {
	const lineBase =
		"absolute left-0 h-[2px] rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none";
	return (
		<span aria-hidden="true" className="relative block h-3.5 w-6">
			<span
				className={`${lineBase} w-6 ${
					isOpen ? "top-1.5 rotate-45" : "top-0 rotate-0"
				}`}
			/>
			<span
				className={`${lineBase} top-1.5 w-6 ${
					isOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
				}`}
			/>
			<span
				className={`${lineBase} ${
					isOpen ? "top-1.5 w-6 -rotate-45" : "top-3 w-4.25 rotate-0"
				}`}
			/>
			<span
				className={`absolute left-5 top-3 h-1 w-1 -translate-y-px rounded-full bg-primary transition-all duration-300 ${
					isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
				}`}
			/>
		</span>
	);
};

export const Navbar = () => {
	// Navbar is a persisted island (transition:persist), so it isn't
	// remounted on client-side navigation; re-read the path after each swap.
	const [currentPath, setCurrentPath] = useState("");
	const [isWordmarkCompact, setIsWordmarkCompact] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	// True from a menu-link click until the new page is revealed
	const [isNavigating, setIsNavigating] = useState(false);
	const menuNavigationRef = useRef<MenuNavigation | null>(null);
	const [hoveredHref, setHoveredHref] = useState<string | null>(null);
	const [displayedHref, setDisplayedHref] = useState<string | null>(null);
	const imageX = useMotionValue(0);
	const imageY = useMotionValue(0);
	const imageOpacity = useMotionValue(0);
	const navRef = useRef<HTMLElement | null>(null);
	// Pending hover-out; hover persists briefly so the cursor can travel to the image
	const hoverClearTimerRef = useRef<number | null>(null);
	// True when the next image position change should snap instead of spring
	const snapImageRef = useRef(true);
	// Fluid image is desktop-only; skip mounting (and loading) it on mobile
	const [isDesktop, setIsDesktop] = useState(false);
	const prefersReducedMotion = useReducedMotion();
	const logoCardSrc = useLogoCardSrc();
	// Memoized: FluidImage rebuilds its GL scene whenever items change
	const menuImageItems = useMemo(
		() => buildMenuImageItems(logoCardSrc),
		[logoCardSrc],
	);

	useEffect(() => {
		const updateWordmark = () => {
			setIsWordmarkCompact(window.scrollY > wordmarkScrollThreshold);
		};
		const updatePage = () => {
			setCurrentPath(window.location.pathname);
			updateWordmark();
			setIsMenuOpen(false);
			setHoveredHref(null);
			if (menuNavigationRef.current?.swapped) {
				menuNavigationRef.current = null;
				setIsNavigating(false);
			}
		};
		const beforePreparation = (event: Event) => {
			if (!isTransitionBeforePreparationEvent(event)) return;
			const pending = menuNavigationRef.current;
			if (!pending) return;
			if (event.info !== pending) {
				menuNavigationRef.current = null;
				setIsNavigating(false);
				return;
			}
			event.signal.addEventListener(
				"abort",
				() => {
					if (menuNavigationRef.current === pending) {
						menuNavigationRef.current = null;
						setIsNavigating(false);
					}
				},
				{ once: true },
			);
		};
		const beforeSwap = (event: Event) => {
			if (!isTransitionBeforeSwapEvent(event)) return;
			const pending = menuNavigationRef.current;
			if (pending && event.info === pending) {
				pending.swapped = true;
				event.viewTransition.skipTransition();
			}
		};

		updatePage();
		window.addEventListener("scroll", updateWordmark, { passive: true });
		window.addEventListener("pageshow", updateWordmark);
		document.addEventListener("astro:page-load", updatePage);
		document.addEventListener("astro:before-preparation", beforePreparation);
		document.addEventListener("astro:before-swap", beforeSwap);
		return () => {
			window.removeEventListener("scroll", updateWordmark);
			window.removeEventListener("pageshow", updateWordmark);
			document.removeEventListener("astro:page-load", updatePage);
			document.removeEventListener(
				"astro:before-preparation",
				beforePreparation,
			);
			document.removeEventListener("astro:before-swap", beforeSwap);
			menuNavigationRef.current = null;
		};
	}, []);

	// Track the md breakpoint for the desktop-only fluid image
	useEffect(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		const update = () => setIsDesktop(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	// Body scroll lock + Escape to close while the takeover is open
	useEffect(() => {
		if (!isMenuOpen && !isNavigating) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsMenuOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isMenuOpen, isNavigating]);

	// Exiting AnimatePresence content keeps firing hover events (links slide
	// under the cursor), so gate hover updates on the live open state
	const isMenuOpenRef = useRef(isMenuOpen);
	isMenuOpenRef.current = isMenuOpen;

	const cancelHoverClear = useCallback(() => {
		if (hoverClearTimerRef.current !== null) {
			window.clearTimeout(hoverClearTimerRef.current);
			hoverClearTimerRef.current = null;
		}
	}, []);

	const scheduleHoverClear = useCallback(() => {
		cancelHoverClear();
		hoverClearTimerRef.current = window.setTimeout(() => {
			hoverClearTimerRef.current = null;
			setHoveredHref(null);
		}, HOVER_CLEAR_DELAY_MS);
	}, [cancelHoverClear]);

	useEffect(() => cancelHoverClear, [cancelHoverClear]);

	useLayoutEffect(() => {
		if (isMenuOpen && hoveredHref) return;
		imageX.stop();
		imageY.stop();
		snapImageRef.current = true;
	}, [hoveredHref, imageX, imageY, isMenuOpen]);

	useEffect(
		() => () => {
			imageX.stop();
			imageY.stop();
		},
		[imageX, imageY],
	);

	const closeMenu = useCallback(() => {
		isMenuOpenRef.current = false;
		cancelHoverClear();
		setIsMenuOpen(false);
		setHoveredHref(null);
	}, [cancelHoverClear]);

	// Pin the hover image just right of the hovered link's text
	const handleLinkHover = useCallback(
		(
			event:
				| React.MouseEvent<HTMLAnchorElement>
				| React.FocusEvent<HTMLAnchorElement>,
			href: string,
		) => {
			if (!isMenuOpenRef.current) return;
			cancelHoverClear();
			setHoveredHref(href);
			setDisplayedHref(href);
			const nav = navRef.current;
			if (!nav) return;
			const navRect = nav.getBoundingClientRect();
			const rect = event.currentTarget.getBoundingClientRect();
			const x = rect.right - navRect.left + 24;
			const y = rect.top - navRect.top + rect.height / 2;
			if (
				prefersReducedMotion ||
				(snapImageRef.current && imageOpacity.get() < 0.01)
			) {
				imageX.set(x);
				imageY.set(y);
			} else {
				const spring = {
					type: "spring",
					stiffness: 170,
					damping: 24,
					mass: 0.9,
				} as const;
				animate(imageX, x, spring);
				animate(imageY, y, spring);
			}
			snapImageRef.current = false;
		},
		[cancelHoverClear, imageOpacity, imageX, imageY, prefersReducedMotion],
	);

	const handleLinkClick = useCallback(
		(event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
			// The current page isn't navigable from the menu
			if (isLinkActive(window.location.pathname, href)) {
				event.preventDefault();
				return;
			}
			// Let modified clicks (new tab etc.) behave natively
			if (
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey ||
				event.button !== 0
			) {
				return;
			}
			event.preventDefault();
			if (menuNavigationRef.current) return;
			menuNavigationRef.current = { href, started: false, swapped: false };
			setIsNavigating(true);
			closeMenu();
		},
		[closeMenu],
	);

	const handleMenuAnimationComplete = useCallback((definition: unknown) => {
		const pending = menuNavigationRef.current;
		if (definition !== "leaving" || !pending || pending.started) return;
		pending.started = true;
		void navigate(pending.href, { info: pending }).catch((error: unknown) => {
			console.error("Menu navigation failed:", error);
			if (menuNavigationRef.current === pending) {
				menuNavigationRef.current = null;
				setIsNavigating(false);
			}
		});
	}, []);

	const wordmarkTailClass = `grid transition-[grid-template-columns,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
		isWordmarkCompact
			? "grid-cols-[0fr] opacity-0 group-hover:grid-cols-[1fr] group-hover:opacity-100 group-focus-visible:grid-cols-[1fr] group-focus-visible:opacity-100"
			: "grid-cols-[1fr] opacity-100"
	}`;

	return (
		<header className="bg-background fixed top-0 right-0 left-0 z-20 w-full">
			<div className="container mx-auto flex h-14 w-full items-center justify-between px-4 md:px-0">
				{/* biome-ignore lint/a11y/useAnchorContent: No fix is working to resolve this linting error */}
				<a
					href="/"
					aria-label="Simon Bremner home button"
					className="group text-2xl font-bold"
				>
					<span aria-hidden="true" className="flex">
						S
						<span className={wordmarkTailClass}>
							<span className="min-w-0 overflow-hidden whitespace-pre">
								{"imon "}
							</span>
						</span>
						B
						<span className={wordmarkTailClass}>
							<span className="min-w-0 overflow-hidden whitespace-pre">
								remner
							</span>
						</span>
						<span className="font-bold text-primary">.</span>
					</span>
				</a>

				{/* Right side controls (menu button + theme toggle) */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						aria-expanded={isMenuOpen}
						aria-controls="fullscreen-menu"
						aria-label={isMenuOpen ? "Close menu" : "Open menu"}
						onClick={() => setIsMenuOpen((open) => !open)}
						disabled={isNavigating}
						className="flex cursor-pointer items-center gap-2 px-2 py-2 text-sm font-bold"
					>
						<span className="uppercase tracking-widest">Menu</span>
						<MenuIcon isOpen={isMenuOpen} />
					</button>
					<ThemeToggle isDisabled={isMenuOpen} />
				</div>
			</div>

			{/* Fullscreen takeover menu (below the header so its controls stay usable) */}
			<AnimatePresence>
				{(isMenuOpen || isNavigating) && (
					<motion.div
						key="fullscreen-menu"
						id="fullscreen-menu"
						variants={
							prefersReducedMotion ? reducedOverlayVariants : overlayVariants
						}
						initial="closed"
						animate={isNavigating ? "leaving" : "open"}
						onAnimationComplete={handleMenuAnimationComplete}
						// Exit props are frozen from the last render, which still
						// has isNavigating set when a navigation completes
						exit={isNavigating ? "reveal" : "closed"}
						className={`bg-background fixed inset-0 -z-10 h-dvh overflow-hidden ${
							isNavigating ? "pointer-events-none" : ""
						}`}
					>
						<nav
							ref={navRef}
							aria-label="Main navigation"
							className="container relative mx-auto flex h-full flex-col items-start justify-center gap-10 px-4 pt-14 md:px-0"
						>
							{/* Hover image beside the hovered link, desktop only;
							    springs between links, fades out quickly on click. */}
							{isDesktop && (
								<motion.div
									aria-hidden="true"
									initial={false}
									// The exiting menu subtree is frozen, so fade out via exit
									exit={{
										opacity: 0,
										transition: { duration: 0.12, ease: "easeOut" },
									}}
									animate={{
										opacity: hoveredHref ? 1 : 0,
									}}
									style={{
										left: imageX,
										top: imageY,
										opacity: imageOpacity,
									}}
									transition={
										prefersReducedMotion
											? { duration: 0 }
											: { opacity: { duration: hoveredHref ? 0.35 : 0.15 } }
									}
									className="pointer-events-none absolute hidden w-[clamp(14rem,26vw,24rem)] md:block xl:w-[min(32vw,36rem)]"
								>
									{/* Clicking the image follows the hovered link; hovering it
									    keeps that link's hover alive. Out of the tab order since
									    the text link is the accessible equivalent. */}
									<a
										href={
											hoveredHref && !isLinkActive(currentPath, hoveredHref)
												? hoveredHref
												: undefined
										}
										tabIndex={-1}
										draggable={false}
										className={`block aspect-square w-full -translate-y-1/2 ${
											hoveredHref
												? `pointer-events-auto ${
														isLinkActive(currentPath, hoveredHref)
															? "cursor-pointer"
															: "cursor-pointer"
													}`
												: ""
										}`}
										onMouseEnter={cancelHoverClear}
										onMouseLeave={scheduleHoverClear}
										onClick={(event) => {
											if (hoveredHref) handleLinkClick(event, hoveredHref);
										}}
									>
										<FluidImage
											items={menuImageItems}
											activeHref={displayedHref}
											isVisible={isMenuOpen && hoveredHref !== null}
										/>
									</a>
								</motion.div>
							)}
							{navigationLinks.map((link: NavigationLinkProps) => {
								const active = isLinkActive(currentPath, link.href);
								const highlighted = hoveredHref === link.href;
								const dimmed = hoveredHref !== null && !highlighted;
								return (
									<div
										key={link.href}
										className="relative z-10 overflow-hidden py-1"
									>
										<motion.a
											variants={
												prefersReducedMotion
													? reducedLinkVariants
													: linkVariants
											}
											href={active ? undefined : link.href}
											aria-current={active ? "page" : undefined}
											aria-disabled={active ? true : undefined}
											data-astro-prefetch={active ? undefined : true}
											onClick={(event) => handleLinkClick(event, link.href)}
											onMouseEnter={(event) =>
												handleLinkHover(event, link.href)
											}
											onFocus={(event) => handleLinkHover(event, link.href)}
											onMouseLeave={scheduleHoverClear}
											onBlur={scheduleHoverClear}
											className={
												"block text-5xl font-bold tracking-tight md:text-7xl cursor-pointer"
											}
										>
											{/* Highlight keeps the text legible over the image */}
											<span
												className={`inline-block box-decoration-clone py-1 pr-5 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:scroll-py-72 ${
													dimmed ? "opacity-50" : "opacity-100"
												} ${highlighted ? "translate-x-3 motion-reduce:translate-x-0" : "translate-x-0"}`}
											>
												{link.title}
												<span
													aria-hidden="true"
													className={`text-primary transition-opacity duration-300 ease-out motion-reduce:transition-none ${
														highlighted ? "opacity-100" : "opacity-0"
													}`}
												>
													.
												</span>
											</span>
										</motion.a>
									</div>
								);
							})}
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
};
