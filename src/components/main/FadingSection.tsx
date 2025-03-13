import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import chsWaterfront from "@/assets/chs-waterfront.jpg";
import busm from "@/assets/busm.jpg";
import braveBaby from "@/assets/brave-baby-poster.jpg"
import castleAndKey from "@/assets/c-k.jpg"
import sbCode from "@/assets/sb-code.jpg"
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { handleIcon } from '@/lib/handleIconLookup';

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
            content: ["Graphic Design has always been about Communication.",
                "My design philosophy centers on creating work that matters. While I've collaborated with recognizable brands and corporations, the projects that truly resonate are those that serve a higher purpose—solving real problems and improving lives through thoughtful communication.",
                "I've found that the most meaningful design happens when we move beyond aesthetics to address fundamental challenges. Whether it's making complex information accessible, helping mission-driven organizations amplify their message, or creating systems that genuinely improve user experiences, design becomes transformative when it's built on empathy and purpose."],
            image: braveBaby,
            imagePosition: "left",
            button: { label: "View Projects", href: "/projects/design", icon: "pencil", external: false }
        },
        {
            id: 2,
            title: "Developing Interactive Experiences",
            content: ["My path to development began as an extension of my creative vision—a natural evolution driven by the desire to communicate more dynamically than static design would allow. As I learned to code, I discovered a whole new vocabulary for expression, one that enabled truly interactive experiences and deeper connections with users.",
                "Each new technical skill I've acquired has expanded the possibilities for effective communication, pushing me to tackle increasingly complex challenges. What started as simple websites has grown into sophisticated digital products, yet the core motivation remains unchanged: to create more meaningful conversations through technology."],
            image: sbCode,
            imagePosition: "right",
            button: { label: "View Projects", href: "/projects/development", icon: "code", external: false }
        },
        {
            id: 3,
            title: "Capturing The World",
            content: ["Photography gives me a way to capture how I personally see the world. It's not about perfect technique or impressing others—it's simply about documenting moments that catch my eye.",
                "I love finding beauty in everyday scenes that most people walk past. There's something magical about freezing a moment exactly as I experienced it, creating a visual diary that's authentically mine.",
                "Unlike my design and development work, my photography isn't created with clients or audiences in mind. It's a purely personal creative outlet that brings me joy and helps me pay closer attention to the world around me."],
            image: castleAndKey,
            imagePosition: "left",
            button: { label: "View Projects", href: "/projects/photography", icon: "camera", external: false }
        },
        {
            id: 4,
            title: "Handcrafted Products",
            content: ["My hands have always wanted to create what my mind imagines. When I see something that could exist but doesn't, I feel compelled to bring it into the world myself—whether that's a guitar pedal with just the right sound, a leather wallet designed specifically for password storage, or a lamp that casts light exactly how I envision it.",
                "This maker's impulse has pushed me to develop skills across wildly different disciplines. One month I might be soldering circuits, the next I'm working with leather or shaping wood. The medium always follows the idea, not the other way around. I simply learn whatever techniques are necessary to manifest what I've imagined.",
                "There's something deeply satisfying about holding a physical object that began as nothing more than a concept in my mind. These tangible creations connect me to age-old traditions of craftsmanship while satisfying my constant appetite for learning. Each finished piece represents not just a functional object, but a new set of skills mastered and challenges overcome."],
            image: busm,
            imagePosition: "right",
            button: { label: "View Projects", href: "/projects/handcrafted", icon: "hammer", external: false }
        },
    ];

    return (
        <div className="w-full" ref={scrollContainerRef}>
            {sections.map((section) => (
                <ContentSection
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
                        x: imageX
                    }}
                >
                    <div className="overflow-hidden rounded-lg shadow-xl relative">
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
                        <motion.p
                            className="text-foreground-muted"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Separator className="my-4" />
                            {content.content.map((paragraph, index) => {
                                return <p key={index} className="mb-4 text-lg leading-loose">{paragraph}</p>
                            })}
                            <Button asChild variant="default" className="mt-4" >
                                <a href={content.button.href} target={content.button.external ? "_blank" : "_self"}>
                                    {content.button.label} {handleIcon(content.button.icon ? content.button.icon : "")}
                                </a>
                            </Button>
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export { FadingSection };