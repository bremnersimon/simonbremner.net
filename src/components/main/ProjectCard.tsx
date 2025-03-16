import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import type { ProjectCardProps } from "@/types";
import { ArrowRight } from "lucide-react";

type CardProps = ProjectCardProps & {
    id?: string;
    aspectRatio?: "square" | "video";
}

export default function ProjectCard({
    title,
    mainImage,
    slug,
    category,
    tags = [],
    aspectRatio = "square",
    showCategory = true,
    id,
}: CardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Construct the project URL based on category and slug
    const projectUrl = category
        ? `/projects/${category.toLowerCase()}/${slug.current}`
        : ``;

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Make the entire card clickable with a primary anchor tag */}
            <a
                href={projectUrl}
                className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            >
                <div
                    className={`relative w-full overflow-hidden rounded-lg ${aspectRatio === "square" ? "aspect-square" : "aspect-video"
                        }`}
                >
                    <img
                        src={mainImage?.src || "/images/chs-waterfront.jpg"}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay with tags on hover/tap */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
                        <div className="flex flex-col items-center justify-center relative w-full h-full">
                            {tags.length > 0 && (
                                <div className="absolute left-0 bottom-0 right-0 flex flex-wrap gap-2 justify-start p-4">
                                    {tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <Button
                                variant="default"
                                size="sm"
                                className=" hover:text-white pointer-events-none"
                            >
                                View Project
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-1">
                    {showCategory && category && (
                        <div className="text-sm text-muted-foreground">{category}</div>
                    )}

                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium group-hover:text-primary transition-colors duration-300">
                            {title}
                        </h3>
                        <motion.div
                            animate={{ x: isHovered ? 5 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="pointer-events-none"
                        >
                            <div className="flex items-center justify-center h-8 w-8">
                                <ArrowRight className="text-muted-foreground group-hover:text-primary" size={16} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </a>

            {/* Special handling for tap on mobile - show overlay when focused */}
            <style>{`
                @media (max-width: 768px) {
                    :global(.group:active .absolute) {
                        opacity: 1 !important;
                    }
                }
            `}</style>
        </div>
    );
}