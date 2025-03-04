// src/components/blocks/DemoBlock.tsx
import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { urlForImage } from '@/lib/sanity.image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Image, MousePointer } from "lucide-react";

interface DemoContent {
    _type: 'image' | 'file' | 'embeddedVideo';
    _key: string;
    asset?: {
        _ref?: string;
        _type?: string;
        url?: string;
    };
    url?: string;
    alt?: string;
    caption?: string;
}

interface DemoBlockProps {
    type?: string;
    heading?: string;
    demoType?: 'Video' | 'Interactive' | 'Screenshot Tour';
    demoContent?: DemoContent[];
}

const DemoBlock: React.FC<DemoBlockProps> = ({
    type = 'Demo',
    heading = 'Project Demo',
    demoType = 'Screenshot Tour',
    demoContent = []
}) => {
    const [activeTab, setActiveTab] = useState<string>("gallery");

    if (!demoContent || demoContent.length === 0) return null;

    // Helper function to safely generate image URL
    const getImageUrl = (image: DemoContent, width: number = 1000) => {
        try {
            if (!image || (!image.asset && !image.url)) {
                console.error("Invalid image data:", image);
                return '';
            }

            // If it's a direct URL (like for embeddedVideo)
            if (image.url) {
                return image.url;
            }

            // If it has an asset with a URL
            if (image.asset?.url) {
                return image.asset.url;
            }

            // If it's a Sanity image reference
            if (image._type === 'image' && image.asset?._ref) {
                return urlForImage(image)
                    .width(width)
                    .auto('format')
                    .url();
            }

            console.error("Could not determine image URL format:", image);
            return '';
        } catch (error) {
            console.error("Error generating image URL:", error, image);
            return '';
        }
    };

    // Helper function to render video embed
    const renderVideo = (url?: string) => {
        if (!url) return null;

        // Handle YouTube URLs
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be')
                ? url.split('/').pop()
                : new URLSearchParams(new URL(url).search).get('v');

            return (
                <div className="aspect-video w-full">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                </div>
            );
        }

        // Handle Vimeo URLs
        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop();
            return (
                <div className="aspect-video w-full">
                    <iframe
                        src={`https://player.vimeo.com/video/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                    ></iframe>
                </div>
            );
        }

        // Default fallback
        return (
            <div className="p-4 border rounded bg-gray-50 dark:bg-muted">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    Open video link
                </a>
            </div>
        );
    };

    // Separate content by type
    const images = demoContent.filter(item => item._type === 'image');
    const videos = demoContent.filter(item => item._type === 'embeddedVideo');
    const files = demoContent.filter(item => item._type === 'file');

    return (
        <Card className="max-w-4xl mx-auto my-8">
            <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">{type}</Badge>
                <CardTitle className="flex items-center gap-2">
                    {demoType === 'Video' && <Play className="h-5 w-5" />}
                    {demoType === 'Screenshot Tour' && <Image className="h-5 w-5" />}
                    {demoType === 'Interactive' && <MousePointer className="h-5 w-5" />}
                    {heading}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Tabs for different content types */}
                {videos.length > 0 || images.length > 0 ? (
                    <Tabs
                        defaultValue={videos.length > 0 ? "videos" : "gallery"}
                        className="w-full"
                        onValueChange={setActiveTab}
                    >
                        <TabsList className="grid w-full max-w-md mx-auto mb-4" style={{
                            gridTemplateColumns: `repeat(${[
                                videos.length > 0,
                                images.length > 0
                            ].filter(Boolean).length}, minmax(0, 1fr))`
                        }}>
                            {videos.length > 0 && (
                                <TabsTrigger value="videos" className="flex items-center gap-1">
                                    <Play className="h-4 w-4" />
                                    Videos
                                </TabsTrigger>
                            )}
                            {images.length > 0 && (
                                <TabsTrigger value="gallery" className="flex items-center gap-1">
                                    <Image className="h-4 w-4" />
                                    Screenshots
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Videos tab */}
                        {videos.length > 0 && (
                            <TabsContent value="videos" className="space-y-4">
                                {videos.map(video => (
                                    <div key={video._key}>
                                        {renderVideo(video.url)}
                                    </div>
                                ))}
                            </TabsContent>
                        )}

                        {/* Screenshots tab */}
                        {images.length > 0 && (
                            <TabsContent value="gallery">
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {images.map(image => {
                                            const imageUrl = getImageUrl(image, 1000);
                                            if (!imageUrl) return null;

                                            return (
                                                <CarouselItem key={image._key}>
                                                    <div className="p-1">
                                                        <div className="overflow-hidden rounded-lg">
                                                            <img
                                                                src={imageUrl}
                                                                alt={image.alt || "Demo screenshot"}
                                                                className="w-full h-auto aspect-video object-cover"
                                                            />
                                                            {image.caption && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                                    {image.caption}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CarouselItem>
                                            );
                                        })}
                                    </CarouselContent>
                                    <div className="flex justify-center gap-2 mt-4">
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </div>
                                </Carousel>
                            </TabsContent>
                        )}
                    </Tabs>
                ) : (
                    // Fallback if no visual content
                    <div className="text-center p-4 bg-gray-50 dark:bg-muted rounded-md">
                        <p>No demo content available.</p>
                    </div>
                )}

                {/* Downloadable files section */}
                {files.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-medium text-lg mb-2">Resources</h4>
                        <ul className="space-y-2">
                            {files.map(file => {
                                // Handle potential errors in file references
                                try {
                                    if (!file.asset?._ref) {
                                        console.error("File missing _ref:", file);
                                        return null;
                                    }

                                    const fileRef = file.asset._ref;
                                    const fileUrl = `https://cdn.sanity.io/files/${process.env.SANITY_PROJECT_ID}/production/${fileRef
                                        .replace('file-', '')
                                        .replace('-pdf', '.pdf')
                                        .replace('-doc', '.doc')
                                        .replace('-docx', '.docx')
                                        .replace('-zip', '.zip')
                                        .replace('-txt', '.txt')}`;

                                    return (
                                        <li key={file._key} className="flex items-center">
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center"
                                            >
                                                <svg
                                                    className="h-4 w-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                    />
                                                </svg>
                                                Download resource
                                            </a>
                                        </li>
                                    );
                                } catch (error) {
                                    console.error("Error rendering file link:", error, file);
                                    return null;
                                }
                            })}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DemoBlock;