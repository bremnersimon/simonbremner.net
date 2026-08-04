import { PortableText } from "@portabletext/react";
import type { PortableTextReactComponents } from "@portabletext/react";

export interface PortfolioPortableTextBlock extends Record<string, unknown> {
	_type: "block";
}

interface PortfolioRichTextEntryProps {
	value: PortfolioPortableTextBlock;
}

const textComponents = {
	block: {
		normal: ({ children }) => (
			<p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
		),
		h1: ({ children }) => (
			<h1 className="mb-4 mt-8 text-3xl font-semibold tracking-tight">
				{children}
			</h1>
		),
		h2: ({ children }) => (
			<h2 className="mb-4 mt-8 text-2xl font-semibold tracking-tight">
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h3 className="mb-3 mt-6 text-xl font-semibold">{children}</h3>
		),
		blockquote: ({ children }) => (
			<blockquote className="my-6 border-l-2 border-border pl-4 italic text-muted-foreground">
				{children}
			</blockquote>
		),
	},
	marks: {
		link: ({ children, value }) => (
			<a
				href={typeof value?.href === "string" ? value.href : "#"}
				target="_blank"
				rel="noopener noreferrer"
				className="font-medium text-primary underline underline-offset-2"
			>
				{children}
			</a>
		),
		code: ({ children }) => (
			<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
				{children}
			</code>
		),
	},
	list: {
		bullet: ({ children }) => (
			<ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>
		),
		number: ({ children }) => (
			<ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>
		),
	},
} satisfies Partial<PortableTextReactComponents>;

export function PortfolioRichTextEntry({ value }: PortfolioRichTextEntryProps) {
	return (
		<div className="rounded-lg border border-border/60 bg-card/30 px-5 py-4">
			<PortableText value={[value]} components={textComponents} />
		</div>
	);
}
