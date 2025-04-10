import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type React from "react";

interface AuthorImage {
	_type?: string;
	asset?: {
		_ref: string;
		_type: string;
	};
}

interface Author {
	name: string;
	image?: AuthorImage;
}

interface AuthorSectionProps {
	author?: Author;
	publishedDate?: string;
	excerpt?: string;
	authorImage?: string;
}

const AuthorSection: React.FC<AuthorSectionProps> = ({
	author,
	publishedDate,
	excerpt,
	authorImage
}) => {
	return (
		<div className="mb-16">
			{author && (
				<div className="flex items-center mb-6">
					{author.image && (
						<div className="w-10 h-10 rounded-full overflow-hidden mr-3">
							<img
								src={authorImage}
								alt={author.name}
								className="w-full h-full object-cover"
							/>
						</div>
					)}
					<div>
						<div className="text-sm text-muted-foreground">
							By <span className="font-medium">{author.name}</span>
						</div>
						{publishedDate && (
							<div className="text-sm text-muted-foreground">
								{publishedDate}
							</div>
						)}
					</div>
				</div>
			)}

			{excerpt && (
				<div className="text-xl font-medium italic mb-8 text-muted-foreground border-l-4 pl-4 border-primary">
					{excerpt}
				</div>
			)}
		</div>
	);
};

export { AuthorSection };
