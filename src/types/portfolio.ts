import type { SoftwareType } from "@/types/sanity/sanity.types";

export type PortfolioCategory = "design" | "development";

export interface PortfolioImage {
	_type?: string;
	_key?: string;
	asset?: {
		_ref?: string;
		_type?: string;
		url?: string;
	};
	alt?: string;
	caption?: string;
}

export interface PortfolioColorSwatch {
	_key?: string;
	_type?: "colorSwatch";
	name?: string;
	hex?: string;
}

export interface PortfolioCallout {
	_key: string;
	_type: "callout";
	title?: string;
	tone?: "info" | "success" | "warning" | "neutral";
	body?: string;
}

export interface PortfolioVideoEmbed {
	_key: string;
	_type: "videoEmbed";
	url?: string;
	caption?: string;
}

export interface PortfolioCta {
	_key: string;
	_type: "cta";
	label?: string;
	url?: string;
	style?: "primary" | "secondary";
}

export interface PortfolioImageCarousel {
	_key: string;
	_type: "imageCarousel";
	images?: PortfolioImage[];
}

export type PortfolioCodeLanguage =
	| "javascript"
	| "typescript"
	| "jsx"
	| "tsx"
	| "html"
	| "css"
	| "json"
	| "bash"
	| "shell"
	| "python"
	| "sql"
	| "yaml"
	| "markdown";

export interface PortfolioCodeBlock {
	_key: string;
	_type: "codeBlock";
	code?: string;
	language?: PortfolioCodeLanguage;
	filename?: string;
}

export interface PortfolioRichBlock {
	_key: string;
	_type: "block";
	children?: Array<{
		_key: string;
		_type: "span";
		text?: string;
		marks?: string[];
	}>;
	markDefs?: Array<{
		_key: string;
		_type: "link";
		href?: string;
	}>;
	style?: "normal" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote";
	listItem?: "bullet" | "number";
	level?: number;
}

export interface PortfolioInlineImage extends PortfolioImage {
	_key: string;
	_type: "image";
}

export type PortfolioContentItem =
	| PortfolioRichBlock
	| PortfolioInlineImage
	| PortfolioCallout
	| PortfolioVideoEmbed
	| PortfolioCta
	| PortfolioImageCarousel
	| PortfolioCodeBlock
	| { _key?: string; _type?: string; [key: string]: unknown };

export interface PortfolioPost {
	_id: string;
	headline?: string;
	slug?: { current?: string };
	category?: PortfolioCategory[];
	introduction?: string | PortfolioRichBlock[];
	publishedAt?: string;
	techStack?: SoftwareType[];
	serviceTags?: string[];
	colorsUsed?: PortfolioColorSwatch[];
	brandLogo?: PortfolioImage;
	heroImage?: PortfolioImage;
	content?: PortfolioContentItem[];
}
