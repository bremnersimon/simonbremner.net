import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { urlForImage } from "@/lib/sanity";
import type { PortfolioCategory, PortfolioRichBlock } from "@/types/portfolio";

type PortfolioImageVariant = "archive" | "hero";

const PORTFOLIO_IMAGE_DIMENSIONS: Record<
	PortfolioImageVariant,
	{ width: number; height: number }
> = {
	archive: { width: 900, height: 450 },
	hero: { width: 1800, height: 900 },
};

export function getPortfolioImageUrl(
	source: SanityImageSource | null | undefined,
	variant: PortfolioImageVariant,
) {
	if (!source) {
		return "";
	}

	const { width, height } = PORTFOLIO_IMAGE_DIMENSIONS[variant];

	return urlForImage(source)
		.width(width)
		.height(height)
		.fit("crop")
		.format("webp")
		.url();
}

export const PORTFOLIO_CATEGORY_LABELS: Record<PortfolioCategory, string> = {
	design: "Design",
	development: "Development",
};

export function getPortfolioCategoryLabel(category: string) {
	return PORTFOLIO_CATEGORY_LABELS[category as PortfolioCategory] || category;
}

export function getPortfolioCategoryLabels(categories: string[] = []) {
	return categories.map(getPortfolioCategoryLabel);
}

export function getPortfolioCategoryDisplay(categories: string[] = []) {
	const categorySet = new Set(categories);
	const hasDesign = categorySet.has("design");
	const hasDevelopment = categorySet.has("development");

	if (hasDesign && hasDevelopment) {
		return "Design & Development";
	}

	if (hasDesign) {
		return "Design";
	}

	if (hasDevelopment) {
		return "Development";
	}

	return getPortfolioCategoryLabels(categories).join(" & ");
}

export function getPortableTextPlainText(
	blocks: string | PortfolioRichBlock[] = [],
) {
	if (typeof blocks === "string") {
		return blocks.replace(/\s+/g, " ").trim();
	}

	return blocks
		.map((block) =>
			(block.children || []).map((child) => child.text || "").join(""),
		)
		.join(" ")
		.replace(/\s+/g, " ")
		.trim();
}

type PortfolioTransitionPart =
	| "card"
	| "image"
	| "category"
	| "title"
	| "introduction"
	| "tags";

export function getPortfolioTransitionName(
	slug: string | undefined,
	part: PortfolioTransitionPart,
) {
	if (!slug) {
		return undefined;
	}

	return `portfolio-${slug}-${part}`;
}
