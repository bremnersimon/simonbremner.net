import { getPortfolioTransitionName } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

type PortfolioPreviewCardProps = {
	headline?: string;
	imageUrl?: string;
	heroImageUrl?: string;
	imageAlt?: string;
	href?: string;
	slug?: string;
	headingTag?: "h1" | "h2";
	className?: string;
	imageClassName?: string;
	loading?: "eager" | "lazy";
};

const heroImagePreloads = new Map<string, Promise<void>>();

function preloadHeroImage(heroImageUrl: string | undefined) {
	if (!heroImageUrl || typeof Image === "undefined" || heroImagePreloads.has(heroImageUrl)) {
		return;
	}

	const image = new Image();
	image.src = heroImageUrl;
	heroImagePreloads.set(
		heroImageUrl,
		image.decode().catch(() => undefined),
	);
}

export function PortfolioPreviewCard({
	headline,
	imageUrl,
	heroImageUrl,
	imageAlt,
	href,
	slug,
	headingTag = "h2",
	className,
	imageClassName,
	loading = "lazy",
}: PortfolioPreviewCardProps) {
	const HeadingTag = headingTag;
	const imageTransitionName = getPortfolioTransitionName(slug, "image");
	const card = (
		<article
			className={cn(
				"space-y-3 transition-colors duration-300",
				href,
				className,
			)}
		>
			<div className="space-y-3 group">
				<div
					className="relative overflow-hidden"
					style={imageTransitionName ? { viewTransitionName: imageTransitionName } : undefined}
				>
					{imageUrl ? (
						<>
							<img
								src={imageUrl}
								alt={imageAlt || headline || "Portfolio image"}
								className={cn(
									"aspect-[2/1] w-full object-cover group-hover:scale-[1.05] transition-transform duration-300",
									imageClassName,
								)}
								loading={loading}
							/>
						</>
					) : (
						<div className="flex h-[320px] items-center justify-center border border-border/60 sm:h-[420px] md:h-full md:min-h-[420px]">
							<p className="text-xs text-muted-foreground">No image</p>
						</div>
					)}
				</div>

				<div className="flex items-start justify-between gap-4 border-b border-border pb-2">
					<HeadingTag className="text-xs font-medium text-foreground/90 sm:text-sm">
						{headline || "Untitled"}
					</HeadingTag>
					<span className="opacity-100 md:opacity-0 group-hover:opacity-100 opacity-100 md:opacity-0 shrink-0 text-[10px] text-foreground/80 sm:text-xs transition-opacity duration-300">
						View Project
						<span aria-hidden="true"> &#8594;</span>
					</span>
				</div>
			</div>
		</article>
	);

	if (!href) {
		return card;
	}

	return (
		<a
			href={href}
			className="group block h-full border-foreground"
			onPointerEnter={() => preloadHeroImage(heroImageUrl)}
			onFocus={() => preloadHeroImage(heroImageUrl)}
			onPointerDown={() => preloadHeroImage(heroImageUrl)}
		>
			{card}
		</a>
	);
}