import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { PortfolioPreviewCard } from "@/components/portfolio/PortfolioPreviewCard";
import { getPortfolioCategoryLabel } from "@/lib/portfolio";

type PortfolioArchivePost = {
	_id: string;
	headline?: string;
	introduction?: string;
	slug?: string;
	href?: string;
	category?: string[];
	serviceTags?: string[];
	imageUrl?: string;
	imageAlt?: string;
};

type PortfolioArchiveProps = {
	posts: PortfolioArchivePost[];
};

const CATEGORY_FILTERS = ["all", "design", "development"] as const;
type PortfolioFilterCategory = (typeof CATEGORY_FILTERS)[number];

function toCategoryFilter(value: string | null): PortfolioFilterCategory {
	if (value === "design" || value === "development") {
		return value;
	}

	return "all";
}

export function PortfolioArchive({ posts }: PortfolioArchiveProps) {
	const [activeCategory, setActiveCategory] = useState<PortfolioFilterCategory>("all");

	useEffect(() => {
		const syncFromUrl = () => {
			const params = new URLSearchParams(window.location.search);
			setActiveCategory(toCategoryFilter(params.get("category")));
		};

		syncFromUrl();
		window.addEventListener("popstate", syncFromUrl);

		return () => {
			window.removeEventListener("popstate", syncFromUrl);
		};
	}, []);

	useEffect(() => {
		const url = new URL(window.location.href);
		if (activeCategory === "all") {
			url.searchParams.delete("category");
		} else {
			url.searchParams.set("category", activeCategory);
		}

		const query = url.searchParams.toString();
		const nextUrl = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
		const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

		if (nextUrl !== currentUrl) {
			window.history.replaceState(window.history.state, "", nextUrl);
		}
	}, [activeCategory]);

	const filteredPosts = posts.filter((post) => {
		if (activeCategory === "all") {
			return true;
		}

		return (post.category || []).includes(activeCategory);
	});

	return (
		<div className="space-y-10">
			<div className="space-y-2">
				<ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
					{CATEGORY_FILTERS.map((category) => {
						const isActive = activeCategory === category;
						const href =
							category === "all"
								? "/portfolio"
								: `/portfolio?category=${category}`;
						const label =
							category === "all"
								? "All"
								: getPortfolioCategoryLabel(category);

						return (
							<li key={category}>
								<a
									href={href}
									onClick={(event) => {
										event.preventDefault();
										setActiveCategory(category);
									}}
									className={
										isActive
											? "border-b border-foreground pb-1 text-sm uppercase tracking-[0.12em] text-foreground"
											: "border-b border-transparent pb-1 text-sm uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:border-foreground/60 hover:text-foreground"
									}
									aria-current={isActive ? "page" : undefined}
								>
									{label}
								</a>
							</li>
						);
					})}
				</ul>
			</div>

			{filteredPosts.length > 0 ? (
				<ul className="grid grid-cols-1 gap-8 sm:grid-cols-2">
					<AnimatePresence mode="popLayout">
						{filteredPosts.map((post) => (
							<motion.li
								key={post._id}
								layout
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="h-full"
							>
								<PortfolioPreviewCard
									headline={post.headline}
									imageUrl={post.imageUrl}
									imageAlt={post.imageAlt}
									href={post.href}
									slug={post.slug}
									className="border-0 p-0"
								/>
							</motion.li>
						))}
					</AnimatePresence>
				</ul>
			) : (
				<div className="border-t border-border py-10 text-center">
					<p className="text-sm text-muted-foreground">
						No portfolio projects match the current filters.
					</p>
				</div>
			)}
		</div>
	);
}
