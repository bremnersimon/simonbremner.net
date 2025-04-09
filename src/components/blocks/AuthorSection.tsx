import type React from 'react';

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
    urlForImage: (image: AuthorImage) => {
        width: (width: number) => {
            height: (height: number) => {
                url: () => string;
            };
        };
    };
}

const AuthorSection: React.FC<AuthorSectionProps> = ({
    author,
    publishedDate,
    excerpt,
    urlForImage
}) => {
    return (
        <div className="mb-16">
            {author && (
                <div className="flex items-center mb-6">
                    {author.image && (
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <img
                                src={urlForImage(author.image)
                                    .width(80)
                                    .height(80)
                                    .url()}
                                alt={author.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div>
                        <div className="text-sm text-muted-foreground">
                            By{" "}
                            <span className="font-medium">{author.name}</span>
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

export default AuthorSection;