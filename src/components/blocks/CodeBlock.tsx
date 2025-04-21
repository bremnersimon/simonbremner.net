import { Button } from "@/components/shad-ui/button";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml"; // Use xml for HTML
import { Copy } from "lucide-react";
import type React from "react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Register the languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("html", xml); // Register XML as HTML
hljs.registerLanguage("css", css);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);

interface CodeBlockProps {
	code?: string;
	language?: "bash" | "javascript" | "typescript" | "html" | "css" | "python";
}

const CodeBlock: React.FC<CodeBlockProps> = ({
	code,
	language = "javascript",
}) => {
	const codeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (codeRef.current && code) {
			// Clear any existing highlighting
			codeRef.current.textContent = code;

			// Apply the correct language class
			codeRef.current.className = `language-${language}`;

			// Highlight the element
			hljs.highlightElement(codeRef.current);
		}
	}, [code, language]); // This will re-run when code or language changes

	if (!code) return null;

	const copyToClipboard = () => {
		navigator.clipboard.writeText(code);
		toast("Code copied to clipboard");
	};

	return (
		<div className="bg-[#0d1117] relative max-w-3xl mx-auto my-6 overflow-hidden rounded-lg border border-[#30363d]">
			<div className="flex items-center justify-between bg-foreground/5 px-4 py-2">
				<span className="text-sm text-[#c9d1d9] font-mono">{language}</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={copyToClipboard}
					className="text-[#c9d1d9] hover:text-white hover:bg-[#1f2937] flex flex-row gap-2"
				>
					<Copy className="h-4 w-4" />
					<span className="text-xs md:inline-block hidden">Copy</span>
				</Button>
			</div>

			<div className="p-0 overflow-hidden">
				<pre className="p-4 overflow-x-auto bg-[#0d1117] text-[#c9d1d9] text-sm">
					<code
						ref={codeRef}
						className={`language-${language} text-xs font-mono`}
					>
						{code}
					</code>
				</pre>
			</div>
		</div>
	);
};

export { CodeBlock };
