// src/components/blocks/ImageBlock.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ImageBlockProps {
    image?: {
        _type: string;
        asset?: {
            url?: string;
            _id?: string;
            // other properties may exist but we mainly need the url
        };
    };
    caption?: string;
    alt?: string;
    width?: 'normal' | 'wide' | 'full';
}

const ImageBlock: React.FC<ImageBlockProps> = ({
    image,
    caption,
    alt = '',
    width = 'normal'
}) => {
    // Check if image and asset exist
    if (!image || !image.asset || !image.asset.url) {
        console.log("Image URL not found:", image);
        return null;
    }

    const widthClasses = {
        normal: 'max-w-2xl mx-auto',
        wide: 'max-w-4xl mx-auto',
        full: 'w-full'
    };

    // Use the URL directly from the asset
    const imageUrl = image.asset.url;

    return (
        <div className={cn(widthClasses[width])}>
            <Card className="overflow-hidden border-0 shadow-md p-0">
                <CardContent className="p-0">
                    <img
                        src={imageUrl}
                        alt={alt || 'Project image'}
                        className="w-full h-auto object-cover"
                    />
                </CardContent>

                {caption && (
                    <CardFooter className="text-sm text-gray-500 p-4">
                        {caption}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default ImageBlock;