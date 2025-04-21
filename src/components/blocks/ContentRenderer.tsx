// src/components/ContentRenderer.jsx
import { HeadlineBlock } from "./";
import { TextBlock } from "./";
import { ImageBlock } from "./";
import { GalleryBlock } from "./";
import { CodeBlock } from "./";
import { DividerBlock } from "./";
import { QuoteBlock } from "./";
import { FeaturedImageBlock } from "./";
import { StackBlock } from "./";

// Type for all possible content blocks from Sanity
const ContentRenderer = ({ blocks = [] }) => {
	if (!blocks || !blocks.length) {
		return null;
	}

	return (
		<div className="content-blocks space-y-8">
			{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
			{blocks.map((block: any) => {
				// Use the _type to determine which component to render
				switch (block._type) {
					case "headlineBlock":
						return <HeadlineBlock key={block._key} {...block} />;
					case "textBlock":
						return <TextBlock key={block._key} {...block} />;
					case "imageBlock":
						return <ImageBlock key={block._key} {...block} />;
					case "galleryBlock":
						return <GalleryBlock key={block._key} {...block} />;
					case "codeBlock":
						return <CodeBlock key={block._key} {...block} />;
					case "dividerBlock":
						return <DividerBlock key={block._key} {...block} />;
					case "quoteBlock":
						return <QuoteBlock key={block._key} {...block} />;
					case "featuredImageBlock":
						return <FeaturedImageBlock key={block._key} {...block} />;
					case "stackBlock":
						return <StackBlock key={block._key} {...block} />;
					default:
						// Fallback for unknown block types - render a simple component showing the type
						return (
							<div
								key={block._key}
								className="p-4 border-l-4 border-gray-300 bg-gray-50 dark:bg-gray-800 rounded"
							>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									Unknown block type: {block._type}
								</p>
								<pre className="mt-2 text-xs overflow-x-auto p-2 bg-gray-100 dark:bg-muted rounded max-h-40">
									{JSON.stringify(block, null, 2)}
								</pre>
							</div>
						);
				}
			})}
		</div>
	);
};

export { ContentRenderer };
