// src/components/blocks/FeaturedImageBlock.tsx
import type React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { urlForImage } from '@/lib/sanity.image';
import { Badge } from '@/components/ui/badge';

interface FeaturedImageBlockProps {
    image?: {
        _type?: string;
        asset?: {
            url?: string;
            _id?: string;
            _ref?: string;
            _type?: string;
        };
        hotspot?: {
            x: number;
            y: number;
            height: number;
            width: number;
        };
        crop?: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        };
        alt?: string;
        caption?: string;
        _ref?: string; // For direct references
    };
    size?: 'standard' | 'large' | 'fullWidth';
    imageMetadata?: {
        camera?: {
            _ref: string;
        };
        lens?: {
            _ref: string;
        };
        aperture?: string;
        shutterSpeed?: string;
        iso?: number;
    };
    showMetadata?: boolean;
    cameraData?: { name?: string; brand?: string; };
    lensData?: { name?: string; brand?: string; };
    caption?: string;
    alt?: string;
}

const FeaturedImageBlock: React.FC<FeaturedImageBlockProps> = ({
    image,
    size = 'standard',
    imageMetadata,
    showMetadata = false,
    cameraData,
    lensData,
    caption,
    alt
}) => {
    // Check if image exists in any valid form
    if (!image) {
        console.log("Image is null or undefined");
        return null;
    }

    const sizeClasses = {
        standard: 'max-w-2xl mx-auto',
        large: 'max-w-4xl mx-auto',
        fullWidth: 'w-full'
    };

    const heightClasses = {
        standard: 'max-h-[500px]',
        large: 'max-h-[600px]',
        fullWidth: 'max-h-[70vh]'
    };

    // Get the image URL using urlForImage for Sanity references
    let imageUrl: string | undefined;
    try {
        if (image?.asset?.url) {
            // Direct URL in asset
            imageUrl = image.asset.url;
        } else if (image._type === 'image' || image.asset?._ref || image.asset?._type === 'reference') {
            // This is a Sanity image reference
            imageUrl = urlForImage(image).url();
        }
    } catch (error) {
        console.error("Error generating image URL:", error);
    }

    if (!imageUrl) {
        console.log("Could not generate image URL for:", image);
        return null;
    }

    // Use provided alt and caption or fallback to those in the image object
    const imageAlt = alt || image.alt || 'Featured image';
    const imageCaption = caption || image.caption;

    return (
        <div className={cn(sizeClasses[size])}>
            <Card className="overflow-hidden border-0 shadow-lg rounded-lg gap-0 p-0 m-0 space-y-0  hover:[&_div]:opacity-100">
                <CardContent className="p-0 m-0 relative">
                    <img
                        src={imageUrl}
                        alt={imageAlt}
                        className={cn(
                            'w-full object-cover',
                            heightClasses[size]
                        )}
                    />
                    {(imageCaption || (showMetadata && imageMetadata)) && (
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 p-4 bg-muted dark:bg-muted absolute bottom-0 left-0 w-full opacity-0 transition-opacity duration-300">
                            {imageCaption && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {imageCaption}
                                </p>
                            )}

                            {showMetadata && imageMetadata && (
                                <div className="flex flex-wrap gap-2">
                                    {cameraData && (
                                        <Badge variant="secondary" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            {cameraData.brand} {cameraData.name}
                                        </Badge>
                                    )}

                                    {lensData && (
                                        <Badge variant="secondary" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            {lensData.brand} {lensData.name}
                                        </Badge>
                                    )}

                                    {imageMetadata.aperture && (
                                        <Badge variant="secondary" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            f/{imageMetadata.aperture}
                                        </Badge>
                                    )}

                                    {imageMetadata.shutterSpeed && (
                                        <Badge variant="secondary" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            {imageMetadata.shutterSpeed}s
                                        </Badge>
                                    )}

                                    {imageMetadata.iso && (
                                        <Badge variant="secondary" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                            ISO {imageMetadata.iso}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>


            </Card>
        </div>
    );
};

export { FeaturedImageBlock };