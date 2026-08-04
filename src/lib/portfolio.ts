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

type PortfolioTransitionPart = "card" | "image" | "category" | "title" | "tags";

export function getPortfolioTransitionName(
	slug: string | undefined,
	part: PortfolioTransitionPart,
) {
	if (!slug) {
		return undefined;
	}

	return `portfolio-${slug}-${part}`;
}
