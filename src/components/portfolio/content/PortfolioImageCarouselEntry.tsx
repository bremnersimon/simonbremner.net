import { urlForImage } from "@/lib/sanity";
import type { PortfolioImage } from "@/types/portfolio";

interface PortfolioImageCarouselEntryProps {
	images?: PortfolioImage[];
}

export function PortfolioImageCarouselEntry({
	images = [],
}: PortfolioImageCarouselEntryProps) {
	if (!images.length) {
		return (
			<div className="p-6">
				<p className="text-sm text-muted-foreground">
					Image grid has no images.
				</p>
			</div>
		);
	}

	return (
		<section
			className="mx-auto w-full px-5"
			aria-label="Image grid block"
		>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				{images.map((image, index) => (
					<article key={image._key || `${index}`} className="space-y-2">
						<div className="">
							<img
								src={urlForImage(image)
									.width(900)
									.format("webp")
									.url()}
								alt={image.alt || `Portfolio image ${index + 1}`}
								className="w-full border border-foreground/50"
								loading="lazy"
							/>
						</div>
						{image.caption && (
							<p className="text-xs text-muted-foreground">{image.caption}</p>
						)}
					</article>
				))}
			</div>
		</section>
	);
}
