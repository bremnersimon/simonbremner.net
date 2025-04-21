import { Badge } from "@/components/shad-ui/badge";
import type { ProjectCardProps } from "@/types";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type CardProps = ProjectCardProps & {
	id?: string;
	aspectRatio?: "square" | "video";
	showCategory?: boolean;
};

export default function ProjectCard({
	title,
	mainImage,
	slug,
	category,
	tags = [],
	aspectRatio = "square",
	showCategory = true,
}: CardProps) {
	const [isHovered, setIsHovered] = useState(false);

	const projectUrl = category
		? `/projects/${category.toLowerCase()}/${slug.current}`
		: "";

	return (
		<div
			className="group relative"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<a
				href={projectUrl}
				className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
			>
				<div
					className={`relative w-full overflow-hidden rounded-lg ${
						aspectRatio === "square" ? "aspect-square" : "aspect-video"
					}`}
				>
					<img
						src={mainImage?.src || "/images/chs-waterfront.jpg"}
						alt={title}
						className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
					/>

					<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
						<div className="flex flex-col items-center justify-center relative w-full h-full">
							{tags.length > 0 && (
								<div className="absolute left-0 bottom-0 right-0 flex flex-wrap gap-2 justify-start p-4">
									{tags.map((tag) => (
										<Badge key={tag} variant="secondary" className="py-2 px-4">
											{tag}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="mt-4 space-y-1">
					{showCategory && category && (
						<div className="text-sm text-muted-foreground">
							{category.slice(0, 1).toUpperCase() + category.slice(1)}
						</div>
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
								<ArrowRight
									className="text-muted-foreground group-hover:text-primary"
									size={16}
								/>
							</div>
						</motion.div>
					</div>
				</div>
			</a>

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
