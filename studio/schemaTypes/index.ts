import author from "./authorType";
import cameraType from "./cameraType";
import designType from "./designType";
import developmentType from "./developmentType";
import handcraftedType from "./handcraftedType";
import lensType from "./lensType";
import photographyType from "./photographyType";
import softwareType from "./softwareType";

import codeBlock from "./blocks/codeBlock";
import dividerBlock from "./blocks/dividerBlock";
import featuredImageBlock from "./blocks/featuredImageBlock";
import galleryBlock from "./blocks/galleryBlock";
import headlineBlock from "./blocks/headlineBlock";
import imageBlock from "./blocks/imageBlock";
import quoteBlock from "./blocks/quoteBlock";
// Content Blocks
import stackBlock from "./blocks/stackBlock";
import textBlock from "./blocks/textBlock";

export const schemaTypes = [
	// Document types
	photographyType,
	designType,
	developmentType,
	handcraftedType,
	author,
	cameraType,
	lensType,
	softwareType,

	// Content Blocks
	headlineBlock,
	textBlock,
	imageBlock,
	galleryBlock,
	codeBlock,
	stackBlock,
	dividerBlock,
	quoteBlock,
	featuredImageBlock,
];
