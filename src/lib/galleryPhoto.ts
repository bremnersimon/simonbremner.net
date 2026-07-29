import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlForImage } from "@/lib/sanity";

const GRID_IMAGE_WIDTHS = [360, 480, 640, 768, 1024, 1365] as const;
const GRID_DEFAULT_WIDTH = 768;
const MODAL_WIDTH = 2200;
const THUMBNAIL_WIDTH = 600;
const PLACEHOLDER_WIDTH = 40;

const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

export interface GalleryPhotoSource {
	_id: string;
	title: string;
	slug: { current: string } | string;
	altText?: string;
	description?: string;
	image?: SanityImageSource & {
		asset?: {
			metadata?: {
				dimensions?: {
					width?: number;
					height?: number;
					aspectRatio?: number;
				};
			};
		};
	};
	categories?: unknown[];
	tags?: string[];
	dateTaken?: string;
	location?: string;
	featured?: boolean;
	camera?: unknown;
	lens?: unknown;
	focalLength?: string | null;
	aperture?: string | null;
	shutterSpeed?: string | null;
	iso?: number | null;
}

export interface GalleryPhoto {
	_id: string;
	title: string;
	slug: { current: string } | string;
	altText?: string;
	description?: string;
	image: {
		src: string;
		modalSrc: string;
		thumbnail: string;
		placeholder: string;
		srcSetAvif: string;
		srcSetWebp: string;
		sizes: string;
		alt: string;
		width: number;
		height: number;
	};
	dimensions: {
		width: number;
		height: number;
		aspectRatio: number;
		orientation: "landscape" | "portrait" | "square";
	};
	categories: unknown[];
	tags: string[];
	dateTaken?: string;
	location?: string;
	featured?: boolean;
	camera?:
		| {
				_id?: string;
				name?: string;
				brand?: string;
				modelNumber?: string;
		  }
		| string
		| null;
	lens?:
		| {
				_id?: string;
				name?: string;
				brand?: string;
				lensFocalLength?: string;
		  }
		| string
		| null;
	focalLength?: string | null;
	aperture?: string | null;
	shutterSpeed?: string | null;
	iso?: number | null;
}

const buildImageVariant = (
	source: SanityImageSource,
	width: number,
	format: "webp" | "avif",
	quality: number,
) => {
	return urlForImage(source)
		.width(width)
		.fit("max")
		.quality(quality)
		.format(format)
		.url();
};

const buildSrcSet = (
	source: SanityImageSource,
	format: "webp" | "avif",
	quality: number,
) => {
	return GRID_IMAGE_WIDTHS.map((width) => {
		const url = buildImageVariant(source, width, format, quality);
		return `${url} ${width}w`;
	}).join(", ");
};

export const mapGalleryPhoto = (photo: GalleryPhotoSource): GalleryPhoto => {
	const dimensions = photo.image?.asset?.metadata?.dimensions;
	const width = dimensions?.width || 800;
	const height = dimensions?.height || 600;
	const aspectRatio = dimensions?.aspectRatio || width / height;
	const orientation =
		width > height ? "landscape" : width < height ? "portrait" : "square";

	const alt = photo.altText || photo.title;
	const hasImage = Boolean(photo.image);
	const safeImage = photo.image as SanityImageSource;

	const src = hasImage
		? buildImageVariant(safeImage, GRID_DEFAULT_WIDTH, "webp", 66)
		: "/images/no-image.svg";
	const modalSrc = hasImage
		? buildImageVariant(safeImage, MODAL_WIDTH, "webp", 80)
		: "/images/no-image.svg";
	const thumbnail = hasImage
		? buildImageVariant(safeImage, THUMBNAIL_WIDTH, "webp", 68)
		: "/images/no-image.svg";
	const placeholder = hasImage
		? buildImageVariant(safeImage, PLACEHOLDER_WIDTH, "webp", 32)
		: "/images/no-image.svg";

	return {
		_id: photo._id,
		title: photo.title,
		slug: photo.slug,
		altText: photo.altText,
		description: photo.description,
		image: {
			src,
			modalSrc,
			thumbnail,
			placeholder,
			srcSetAvif: hasImage ? buildSrcSet(safeImage, "avif", 52) : "",
			srcSetWebp: hasImage ? buildSrcSet(safeImage, "webp", 66) : "",
			sizes: GRID_SIZES,
			alt,
			width,
			height,
		},
		dimensions: {
			width,
			height,
			aspectRatio,
			orientation,
		},
		categories: photo.categories || [],
		tags: photo.tags || [],
		dateTaken: photo.dateTaken,
		location: photo.location,
		featured: photo.featured,
		camera: photo.camera || null,
		lens: photo.lens || null,
		focalLength: photo.focalLength || null,
		aperture: photo.aperture || null,
		shutterSpeed: photo.shutterSpeed || null,
		iso: photo.iso || null,
	};
};
