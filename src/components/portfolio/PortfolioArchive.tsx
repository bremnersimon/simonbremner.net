import { useDeferredValue, useState } from "react";

import { PortfolioPreviewCard } from "@/components/portfolio/PortfolioPreviewCard";
import { Button } from "@/components/shad-ui/button";
import { Input } from "@/components/shad-ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shad-ui/select";
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

export function PortfolioArchive({ posts }: PortfolioArchiveProps) {
	const [search, setSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [activeTags, setActiveTags] = useState<string[]>([]);
	const deferredSearch = useDeferredValue(search);

	const categories = Array.from(
		new Set(posts.flatMap((post) => post.category || [])),
	).sort((left, right) => left.localeCompare(right));
	const tags = Array.from(
		new Set(posts.flatMap((post) => post.serviceTags || [])),
	).sort((left, right) => left.localeCompare(right));

	const normalizedQuery = deferredSearch.trim().toLowerCase();
	const filteredPosts = posts.filter((post) => {
		const searchHaystack = [
			post.headline || "",
			post.introduction || "",
			...(post.serviceTags || []),
		]
			.join(" ")
			.toLowerCase();

		const matchesSearch =
			!normalizedQuery || searchHaystack.includes(normalizedQuery);
		const matchesCategory =
			!activeCategory || (post.category || []).includes(activeCategory);
		const matchesTags =
			activeTags.length === 0 ||
			activeTags.some((tag) => (post.serviceTags || []).includes(tag));

		return matchesSearch && matchesCategory && matchesTags;
	});

	const hasActiveFilters = Boolean(
		search.trim() || activeCategory || activeTags.length > 0,
	);

	function toggleTag(tag: string) {
		setActiveTags((currentTags) =>
			currentTags.includes(tag)
				? currentTags.filter((currentTag) => currentTag !== tag)
				: [...currentTags, tag],
		);
	}

	function resetFilters() {
		setSearch("");
		setActiveCategory(null);
		setActiveTags([]);
	}

	const resetButtonClassName =
		"h-10 w-10 shrink-0 rounded-none border-0 px-0 text-lg leading-none text-foreground transition-colors hover:bg-transparent disabled:cursor-not-allowed disabled:text-foreground/40";

	return (
		<div className="space-y-10">
			<div className="space-y-5">
				<div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_40px] md:items-end">
					<label htmlFor="portfolio-search" className="block space-y-2">
						<span className="text-xs uppercase tracking-[0.18em] text-foreground">
							Search
						</span>
						<Input
							id="portfolio-search"
							type="search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by title, introduction, or tag"
							className="h-10 rounded-none border-0 border-b border-foreground px-0 text-foreground shadow-none focus-visible:ring-0"
						/>
					</label>

					<div className="space-y-2">
						<span className="text-xs uppercase tracking-[0.18em] text-foreground">
							Category
						</span>
						<Select
							value={activeCategory ?? "all"}
							onValueChange={(value) =>
								setActiveCategory(value === "all" ? null : value)
							}
						>
							<SelectTrigger className="h-10 w-full rounded-none border-0 border-b border-foreground px-0 text-foreground shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0">
								<SelectValue placeholder="All categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{getPortfolioCategoryLabel(category)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						className={resetButtonClassName}
						disabled={!hasActiveFilters}
						onClick={resetFilters}
						aria-label="Reset filters"
					>
						X
					</Button>
				</div>

				<div className="space-y-3">
					<p className="text-xs uppercase tracking-[0.18em] text-foreground">
						Tags
					</p>
					<div className="flex flex-wrap gap-x-4 gap-y-2">
						{tags.map((tag) => {
							const isActive = activeTags.includes(tag);

							return (
								<Button
									key={tag}
									type="button"
									variant="ghost"
									className={
										isActive
											? "h-auto rounded-none border border-foreground bg-foreground px-3 py-1.5 text-xs tracking-[0.08em] text-background shadow-none transition-colors hover:bg-foreground/90"
											: "h-auto rounded-none border border-foreground bg-transparent px-3 py-1.5 text-xs tracking-[0.08em] text-foreground shadow-none transition-colors hover:bg-transparent"
									}
									aria-pressed={isActive}
									onClick={() => toggleTag(tag)}
								>
									{tag}
								</Button>
							);
						})}
					</div>
				</div>
			</div>

			{filteredPosts.length > 0 ? (
				<ul className="space-y-8">
					{filteredPosts.map((post) => (
						<li key={post._id} className="h-full">
							<PortfolioPreviewCard
								headline={post.headline}
								categories={post.category}
								serviceTags={post.serviceTags}
								imageUrl={post.imageUrl}
								imageAlt={post.imageAlt}
								href={post.href}
								slug={post.slug}
							/>
						</li>
					))}
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
