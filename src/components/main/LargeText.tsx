import { cn } from "@/lib/utils";
import {
	type MotionValue,
	motion,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";

interface LargeTextProps {
	index?: number;
	className?: string;
	content: string;
	textSize?: "default" | "large";
	// Updated prop to allow highlighting specific words in a single string
	highlightedWords?: number[];
	// Optional prop for customizing highlight style
	highlightStyle?: string;
}

// Component for text section with scroll animation
const TextSection = ({
	text,
	textSize,
	highlightedWords,
	highlightStyle,
}: {
	text: string;
	textSize: "default" | "large";
	highlightedWords?: number[];
	highlightStyle?: string;
}) => {
	const sectionRef = useRef<HTMLDivElement>(null);

	// Section scroll progress tracker
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "center center"],
		layoutEffect: false,
	});

	// Split text into words for animation
	const words = text.split(" ").filter((word) => word.length > 0);

	return (
		<motion.div
			ref={sectionRef}
			className={`mb-20 text-foreground ${
				textSize === "large"
					? "text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
					: "text-xl md:text-2xl"
			} leading-tight font-medium `}
			style={{
				position: "relative",
			}}
		>
			<div className="flex flex-wrap" style={{ position: "relative" }}>
				{words.map((word, wordIndex) => (
					<WordAnimation
						key={`word-${word + wordIndex}`}
						word={word}
						wordIndex={wordIndex}
						totalWords={words.length}
						scrollYProgress={scrollYProgress}
						isHighlighted={highlightedWords?.includes(wordIndex)}
						highlightStyle={highlightStyle}
					/>
				))}
			</div>
		</motion.div>
	);
};

// Animation component for each word
const WordAnimation = ({
	word,
	wordIndex,
	totalWords,
	scrollYProgress,
	isHighlighted,
	highlightStyle,
}: {
	word: string;
	wordIndex: number;
	totalWords: number;
	scrollYProgress: MotionValue<number>;
	isHighlighted?: boolean;
	highlightStyle?: string;
}) => {
	// Calculate when this word should appear
	// Spread words evenly across the first 75% of scroll progress
	const wordStart = (wordIndex / totalWords) * 0.75;
	const wordEnd = wordStart + 0.05;

	const opacity = useTransform(scrollYProgress, [wordStart, wordEnd], [0, 1]);

	const y = useTransform(scrollYProgress, [wordStart, wordEnd], [20, 0]);

	// Default highlight style if none provided
	const defaultHighlightStyle =
		"bg-primary/20 px-1 rounded text-primary font-semibold";

	// Apply highlight class if word is highlighted
	const highlightClass = isHighlighted
		? highlightStyle || defaultHighlightStyle
		: "";

	return (
		<motion.div
			style={{
				opacity,
				y,
				marginRight: "0.4em",
				marginBottom: "0.1em",
				display: "inline-block",
				position: "relative",
			}}
			className={`text-foreground font-normal ${highlightClass}`}
		>
			{word}
		</motion.div>
	);
};

export default function LargeText({
	className,
	content,
	textSize = "large",
	highlightedWords,
	highlightStyle,
	index,
}: LargeTextProps) {
	return (
		<section
			id="aboutMe"
			key={index + content}
			className={cn("w-full relative", className)}
		>
			<div className="container mx-auto px-4 md:px-0">
				<div className="space-y-4 md:space-y-10 lg:space-y-20 relative">
					<TextSection
						text={content}
						textSize={textSize}
						highlightedWords={highlightedWords}
						highlightStyle={highlightStyle}
					/>
				</div>
			</div>
		</section>
	);
}
