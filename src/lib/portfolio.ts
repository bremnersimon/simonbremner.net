import type { PortfolioCategory, PortfolioRichBlock } from "@/types/portfolio";

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
