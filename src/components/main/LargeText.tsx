import { motion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"
import { Container } from "./Container"

interface LargeTextProps {
    content: string[]
    textSize?: "default" | "large"
    // New prop to allow highlighting specific words
    highlightedWords?: {
        // Map section index to array of word indices to highlight
        [sectionIndex: number]: number[]
    }
    // Optional prop for customizing highlight style
    highlightStyle?: string
}

// Component for a single text section with its own scroll animation
const TextSection = ({ text, index, textSize, highlightedWords, highlightStyle }: {
    text: string,
    index: number,
    textSize: "default" | "large",
    highlightedWords?: number[],
    highlightStyle?: string
}) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    // Each section has its own scroll progress tracker
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "center center"],
        layoutEffect: false,
    });

    // Split text into words and characters for animation
    const words = text.split(' ').filter(word => word.length > 0);

    return (
        <motion.div
            ref={sectionRef}
            className={`mb-20 text-foreground ${textSize === "large"
                ? "text-2xl md:text-3xl lg:text-4xl"
                : "text-xl md:text-2xl"
                } leading-tight font-medium `}
            style={{
                position: "relative",
            }}
        >
            <div className="flex flex-wrap" style={{ position: "relative", }}>
                {words.map((word, wordIndex) => (
                    <WordAnimation
                        key={`word-${index}-${wordIndex}`}
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
    highlightStyle
}: {
    word: string,
    wordIndex: number,
    totalWords: number,
    scrollYProgress: any,
    isHighlighted?: boolean,
    highlightStyle?: string
}) => {
    // Calculate when this word should appear
    // Spread words evenly across the first 75% of scroll progress
    const wordStart = (wordIndex / totalWords) * 0.75;
    const wordEnd = wordStart + 0.05;

    const opacity = useTransform(
        scrollYProgress,
        [wordStart, wordEnd],
        [0, 1]
    );

    const y = useTransform(
        scrollYProgress,
        [wordStart, wordEnd],
        [20, 0]
    );

    // Default highlight style if none provided
    const defaultHighlightStyle = "bg-primary/20 px-1 rounded text-primary font-semibold";

    // Apply highlight class if word is highlighted
    const highlightClass = isHighlighted ? (highlightStyle || defaultHighlightStyle) : "";

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

export default function LargeText({ content, textSize = "large", highlightedWords, highlightStyle }: LargeTextProps) {
    return (
        <section id="aboutMe" className="w-full py-24 relative">
            <Container className="relative">
                <div className="space-y-20 relative">
                    {content.map((text, idx) => (
                        <TextSection
                            key={`section-${idx}`}
                            text={text}
                            index={idx}
                            textSize={textSize}
                            highlightedWords={highlightedWords?.[idx]}
                            highlightStyle={highlightStyle}
                        />
                    ))}
                </div>
            </Container>
        </section>
    );
}