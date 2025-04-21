import { Card, CardContent, CardHeader, CardTitle } from "@/components/shad-ui/card";
import { urlForImage } from "@/lib/sanity.image";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import type { FitMode } from "@sanity/image-url/lib/types/types";
import type React from "react";

interface BehindTheScenesImage {
	_type?: string;
	asset?: {
		_ref?: string;
		url?: string;
		_type?: string;
	};
	hotspot?: {
		x: number;
		y: number;
		height: number;
		width: number;
	};
	crop?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
	alt?: string;
	caption?: string;
	_key: string;
}

interface BehindTheScenesBlockProps {
	title?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	description?: any[];
	images?: BehindTheScenesImage[];
}

const BehindTheScenesBlock: React.FC<BehindTheScenesBlockProps> = ({
	title = "Behind The Scenes",
	description,
	images = [],
}) => {
	if (!description?.length && !images?.length) return null;

	// Function to safely generate image URL
	const getImageUrl = (
		image: BehindTheScenesImage,
		options: { width?: number; height?: number; fit?: string },
	) => {
		try {
			if (image.asset?.url) {
				return image.asset.url;
			}

			if (!image._type && !image.asset?._ref) {
				console.error("Invalid image data:", image);
				return "";
			}

			let imageBuilder = urlForImage(image).format("webp");

			if (options.width) {
				imageBuilder = imageBuilder.width(options.width);
			}

			if (options.height) {
				imageBuilder = imageBuilder.height(options.height);
			}

			if (options.fit) {
				imageBuilder = imageBuilder.fit(options.fit as FitMode);
			}

			return imageBuilder.auto("format").url();
		} catch (error) {
			console.error("Error generating image URL:", error, image);
			return "";
		}
	};

	return (
		<Card className="max-w-2xl mx-auto my-8 border-0 p-0">
			<CardHeader className="p-0">
				<CardTitle className="text-2xl">{title}</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{description && description.length > 0 && (
					<div className="prose prose-sm dark:prose-invert max-w-none mb-6">
						<PortableText
							// @ts-ignore
							value={description}
						/>
					</div>
				)}

				{images && images.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{images.map((image) => {
							const imageUrl = getImageUrl(image, {
								width: 400,
								height: 400,
								fit: "crop",
							});
							if (!imageUrl) return null;

							return (
								<div
									key={image._key}
									className="group relative overflow-hidden rounded-md"
								>
									<img
										src={imageUrl}
										alt={image.alt || "Behind the scenes image"}
										className="w-full h-full object-cover aspect-square"
									/>
									{image.caption && (
										<div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
											<p className="text-white text-sm">{image.caption}</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export { BehindTheScenesBlock };
