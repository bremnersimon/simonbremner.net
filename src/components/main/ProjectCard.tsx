import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProjectCardProps {
    title: string;
    imageUrl: string;
    href: string;
    category?: string;
    tags?: string[];
    aspectRatio?: "square" | "video";
    showCategory?: boolean;
}

export default function ProjectCard({
    title,
    imageUrl,
    href,
    category,
    tags = [],
    aspectRatio = "square",
    showCategory = true,
}: ProjectCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Extract just the slug from the href
    const getSlug = (path) => {
        return path.split('/').filter(Boolean).pop();
    };

    // Construct the proper URL based on category and extracted slug
    const projectUrl = category
        ? `/projects/${category.toLowerCase()}/${getSlug(href)}`
        : `/projects/${getSlug(href)}`;

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
                aria-label={`View ${title} project`}
            >
                <div
                    className={`relative w-full overflow-hidden rounded-lg ${aspectRatio === "square" ? "aspect-square" : "aspect-video"
                        }`}
                >
                    <img
                        src={imageUrl || "/images/placeholder.png"}
                        alt={title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay with tags on hover/tap */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
                        <div className="p-4 text-center">
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center mb-4">
                                    {tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="bg-primary/80 hover:bg-primary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/40 hover:text-white pointer-events-none"
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg>
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