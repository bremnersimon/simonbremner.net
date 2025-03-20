import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import busm from "@/assets/busm.jpg";
import braveBaby from "@/assets/brave-baby-poster.jpg"
import castleAndKey from "@/assets/c-k.jpg"
import sbCode from "@/assets/sb-code.jpg"
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { handleIcon } from '@/lib/handleIconLookup';
import { cn } from '@/lib/utils';

type SectionProps = {
    id: number;
    title: string;
    content: string[];
    image: ImageMetadata;
    imagePosition: "left" | "right";
    button: { label: string, href: string, icon?: string, external?: boolean }
}

const FadingSection = () => {
    // Main scroll container reference
    const scrollContainerRef = useRef(null);

    // Array of section data with alternating left/right layout
    const sections: SectionProps[] = [
        {
            id: 1,
            title: "Designing With Purpose",
            content: [
                "Graphic Design has always been about Communication.",
                "My design philosophy centers on communication. While I've collaborated with recognizable brands and corporations, the projects that truly resonate are those that solve real problems and improve lives through meaningful communication.",
            ],
            image: braveBaby,
            imagePosition: "left",
            button: { label: "View Projects", href: "/projects/design", icon: "pencil", external: false }
        },
        {
            id: 2,
            title: "Developing Experiences",
            content: [
                "I started coding because I wanted to make interactive experiences.",
                "Letting the user choose their journey has been at the center of my development work. I've always been drawn to the idea of creating experiences that are not only functional but also engaging and memorable.",
            ],
            image: sbCode,
            imagePosition: "right",
            button: { label: "View Projects", href: "/projects/development", icon: "code", external: false }
        },
        {
            id: 3,
            title: "Capturing Moments",
            content: ["Photography allows me to capture the world as I see it.",
                "Unlike my Design and Development work, Photography is a purely personal creative outlet that brings me joy and helps me pay closer attention to the world around me."],
            image: castleAndKey,
            imagePosition: "left",
            button: { label: "View Projects", href: "/projects/photography", icon: "camera", external: false }
        },
        {
            id: 4,
            title: "Crafting Products",
            content: ["I have always been fascinated with how the world around me works.",
                "I am a firm believer that we are capable of anything we put out minds to (within reason...). I'm not scared of learning new skills or taking on new challenges in the pursuit of my imagination."
            ],
            image: busm,
            imagePosition: "right",
            button: { label: "View Projects", href: "/projects/handcrafted", icon: "hammer", external: false }
        },
    ];

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

const ContentSection = ({ content }: { content: SectionProps }) => {
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

    // Modified transforms for text and image that maintain position longer
    const textX = useTransform(
        scrollYProgress,
        [0, 0.3, 0.7, 1],
        content.imagePosition === "left"
            ? [50, 0, 0, -50]
            : [-50, 0, 0, 50]
    );

    const imageX = useTransform(
        scrollYProgress,
        [0, 0.3, 0.7, 1],
        content.imagePosition === "left"
            ? [-50, 0, 0, 50]
            : [50, 0, 0, -50]
    );

    const scale = useTransform(
        scrollYProgress,
        [0, 0.3, 0.7, 1],
        [0.8, 1, 1, 0.8]
    );

    return (
        <motion.div
            ref={sectionRef}
            className="w-full flex items-center justify-center relative py-20 md:py-40"
            style={{
                opacity,
                scale
            }}
        >
            <div className="w-full mx-auto px-4 flex flex-col md:flex-row items-center">
                {/* Image Column */}
                <motion.div
                    className={`w-full md:w-1/2 p-4 ${content.imagePosition === "right" ? "md:order-2" : "md:order-1"}`}
                    style={{
                        x: imageX,
                    }}
                >
                    <div className="rounded-lg shadow-xl relative">
                        <div className={cn("absolute top-[-50px] md:top-[50px] w-[100px] h-[100px] rounded-lg bg-primary flex items-center justify-center z-10 shadow-md text-white", content.imagePosition === "right" ? "right-[50%] translate-x-1/2 md:translate-x-0 md:right-[-50px]" : "translate-x-1/2 md:translate-x-0 right-[50%] md:left-[-50px]")}>
                            {handleIcon(content.button.icon ? content.button.icon : "", 35)}
                        </div>
                        <img
                            src={content.image.src}
                            alt={content.title}
                            className="w-full h-auto object-cover aspect-[4/5]"
                            onError={(e: any) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(content.title)}`;
                            }}
                        />
                    </div>
                </motion.div>

                {/* Text Column */}
                <motion.div
                    className={`w-full md:w-1/2 p-4 ${content.imagePosition === "right" ? "md:order-1" : "md:order-2"}`}
                    style={{
                        x: textX
                    }}
                >
                    <div className="">
                        <motion.h2
                            className="text-xl md:text-4xl lg:text-6xl text-foreground font-bold mb-6"
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
                            <Separator className="my-4" />
                            {content.content.map((paragraph, index) => (
                                <p key={index} className="mb-4 text-lg leading-loose">{paragraph}</p>
                            ))}
                            <Button asChild variant="default" className="mt-4" >
                                <a href={content.button.href} target={content.button.external ? "_blank" : "_self"}>
                                    {content.button.label} {handleIcon(content.button.icon ? content.button.icon : "")}
                                </a>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export { FadingSection };