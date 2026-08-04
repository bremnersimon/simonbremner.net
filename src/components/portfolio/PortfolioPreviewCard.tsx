import { getPortfolioCategoryLabels, getPortfolioTransitionName } from "@/lib/portfolio";
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
	const categoryLabels = getPortfolioCategoryLabels(categories);
	const cardTransitionName = getPortfolioTransitionName(slug, "card");
	const imageTransitionName = getPortfolioTransitionName(slug, "image");
	const categoryTransitionName = getPortfolioTransitionName(slug, "category");
	const titleTransitionName = getPortfolioTransitionName(slug, "title");
	const tagsTransitionName = getPortfolioTransitionName(slug, "tags");
	const card = (
		<article
			className={cn(
				"overflow-hidden rounded-2xl border border-border/70 bg-card/40 transition-colors duration-300",
				href && "group-hover:bg-muted/25",
				className,
			)}
			style={cardTransitionName ? { viewTransitionName: cardTransitionName } : undefined}
		>
			<div
				className="overflow-hidden border-b border-border/70 bg-muted/20"
				style={imageTransitionName ? { viewTransitionName: imageTransitionName } : undefined}
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={imageAlt || headline || "Portfolio image"}
						className="aspect-[4/3] w-full object-cover"
						loading={loading}
					/>
				) : (
					<div className="flex aspect-[4/3] items-center justify-center bg-muted/25">
						<p className="text-xs text-muted-foreground">No image</p>
					</div>
				)}
			</div>

			<div className={cn("space-y-4 p-4 sm:p-5", contentClassName)}>
				{categoryLabels.length > 0 && (
					<ul
						className="flex flex-wrap gap-2"
						aria-label="Portfolio categories"
						style={categoryTransitionName ? { viewTransitionName: categoryTransitionName } : undefined}
					>
						{categoryLabels.map((label) => (
							<li
								key={label}
								className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
							>
								{label}
							</li>
						))}
					</ul>
				)}

				<HeadingTag
					className="text-lg font-semibold tracking-tight sm:text-xl"
					style={titleTransitionName ? { viewTransitionName: titleTransitionName } : undefined}
				>
					{headline || "Untitled"}
				</HeadingTag>

				{serviceTags.length > 0 && (
					<ul
						className="flex flex-wrap gap-2"
						aria-label="Portfolio tags"
						style={tagsTransitionName ? { viewTransitionName: tagsTransitionName } : undefined}
					>
						{serviceTags.map((tag) => (
							<li
								key={tag}
								className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
							>
								{tag}
							</li>
						))}
					</ul>
				)}
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