import { getPortfolioCategoryDisplay, getPortfolioTransitionName } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

type PortfolioPreviewCardProps = {
	headline?: string;
	categories?: string[];
	serviceTags?: string[];
	imageUrl?: string;
	imageAlt?: string;
	href?: string;
	slug?: string;
	headingTag?: "h1" | "h2";
	className?: string;
	contentClassName?: string;
	loading?: "eager" | "lazy";
};

export function PortfolioPreviewCard({
	headline,
	categories = [],
	serviceTags = [],
	imageUrl,
	imageAlt,
	href,
	slug,
	headingTag = "h2",
	className,
	contentClassName,
	loading = "lazy",
}: PortfolioPreviewCardProps) {
	const HeadingTag = headingTag;
	const categoryLabel = getPortfolioCategoryDisplay(categories);
	const cardTransitionName = getPortfolioTransitionName(slug, "card");
	const imageTransitionName = getPortfolioTransitionName(slug, "image");
	const categoryTransitionName = getPortfolioTransitionName(slug, "category");
	const titleTransitionName = getPortfolioTransitionName(slug, "title");
	const tagsTransitionName = getPortfolioTransitionName(slug, "tags");
	const card = (
		<article
			className={cn(
				"border border-border px-4 py-6 transition-colors duration-300 sm:px-5",
				href && "group-hover:border-foreground/40",
				className,
			)}
			style={cardTransitionName ? { viewTransitionName: cardTransitionName } : undefined}
		>
			<div className="grid gap-5 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:items-start lg:gap-8">
				<div
					className="overflow-hidden"
					style={imageTransitionName ? { viewTransitionName: imageTransitionName } : undefined}
				>
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={imageAlt || headline || "Portfolio image"}
							className="h-64 w-full object-cover md:h-[260px]"
							loading={loading}
						/>
					) : (
						<div className="flex h-64 items-center justify-center border border-border/60 md:h-[260px]">
							<p className="text-xs text-muted-foreground">No image</p>
						</div>
					)}
				</div>

				<div className={cn("space-y-5", contentClassName)}>
					{categoryLabel && (
						<p
							className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
							aria-label="Portfolio categories"
							style={categoryTransitionName ? { viewTransitionName: categoryTransitionName } : undefined}
						>
							{categoryLabel}
						</p>
					)}

					<HeadingTag
						className="text-2xl font-semibold tracking-tight sm:text-3xl"
						style={titleTransitionName ? { viewTransitionName: titleTransitionName } : undefined}
					>
						{headline || "Untitled"}
					</HeadingTag>

					{serviceTags.length > 0 && (
						<ul
							className="flex flex-wrap gap-x-4 gap-y-2"
							aria-label="Portfolio tags"
							style={tagsTransitionName ? { viewTransitionName: tagsTransitionName } : undefined}
						>
							{serviceTags.map((tag) => (
								<li
									key={tag}
									className="text-sm text-muted-foreground"
								>
									{tag}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</article>
	);

	if (!href) {
		return card;
	}

	return (
		<a href={href} className="group block h-full">
			{card}
		</a>
	);
}