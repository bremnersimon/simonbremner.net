import { Button } from "@/components/ui/button"

interface PostCardProps {
    title: string
    imageUrl: string
    href: string
    aspectRatio?: "square" | "video"
}

export default function PostCard({ title, imageUrl, href, aspectRatio = "square" }: PostCardProps) {
    return (
        <div className="group relative">
            <div
                className={`relative w-full overflow-hidden rounded-lg bg-muted ${aspectRatio === "square" ? "aspect-square" : "aspect-video"
                    }`}
            >
                <img
                    src={imageUrl || "/images/placeholder.png"}
                    alt={title}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex items-center justify-between mt-4">
                <h3 className="text-lg font-medium">{title}</h3>
                <Button asChild variant="ghost" size="sm">
                    <a href={href}>View Project →</a>
                </Button>
            </div>
        </div>
    )
}

