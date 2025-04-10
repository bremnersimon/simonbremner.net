import { cn } from "@/lib/utils";
import type React from "react";

interface HeadlineBlockProps {
	headline?: string;
	size?:
		| "text-lg font-semibold"
		| "text-xl font-semibold"
		| "text-2xl font-bold"
		| "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight";
	alignment?: "text-left" | "text-center" | "text-right";
	width?: "normal" | "wide" | "full";
}

const HeadlineBlock: React.FC<HeadlineBlockProps> = ({
	headline,
	size = "text-2xl font-bold",
	alignment = "text-left",
	width = "normal",
}) => {
	if (!headline) return null;

	const widthClasses = {
		normal: "max-w-2xl mx-auto",
		wide: "max-w-4xl mx-auto",
		full: "w-full",
	};

	return (
		<div className={cn(widthClasses[width])}>
			<h2 className={cn(size, alignment)}>{headline}</h2>
		</div>
	);
};

export { HeadlineBlock };
