// src/components/blocks/StackBlock.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { urlForImage } from '@/lib/sanity.image';

interface Technology {
    _ref?: string;
    _type?: string;
    _key?: string;
    icon?: {
        _type?: string;
        asset?: {
            url?: string;
            _id?: string;
            _ref?: string;
            _type?: string;
        };
        alt?: string;
    };
    name?: string;
    description?: string;
}

interface StackBlockProps {
    type?: string;
    heading?: string;
    technologies?: Technology[];
}

const StackBlock: React.FC<StackBlockProps> = ({
    type = 'Tech Stack',
    heading = 'Technologies Used',
    technologies = []
}) => {
    if (!technologies || technologies.length === 0) return null;

    // Helper function to safely get image URL
    const getImageUrl = (tech: Technology) => {
        try {
            // Check if icon exists
            if (!tech || !tech.icon) {
                return null;
            }

            // Direct URL in asset
            if (tech.icon.asset?.url) {
                return tech.icon.asset.url;
            }

            // Sanity image reference
            if (tech.icon.asset && (tech.icon.asset._ref || tech.icon._type === 'image')) {
                return urlForImage(tech.icon)
                    .width(60)
                    .height(60)
                    .fit('crop')
                    .auto('format')
                    .url();
            }

            return null;
        } catch (error) {
            console.error("Error generating tech icon URL:", error, tech);
            return null;
        }
    };

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">
                    {type}
                </Badge>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {technologies.map((tech, index) => {
                        // Generate a unique key
                        const key = tech._key || `tech-${index}`;

                        // Get image URL if available
                        const imageUrl = getImageUrl(tech);

                        return (
                            <div key={key} className="flex flex-col items-center">
                                {imageUrl ? (
                                    <div className="w-12 h-12 mb-2 relative">
                                        <img
                                            src={imageUrl}
                                            alt={tech.name || 'Technology icon'}
                                            className="w-full h-full object-contain"
                                            onError={() => {
                                                console.log(`Failed to load image for ${tech.name}`);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                                        <span className="text-lg font-bold text-gray-400">
                                            {tech.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}
                                <span className="text-sm font-medium">{tech.name}</span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default StackBlock;