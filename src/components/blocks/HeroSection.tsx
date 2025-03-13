import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MainImage {
    alt?: string;
    caption?: string;
}

interface ShootMetadata {
    theme?: string;
}

interface HeroSectionProps {
    title: string;
    mainImage?: MainImage & {
        url: () => string;
    };
    shootMetadata?: ShootMetadata;
    urlForImage?: (image: any) => { url: () => string };
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    mainImage,
    shootMetadata,
    urlForImage
}) => {
    return (
        <div className="relative h-[50vh] md:h-[70vh] mb-16">
            {/* Background image */}
            <div className="absolute inset-0">
                {mainImage && urlForImage && (
                    <img
                        src={urlForImage(mainImage).url()}
                        alt={mainImage.alt || title}
                        className="w-full h-full object-cover opacity-90"
                    />
                )}
                {/* Dark gradient overlay for text visibility */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                </div>
            </div>

            {/* Text container - explicitly positioned at bottom */}
            <div className="absolute inset-x-0 bottom-0 pb-8 pt-16">
                <div className="container max-w-5xl mx-auto px-4">
                    <div className="flex items-center mb-4">
                        {shootMetadata?.theme && (
                            <Badge
                                variant="outline"
                                className="bg-primary/80 text-white border-primary/30 hover:bg-primary/90 ml-2 text-md">
                                {shootMetadata.theme}
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        {title}
                    </h1>
                    {mainImage?.caption && (
                        <p className="text-xl text-white/90 max-w-3xl">
                            {mainImage.caption}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;