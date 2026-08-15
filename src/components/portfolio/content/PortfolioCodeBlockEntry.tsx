import type { PortfolioCodeBlock } from "@/types/portfolio";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";
import { useMemo, useState } from "react";

const languageLabels: Record<string, string> = {
	javascript: "JavaScript",
	typescript: "TypeScript",
	jsx: "JSX",
	tsx: "TSX",
	html: "HTML",
	css: "CSS",
	json: "JSON",
	bash: "Bash",
	shell: "Shell",
	python: "Python",
	sql: "SQL",
	yaml: "YAML",
	markdown: "Markdown",
	plaintext: "Plain Text",
};

const languageAliases: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	sh: "bash",
	shell: "bash",
	htm: "html",
	yml: "yaml",
	md: "markdown",
	text: "plaintext",
	plain: "plaintext",
	plaintext: "plaintext",
};

const availableLanguages = new Set([
	"javascript",
	"typescript",
	"jsx",
	"tsx",
	"html",
	"css",
	"json",
	"bash",
	"python",
	"sql",
	"yaml",
	"markdown",
	"plaintext",
]);

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("jsx", javascript);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("markdown", markdown);

function normalizeLanguage(input?: string) {
	if (!input) {
		return "plaintext";
	}

	const lower = input.trim().toLowerCase();
	const alias = languageAliases[lower] ?? lower;

	if (availableLanguages.has(alias)) {
		return alias;
	}

	return "plaintext";
}

function highlightSource(code: string, language: string) {
	if (language === "plaintext") {
		return {
			html: hljs.highlightAuto(code).value,
			language: "plaintext",
		};
	}

	try {
		return {
			html: hljs.highlight(code, { language }).value,
			language,
		};
	} catch {
		return {
			html: hljs.highlightAuto(code).value,
			language: "plaintext",
		};
	}
}

interface PortfolioCodeBlockEntryProps {
	value: PortfolioCodeBlock;
}

export function PortfolioCodeBlockEntry({ value }: PortfolioCodeBlockEntryProps) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
	const source = value.code || "";
	const normalizedLanguage = normalizeLanguage(value.language);
	const languageLabel = languageLabels[normalizedLanguage] || "Plain Text";

	const highlightedLines = useMemo(() => {
		const highlighted = highlightSource(source, normalizedLanguage);
		const splitLines = highlighted.html.split(/\r?\n/);

		return splitLines;
	}, [normalizedLanguage, source]);

	async function handleCopy() {
		if (!source) {
			setCopyState("error");
			window.setTimeout(() => setCopyState("idle"), 1600);
			return;
		}

		try {
			await navigator.clipboard.writeText(source);
			setCopyState("copied");
			window.setTimeout(() => setCopyState("idle"), 1600);
		} catch {
			setCopyState("error");
			window.setTimeout(() => setCopyState("idle"), 1600);
		}
	}

	return (
		<div className="portfolio-code-block mx-auto my-20 w-full max-w-[1100px] px-5">
			<div className="overflow-hidden rounded-none border border-border bg-background text-foreground">
				<div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
					<div className="flex min-w-0 items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
						<span className="inline-flex h-6 items-center border border-border bg-foreground px-2 text-[10px] font-semibold leading-none text-background">
							{languageLabel}
						</span>
						{value.filename ? (
							<span className="truncate normal-case text-xs text-foreground/80">
								{value.filename}
							</span>
						) : null}
					</div>
					<button
						type="button"
						onClick={handleCopy}
						className="rounded-none border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
						aria-label="Copy code block"
						aria-live="polite"
					>
						{copyState === "copied"
							? "Copied"
							: copyState === "error"
								? "Copy Failed"
								: "Copy"}
					</button>
				</div>

				<pre className="overflow-x-auto bg-background p-0 text-sm leading-6">
					<code className="hljs block min-w-max bg-background text-foreground">
						{highlightedLines.map((line, index) => (
							<div key={`${value._key}-line-${index}`} className="grid grid-cols-[3rem_1fr]">
								<span className="select-none border-r border-border px-3 text-right text-xs text-muted-foreground">
									{index + 1}
								</span>
								<span
									className="whitespace-pre px-4"
									dangerouslySetInnerHTML={{ __html: line || " " }}
								/>
							</div>
						))}
					</code>
				</pre>
			</div>
		</div>
	);
}
