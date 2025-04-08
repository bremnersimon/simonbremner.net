import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from '../ui/button';
import { handleIcon } from '@/lib/handleIconLookup';
import { cn } from '@/lib/utils';
import type { FadingSectionProps } from "@/types/types"
import { Icon } from './Icon';

const FadingSection = ({ sections }: { sections: FadingSectionProps[] }) => {
    // Main scroll container reference
    const scrollContainerRef = useRef(null);

    return (
        <div className="w-full" ref={scrollContainerRef}>
            {sections.map((section) => (
                <ContentSection
                    key={section.id}
                    content={section}
                />
            ))}
        </div>
    );
};

const ContentSection = ({ content }: { content: FadingSectionProps }) => {
    // Reference to the section element
    const sectionRef = useRef(null);

    // Get scroll progress for this specific section
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Modified opacity transform that maintains visibility longer
    // Fades in at 30% visibility and stays visible until less than 30% visible
    const opacity = useTransform(
        scrollYProgress,
        // Input range (0 = element at bottom of viewport, 1 = element at top)
        [0, 0.3, 0.7, 1],
        // Output range (opacity values)
        [0, 1, 1, 0]
    );

    return (
        <motion.div
            ref={sectionRef}
            className="w-full flex items-center justify-center relative py-20 lg:py-40"
            style={{
                opacity,
            }}
        >
            <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center">
                {/* Image Column */}
                <div
                    className={`w-full p-4 ${content.imagePosition === "right" ? "lg:order-2" : "lg:order-1"}`}

                >
                    <div className="rounded-lg shadow-xl relative">
                        <div className={cn("absolute top-[-50px] lg:top-[50px] w-[100px] h-[100px] rounded-lg bg-primary flex items-center justify-center z-10 shadow-md text-white", content.imagePosition === "right" ? "right-[50%] translate-x-1/2 lg:translate-x-0 lg:right-[-50px]" : "translate-x-1/2 lg:translate-x-0 right-[50%] lg:left-[-50px]")}>
                            {handleIcon(content.button.icon ? content.button.icon : "", 35)}
                        </div>
                        <img
                            src={content.image.src}
                            alt={content.title}
                            className="w-full h-auto object-cover aspect-[4/5]"
                            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(content.title)}`;
                            }}
                        />
                    </div>
                </div>

                {/* Text Column */}
                <div
                    className={`w-full p-4 ${content.imagePosition === "right" ? "lg:order-1" : "lg:order-2"}`}
                >
                    <div className="">
                        <motion.h2
                            className="text-xl md:text-4xl lg:text-5xl text-foreground font-bold mb-6"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            {content.title}
                        </motion.h2>
                        <motion.div
                            className="text-foreground-muted"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            {content.content.map((paragraph) => (
                                <p key={paragraph} className="mb-4 text-lg leading-loose">{paragraph}</p>
                            ))}
                            <a href={content.button.href} target={content.button.external ? "_blank" : "_self"}>
                                <Button variant="default" className="mt-4" >
                                    {content.button.label} <Icon name={content.button.icon ? content.button.icon : ""} />
                                </Button>
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export { FadingSection };