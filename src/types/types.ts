export type FadingSectionProps = {
	id: number;
	title: string;
	content: string[];
	image: ImageMetadata;
	imagePosition: "left" | "right";
	button: { label: string; href: string; icon?: string; external?: boolean };
};

export type AboutHeroTextProps = {
	headline: string;
	paragraphs: string[];
};

export type SEOProps = {
	title: string;
	description: string;
	canonical?: string;
	pageType?: "website" | "article";
	image?: ImageMetadata | string;
	article?: {
		publishedTime?: string;
		modifiedTime?: string;
		author?: string;
		tags?: string[];
	};
	noindex?: boolean;
	nofollow?: boolean;
};
