// src/components/blocks/GalleryBlock.tsx
import { useState } from 'react';
import { urlForImage } from '@/lib/sanity';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SanityImage {
    _key: string;
    _type?: string;
    asset?: {
        _ref: string;
        _type: string;
    };
    alt?: string;
    caption?: string;
}

interface GalleryBlockProps {
    images: SanityImage[];
    layout?: 'grid' | 'masonry' | 'slider';
    className?: string;
}

const GalleryBlock = ({
    images,
    layout = 'grid',
    className
}: GalleryBlockProps) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || !images.length) return null;

    const handleImageClick = (index: number) => {
        setSelectedIndex(index);
        setOpen(true);
    };

    const nextImage = () => {
        setSelectedIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Get the selected image for the lightbox
    const selectedImage = images[selectedIndex];

    return (
        <div className={cn("my-8", className)}>
            <div className="gallery-container">
                {layout === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={image._key}
                                className="overflow-hidden rounded-md cursor-pointer group"
                                onClick={() => handleImageClick(index)}
                            >
                                <AspectRatio ratio={1 / 1}>
                                    <img
                                        src={urlForImage(image).width(400).height(400).fit('crop').auto('format').url()}
                                        alt={image.alt || `Gallery image ${index + 1}`}
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                    />
                                </AspectRatio>
                            </div>
                        ))}
                    </div>
                )}

                {layout === 'masonry' && (
                    <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                        {images.map((image, index) => (
                            <div
                                key={image._key}
                                className="break-inside-avoid mb-4 cursor-pointer"
                                onClick={() => handleImageClick(index)}
                            >
                                <img
                                    src={urlForImage(image).width(600).auto('format').url()}
                                    alt={image.alt || `Gallery image ${index + 1}`}
                                    className="w-full h-auto rounded-md hover:opacity-90 transition-opacity"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {layout === 'slider' && (
                    <div className="relative overflow-hidden">
                        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4">
                            {images.map((image, index) => (
                                <div
                                    key={image._key}
                                    className="shrink-0 w-[85%] sm:w-[45%] md:w-[30%] snap-center"
                                    onClick={() => handleImageClick(index)}
                                >
                                    <div className="rounded-md overflow-hidden cursor-pointer">
                                        <AspectRatio ratio={3 / 2}>
                                            <img
                                                src={urlForImage(image).width(500).height(333).fit('crop').auto('format').url()}
                                                alt={image.alt || `Gallery image ${index + 1}`}
                                                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                            />
                                        </AspectRatio>
                                    </div>
                                    {image.caption && (
                                        <p className="text-sm text-muted-foreground mt-1 truncate">{image.caption}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="max-w-screen-xl w-full p-0 overflow-hidden border-0"
                    closeButton={false} // Disable the default close button
                >
                    <div className="relative bg-background/95 dark:bg-background/95 backdrop-blur-sm rounded-lg overflow-hidden w-full">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 rounded-full bg-background/50 hover:bg-background/70"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </Button>

                        <div className="flex items-center justify-center p-4">
                            <img
                                src={urlForImage(selectedImage).width(1500).auto('format').url()}
                                alt={selectedImage?.alt || `Gallery image ${selectedIndex + 1}`}
                                className="max-h-[80vh] w-auto object-contain"
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 rounded-full"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                    <span className="sr-only">Previous image</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 rounded-full"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                    <span className="sr-only">Next image</span>
                                </Button>
                            </>
                        )}

                        {selectedImage?.caption && (
                            <div className="p-4 text-foreground bg-background/80">
                                <p>{selectedImage.caption}</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GalleryBlock;