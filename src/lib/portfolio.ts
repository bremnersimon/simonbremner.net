import type { PortfolioCategory } from "@/types/portfolio";

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

type PortfolioTransitionPart =
	| "card"
	| "image"
	| "category"
	| "title"
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