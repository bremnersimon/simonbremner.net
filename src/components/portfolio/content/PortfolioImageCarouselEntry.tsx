import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/shad-ui/carousel";
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
				<p className="text-sm text-muted-foreground">Carousel has no images.</p>
			</div>
		);
	}

	return (
		<section
			className="mx-auto w-full max-w-[1100px] px-5"
			aria-label="Image carousel block"
		>
			<Carousel
				opts={{ align: "start", loop: images.length > 1 }}
				className="w-full px-10"
			>
				<CarouselContent>
					{images.map((image, index) => (
						<CarouselItem
							key={image._key || `${index}`}
							className="basis-[84%] sm:basis-1/2 lg:basis-1/3"
						>
							<article className="space-y-2">
								<div className="overflow-hidden">
									<img
										src={urlForImage(image)
											.width(900)
											.height(600)
											.fit("crop")
											.format("webp")
											.url()}
										alt={image.alt || `Carousel image ${index + 1}`}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								</div>
								{image.caption && (
									<p className="text-xs text-muted-foreground">
										{image.caption}
									</p>
								)}
							</article>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious className="left-2" />
				<CarouselNext className="right-2" />
			</Carousel>
		</section>
	);
}
