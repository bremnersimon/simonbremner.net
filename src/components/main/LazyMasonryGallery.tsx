import { ChevronLeft, ChevronRight, Info, Loader2 } from "lucide-react";
import type { GalleryPhoto } from "@/lib/galleryPhoto";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../shad-ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "../shad-ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../shad-ui/popover";
import MasonryGrid from "./MasonryGrid";

interface LazyMasonryGalleryProps {
	initialImages: GalleryPhoto[];
	photosPerPage?: number;
}

const LazyMasonryGallery = ({
	initialImages,
	photosPerPage = 20,
}: LazyMasonryGalleryProps) => {
	const [images, setImages] = useState<GalleryPhoto[]>(initialImages || []);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [columns, setColumns] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [offset, setOffset] = useState(initialImages?.length || 0);
	const [isModalImageReady, setIsModalImageReady] = useState(false);
	const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
	const [measuredRatios, setMeasuredRatios] = useState<Record<string, number>>(
		{},
	);
	const isFetchingRef = useRef(false);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const lastFetchAtRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const itemElementsRef = useRef(new Map<string, HTMLButtonElement>());

	const updateMeasuredRatio = useCallback(
		(id: string, width: number, height: number) => {
			if (width <= 0 || height <= 0) return;
			const nextRatio = height / width;

			setMeasuredRatios((prev) => {
				const current = prev[id];
				if (current !== undefined && Math.abs(current - nextRatio) < 0.01) {
					return prev;
				}

				return {
					...prev,
					[id]: nextRatio,
				};
			});
		},
		[],
	);

	const registerButton = useCallback(
		(el: HTMLButtonElement | null, id: string) => {
			const existing = itemElementsRef.current.get(id);

			if (existing && existing !== el) {
				resizeObserverRef.current?.unobserve(existing);
				itemElementsRef.current.delete(id);
			}

			if (!el) {
				return;
			}

			itemElementsRef.current.set(id, el);

			resizeObserverRef.current?.observe(el);
			updateMeasuredRatio(id, el.clientWidth, el.clientHeight);
		},
		[updateMeasuredRatio],
	);

	useEffect(() => {
		resizeObserverRef.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const target = entry.target as HTMLElement;
				const id = target.dataset.imgId;
				if (!id) continue;

				const { width, height } = entry.contentRect;
				updateMeasuredRatio(id, width, height);
			}
		});

		for (const [id, element] of itemElementsRef.current) {
			resizeObserverRef.current.observe(element);
			updateMeasuredRatio(id, element.clientWidth, element.clientHeight);
		}

		return () => {
			resizeObserverRef.current?.disconnect();
			resizeObserverRef.current = null;
		};
	}, [updateMeasuredRatio]);

	useEffect(() => {
		return () => {
			itemElementsRef.current.clear();
		};
	}, []);

	const columnAssignments = useMemo(() => {
		const heights = Array(columns).fill(0) as number[];
		const assignments = Array(images.length).fill(0) as number[];

		for (let i = 0; i < images.length; i += 1) {
			const image = images[i];
			const id = image._id || String(i);
			const measuredRatio = measuredRatios[id];
			const estimatedRatio =
				image.dimensions?.width && image.dimensions?.height
					? image.dimensions.height / image.dimensions.width
					: image.image?.width && image.image?.height
						? image.image.height / image.image.width
						: 1;
			const itemHeightRatio = measuredRatio ?? estimatedRatio;

			const shortestColumnIndex = heights.indexOf(Math.min(...heights));
			assignments[i] = shortestColumnIndex;
			heights[shortestColumnIndex] += itemHeightRatio;
		}

		return assignments;
	}, [images, columns, measuredRatios]);

	const selected = selectedIndex !== null ? images[selectedIndex] : null;
	const isFirstImage = selectedIndex === 0;
	const isLastLoadedImage =
		selectedIndex !== null && selectedIndex === images.length - 1;
	const canGoPrevious = selectedIndex !== null && selectedIndex > 0;
	const canGoNext = selectedIndex !== null && (!isLastLoadedImage || hasMore);

	useEffect(() => {
		const updateColumns = () => {
			if (window.innerWidth >= 1024) {
				setColumns(3); // lg: 3 columns
			} else if (window.innerWidth >= 768) {
				setColumns(2); // md: 2 columns
			} else {
				setColumns(1); // mobile: 1 column
			}
		};

		updateColumns();
		window.addEventListener("resize", updateColumns);
		return () => window.removeEventListener("resize", updateColumns);
	}, []);

	const loadMorePhotos = useCallback(async (): Promise<number> => {
		if (isFetchingRef.current || !hasMore) return 0;

		isFetchingRef.current = true;
		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/photos?offset=${offset}&limit=${photosPerPage}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch photos");
			}

			const data = await response.json();

			if (data.photos && data.photos.length > 0) {
				setImages((prev) => [...prev, ...data.photos]);
				setOffset((prev) => prev + data.photos.length);
				setHasMore(data.hasMore);
				return data.photos.length;
			}

			setHasMore(false);
			return 0;
		} catch (error) {
			console.error("Error loading more photos:", error);
			setHasMore(false);
			return 0;
		} finally {
			isFetchingRef.current = false;
			setIsLoading(false);
		}
	}, [offset, photosPerPage, hasMore]);

	const goToPreviousImage = useCallback(() => {
		setSelectedIndex((prev) => {
			if (prev === null || prev <= 0) return prev;
			return prev - 1;
		});
	}, []);

	const goToNextImage = useCallback(async () => {
		if (selectedIndex === null) return;

		if (selectedIndex < images.length - 1) {
			setSelectedIndex((prev) => {
				if (prev === null) return prev;
				return Math.min(prev + 1, images.length - 1);
			});
			return;
		}

		if (!hasMore) return;

		const previousLength = images.length;
		const loadedCount = await loadMorePhotos();

		if (loadedCount > 0) {
			setSelectedIndex(previousLength);
		}
	}, [selectedIndex, images.length, hasMore, loadMorePhotos]);

	const handleManualLoadMore = useCallback(() => {
		void loadMorePhotos();
	}, [loadMorePhotos]);

	// Stable ref so the observer always calls the latest loadMorePhotos without
	// needing to be torn down and recreated every time offset changes.
	const loadMorePhotosRef = useRef(loadMorePhotos);
	const containerRef = useRef<HTMLDivElement>(null);
	const [sentinelTop, setSentinelTop] = useState<number | null>(null);

	// Keep the ref in sync with the latest callback on every render.
	useEffect(() => {
		loadMorePhotosRef.current = loadMorePhotos;
	});

	// After each image batch (or column count change), measure the column divs
	// inside the masonry flex container and position the sentinel at the bottom
	// of the shortest one.
	// biome-ignore lint/correctness/useExhaustiveDependencies: images/columns are intentional re-run triggers; containerRef is a ref
	useEffect(() => {
		if (!containerRef.current) return;

		const raf = requestAnimationFrame(() => {
			const masonryEl = containerRef.current?.children[0] as
				| HTMLElement
				| undefined;
			if (!masonryEl) return;
			const columnEls = Array.from(masonryEl.children) as HTMLElement[];
			if (columnEls.length === 0) return;
			const shortest = Math.min(...columnEls.map((el) => el.offsetHeight));
			setSentinelTop(shortest);
		});

		return () => cancelAnimationFrame(raf);
	}, [images, columns, columnAssignments]);

	// Single persistent observer — never torn down on offset/callback changes.
	// Stability is achieved via loadMorePhotosRef so the closure never goes stale.
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (!entry?.isIntersecting) return;
				if (isFetchingRef.current) return;

				const now = Date.now();
				if (now - lastFetchAtRef.current < 450) return;

				lastFetchAtRef.current = now;
				void loadMorePhotosRef.current();
			},
			{
				threshold: 0.01,
				rootMargin: "0px 0px 400px 0px",
			},
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
		// Intentionally empty deps: one observer for the component's lifetime.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (selectedIndex === null) return;

		const isEditableTarget = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) return false;
			const tagName = target.tagName;
			return (
				tagName === "INPUT" ||
				tagName === "TEXTAREA" ||
				target.isContentEditable ||
				target.getAttribute("contenteditable") === "true"
			);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (isEditableTarget(event.target)) return;

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				goToPreviousImage();
			}

			if (event.key === "ArrowRight") {
				event.preventDefault();
				void goToNextImage();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [selectedIndex, goToPreviousImage, goToNextImage]);

	useEffect(() => {
		if (!selected) {
			setIsModalImageReady(false);
			return;
		}

		setIsModalImageReady(false);
		const image = new Image();
		image.src = selected.image.modalSrc || selected.image.src;

		if (image.complete) {
			setIsModalImageReady(true);
			return;
		}

		image.onload = () => setIsModalImageReady(true);
		image.onerror = () => setIsModalImageReady(true);

		return () => {
			image.onload = null;
			image.onerror = null;
		};
	}, [selected]);

	if (!images || images.length === 0) {
		return (
			<div className="flex items-center justify-center py-20">
				<p className="text-lg text-muted-foreground">No photos found.</p>
			</div>
		);
	}

	return (
		<>
			{/* Relative container so the sentinel can be absolutely positioned
			    at the bottom of the shortest masonry column. */}
			<div ref={containerRef} className="relative w-full">
				<MasonryGrid
					columns={columns}
					columnAssignments={columnAssignments}
					imageData={images.map((img) => ({
						width: img.dimensions.width,
						height: img.dimensions.height,
						aspectRatio: img.dimensions.aspectRatio,
					}))}
					balanceByHeight={true}
				>
					{images.map((img, i) => {
						const imgKey = img._id || String(i);
						const prioritizeImage = i < Math.max(columns * 2, 4);
						const isLoaded = loadedIds.has(imgKey);
						const hasResponsiveSources = Boolean(img.image.srcSetWebp);
						return (
							<button
								type="button"
								key={imgKey}
								ref={(el) => registerButton(el, imgKey)}
								data-img-id={imgKey}
								className="overflow-hidden cursor-pointer shadow-md relative w-full focus:outline-none transition-transform hover:scale-[1.02] focus:scale-[1.02]"
								style={{
									width: "100%",
									aspectRatio: `${img.dimensions.width} / ${img.dimensions.height}`,
									backgroundColor: "hsl(var(--muted))",
								}}
								onClick={() => setSelectedIndex(i)}
								tabIndex={0}
								aria-label={img.image.alt || img.title || `View photo ${i + 1}`}
							>
								<picture>
									{hasResponsiveSources && img.image.srcSetWebp && (
										<source
											srcSet={img.image.srcSetWebp}
											sizes={img.image.sizes}
											type="image/webp"
										/>
									)}
									<img
										src={img.image.src}
										alt={img.image.alt || img.title || `Photo ${i + 1}`}
										width={img.image.width}
										height={img.image.height}
										className="h-full w-full object-cover transition-opacity duration-300 ease-out"
										style={{
											display: "block",
											opacity: prioritizeImage || isLoaded ? 1 : 0,
										}}
										loading={prioritizeImage ? "eager" : "lazy"}
										decoding="async"
										fetchPriority={i === 0 ? "high" : "auto"}
										onLoad={() => {
											if (prioritizeImage) return;
											setLoadedIds((prev) => {
												if (prev.has(imgKey)) return prev;
												const next = new Set(prev);
												next.add(imgKey);
												return next;
											});
										}}
										onError={(event) => {
											const target = event.currentTarget;
											if (target.src !== img.image.thumbnail) {
												target.src = img.image.thumbnail;
											}
										}}
									/>
								</picture>
								{/* {(img.location || img.title) && (
									<div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded shadow backdrop-blur-sm">
										{img.location || img.title}
									</div>
								)} */}
							</button>
						);
					})}
				</MasonryGrid>

				{/* Zero-size sentinel pinned to the bottom of the shortest masonry column.
				    sentinelTop is recalculated after each image batch via rAF. */}
				<div
					ref={sentinelRef}
					className="absolute left-0 w-full h-0 pointer-events-none"
					style={sentinelTop !== null ? { top: sentinelTop } : { bottom: 0 }}
					aria-hidden="true"
				/>
			</div>

			{hasMore && (
				<div className="mt-8 mb-4 flex flex-col items-center gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleManualLoadMore}
						disabled={isLoading}
						className="min-w-40"
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{isLoading ? "Loading..." : "Load more"}
					</Button>
					{/* <p className="text-center text-xs text-muted-foreground">
						If scrolling skips auto-load, use Load more.
					</p> */}
				</div>
			)}

			{!hasMore && images.length > 0 && (
				<div className="text-center mt-16 mb-8">
					<div className="inline-flex items-center px-4 py-2 bg-muted">
						<span className="text-muted-foreground">
							End of gallery • {images.length} photos total
						</span>
					</div>
				</div>
			)}

			<Dialog
				open={selectedIndex !== null}
				onOpenChange={(open) => !open && setSelectedIndex(null)}
			>
				<DialogContent className="w-screen h-screen max-w-none max-h-none p-0 m-0 flex items-center justify-center bg-background">
					{selected && (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<div
							style={{
								maxWidth: "90vw",
								maxHeight: "90vh",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "auto",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<>
								<span
									style={{
										position: "absolute",
										width: 1,
										height: 1,
										overflow: "hidden",
										clip: "rect(1px, 1px, 1px, 1px)",
										whiteSpace: "nowrap",
									}}
								>
									<DialogTitle>
										{selected.title ||
											selected.location ||
											selected.image.alt ||
											"Image"}
									</DialogTitle>
									<DialogDescription>
										{selected.image.alt || selected.title || ""}
									</DialogDescription>
								</span>
								<div className="flex flex-col items-center w-full h-full">
									<div
										className="relative w-full h-full flex justify-center items-center"
										style={{ maxHeight: "80vh" }}
									>
										{isModalImageReady && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
															className="fixed cursor-pointer left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70"
												onClick={goToPreviousImage}
												disabled={!canGoPrevious}
												aria-label="Previous image"
											>
												<ChevronLeft className="h-6 w-6" />
												<span className="sr-only">Previous image</span>
											</Button>
										)}

										<div
											style={{
												width: "100%",
												height: "auto",
												maxHeight: "80vh",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<img
												src={selected.image.modalSrc || selected.image.src}
												alt={selected.image.alt || selected.title}
												width={selected.image.width}
												height={selected.image.height}
												className="block object-contain"
												style={{
													maxHeight: "80vh",
													maxWidth: "100%",
													width: "auto",
													height: "auto",
												}}
											/>
										</div>

										{isModalImageReady && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
															className="fixed cursor-pointer right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70"
												onClick={() => {
													void goToNextImage();
												}}
												disabled={!canGoNext || isLoading}
												aria-label="Next image"
											>
												{isLoading && isLastLoadedImage ? (
													<Loader2 className="h-6 w-6 animate-spin" />
												) : (
													<ChevronRight className="h-6 w-6" />
												)}
												<span className="sr-only">
													{isLoading && isLastLoadedImage
														? "Loading next image"
														: "Next image"}
												</span>
											</Button>
										)}

										{isModalImageReady && (
											<div className="absolute bottom-4 right-4 z-10">
												<Popover>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
															aria-label="Show photo details"
														>
															<Info size={16} />
															<span className="sr-only">Photo details</span>
														</button>
													</PopoverTrigger>
													<PopoverContent
														align="end"
														side="top"
														sideOffset={8}
														className="max-w-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
													>
														<div className="grid grid-cols-3 gap-y-6 gap-x-8 justify-center items-start text-base text-muted-foreground">
															{selected.location && (
																<div className="flex flex-col items-start">
																	<span className="mb-1 text-[0.65rem] uppercase tracking-widest text-gray-400">
																		Location
																	</span>
																	<span className="text-lg font-medium text-gray-900 dark:text-gray-100">
																		{selected.location}
																	</span>
																</div>
															)}
															{selected.shutterSpeed && (
																<div className="flex flex-col items-start">
																	<span className="mb-1 text-[0.65rem] uppercase tracking-widest text-gray-400">
																		Shutter
																	</span>
																	<span className="text-lg font-medium text-gray-900 dark:text-gray-100">
																		{selected.shutterSpeed}
																	</span>
																</div>
															)}
															{selected.iso && (
																<div className="flex flex-col items-start">
																	<span className="mb-1 text-[0.65rem] uppercase tracking-widest text-gray-400">
																		ISO
																	</span>
																	<span className="text-lg font-medium text-gray-900 dark:text-gray-100">
																		{selected.iso}
																	</span>
																</div>
															)}
															{selected.aperture && (
																<div className="flex flex-col items-start">
																	<span className="mb-1 text-[0.65rem] uppercase tracking-widest text-gray-400">
																		Aperture
																	</span>
																	<span className="text-lg font-medium text-gray-900 dark:text-gray-100">
																		{selected.aperture}
																	</span>
																</div>
															)}
															{selected.lens && (
																<div className="flex flex-col items-start">
																	<span className="mb-1 text-[0.65rem] uppercase tracking-widest text-gray-400">
																		Lens
																	</span>
																	<span className="text-lg font-medium text-gray-900 dark:text-gray-100">
																		{typeof selected.lens === "string"
																			? selected.lens
																			: selected.lens.name ||
																				selected.lens.brand ||
																				JSON.stringify(selected.lens)}
																	</span>
																</div>
															)}
															{selected.camera && (
																<div className="flex flex-col items-start">
																	<span className="mb-1 text-[0.65rem] uppercase tracking-widest text-gray-400">
																		Camera
																	</span>
																	<span className="text-lg font-medium text-gray-900 dark:text-gray-100">
																		{typeof selected.camera === "string"
																			? selected.camera
																			: selected.camera.name ||
																				selected.camera.brand ||
																				JSON.stringify(selected.camera)}
																	</span>
																</div>
															)}
														</div>
													</PopoverContent>
												</Popover>
											</div>
										)}
									</div>
								</div>
							</>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default LazyMasonryGallery;
