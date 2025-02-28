// src/components/blocks/GalleryBlock.jsx
import React, { useState } from 'react';
import { urlForImage } from '@/lib/sanity';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const GalleryBlock = ({ images = [], layout = 'grid' }) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || !images.length) return null;

    const handleImageClick = (index) => {
        setSelectedIndex(index);
        setOpen(true);
    };

    const nextImage = () => {
        setSelectedIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Function to render different layouts
    const renderLayout = () => {
        switch (layout) {
            case 'grid':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={image._key}
                                className="aspect-square overflow-hidden rounded-md cursor-pointer group"
                                onClick={() => handleImageClick(index)}
                            >
                                <img
                                    src={urlForImage(image).width(400).height(400).fit('crop').auto('format').url()}
                                    alt={image.alt || `Gallery image ${index + 1}`}
                                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'masonry':
                return (
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
                );

            case 'slider':
            default:
                return (
                    <div className="relative overflow-hidden">
                        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4">
                            {images.map((image, index) => (
                                <div
                                    key={image._key}
                                    className="shrink-0 w-[85%] sm:w-[45%] md:w-[30%] snap-center"
                                    onClick={() => handleImageClick(index)}
                                >
                                    <div className="rounded-md overflow-hidden cursor-pointer">
                                        <img
                                            src={urlForImage(image).width(500).height(333).fit('crop').auto('format').url()}
                                            alt={image.alt || `Gallery image ${index + 1}`}
                                            className="w-full h-auto aspect-[3/2] object-cover hover:opacity-90 transition-opacity"
                                        />
                                    </div>
                                    {image.caption && (
                                        <p className="text-sm text-gray-500 mt-1 truncate">{image.caption}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    // Get the selected image for the lightbox
    const selectedImage = images[selectedIndex];

    return (
        <div className="my-8">
            <div className="gallery-container">
                {renderLayout()}
            </div>

            {/* Lightbox modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-0">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 z-10 rounded-full"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center justify-center">
                            <img
                                src={urlForImage(selectedImage).width(1200).auto('format').url()}
                                alt={selectedImage?.alt || `Gallery image ${selectedIndex + 1}`}
                                className="max-h-[80vh] max-w-full object-contain"
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </>
                        )}

                        {selectedImage?.caption && (
                            <div className="p-4 text-white bg-black/80">
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