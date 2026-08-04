import { useDeferredValue, useState } from "react";

import { PortfolioPreviewCard } from "@/components/portfolio/PortfolioPreviewCard";
import { Button } from "@/components/shad-ui/button";
import { Input } from "@/components/shad-ui/input";
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

		const matchesSearch = !normalizedQuery || searchHaystack.includes(normalizedQuery);
		const matchesCategory = !activeCategory || (post.category || []).includes(activeCategory);
		const matchesTags =
			activeTags.length === 0 ||
			activeTags.some((tag) => (post.serviceTags || []).includes(tag));

		return matchesSearch && matchesCategory && matchesTags;
	});

	const hasActiveFilters = Boolean(search.trim() || activeCategory || activeTags.length > 0);

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

	return (
		<div className="space-y-8">
			<div className="space-y-6 rounded-2xl border border-border/70 bg-card/30 p-4 sm:p-5">
				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
					<label htmlFor="portfolio-search" className="space-y-2">
						<span className="text-sm font-medium">Search portfolio</span>
						<Input
							id="portfolio-search"
							type="search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by title, introduction, or tag"
							className="h-11"
						/>
					</label>

					<div className="flex items-center justify-between gap-3 lg:justify-end">
						<p className="text-sm text-muted-foreground">
							{filteredPosts.length} {filteredPosts.length === 1 ? "project" : "projects"}
						</p>
						{hasActiveFilters && (
							<Button type="button" variant="outline" size="sm" onClick={resetFilters}>
								Reset filters
							</Button>
						)}
					</div>
				</div>

				<div className="space-y-3">
					<p className="text-sm font-medium">Category</p>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant={activeCategory === null ? "default" : "outline"}
							size="sm"
							aria-pressed={activeCategory === null}
							onClick={() => setActiveCategory(null)}
						>
							All
						</Button>
						{categories.map((category) => (
							<Button
								key={category}
								type="button"
								variant={activeCategory === category ? "default" : "outline"}
								size="sm"
								aria-pressed={activeCategory === category}
								onClick={() =>
									setActiveCategory((currentCategory) =>
										currentCategory === category ? null : category,
									)
								}
							>
								{getPortfolioCategoryLabel(category)}
							</Button>
						))}
					</div>
				</div>

				<div className="space-y-3">
					<p className="text-sm font-medium">Tags</p>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => {
							const isActive = activeTags.includes(tag);

							return (
								<Button
									key={tag}
									type="button"
									variant={isActive ? "secondary" : "outline"}
									size="sm"
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
				<ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
				<div className="rounded-2xl border border-dashed border-border p-10 text-center">
					<p className="text-sm text-muted-foreground">No portfolio projects match the current filters.</p>
				</div>
			)}
		</div>
	);
}