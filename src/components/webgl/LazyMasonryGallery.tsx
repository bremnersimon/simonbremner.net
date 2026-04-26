import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import MasonryGrid from "./MasonryGrid";
import FilmDistortionImage from "./FilmDistortionImage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../shad-ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../shad-ui/tooltip";
import { ChevronLeft, ChevronRight, Info, Loader2, Plus } from "lucide-react";
import { Button } from "../shad-ui/button";

interface Photo {
  _id: string;
  title: string;
  slug: { current: string };
  altText: string;
  description?: string;
  image: {
    src: string;
    thumbnail: string;
    alt: string;
    width: number;
    height: number;
  };
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
    orientation: 'landscape' | 'portrait' | 'square';
  };
  categories: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    color?: string;
  }>;
  tags: string[];
  dateTaken?: string;
  location?: string;
  featured: boolean;
  camera?: {
    _id: string;
    name: string;
    brand?: string;
    modelNumber?: string;
  } | null;
  lens?: {
    _id: string;
    name: string;
    brand?: string;
    lensFocalLength?: string;
  } | null;
  focalLength?: string | null;
  aperture?: string | null;
  shutterSpeed?: string | null;
  iso?: number | null;
}

interface LazyMasonryGalleryProps {
  initialImages: Photo[];
  photosPerPage?: number;
}

const LazyMasonryGallery = ({ initialImages, photosPerPage = 20 }: LazyMasonryGalleryProps) => {
  const [images, setImages] = useState<Photo[]>(initialImages || []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialImages?.length || 0);
  const [isModalImageReady, setIsModalImageReady] = useState(false);
  const isFetchingRef = useRef(false);
  
  const selected = selectedIndex !== null ? images[selectedIndex] : null;
  const isFirstImage = selectedIndex === 0;
  const isLastLoadedImage = selectedIndex !== null && selectedIndex === images.length - 1;
  const canGoPrevious = selectedIndex !== null && selectedIndex > 0;
  const canGoNext = selectedIndex !== null && (!isLastLoadedImage || hasMore);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1024) {
        setColumns(3); // lg: 3 columns
      } else if (window.innerWidth >= 768) {
        setColumns(2); // md: 2 columns
      } else {
        setColumns(1); // mobile: 1 column
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const loadMorePhotos = useCallback(async (): Promise<number> => {
    if (isFetchingRef.current || !hasMore) return 0;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/photos?offset=${offset}&limit=${photosPerPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        setImages(prev => [...prev, ...data.photos]);
        setOffset(prev => prev + data.photos.length);
        setHasMore(data.hasMore);
        return data.photos.length;
      }

      setHasMore(false);
      return 0;
    } catch (error) {
      console.error('Error loading more photos:', error);
      setHasMore(false);
      return 0;
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [offset, photosPerPage, hasMore]);

  const goToPreviousImage = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const goToNextImage = useCallback(async () => {
    if (selectedIndex === null) return;

    if (selectedIndex < images.length - 1) {
      setSelectedIndex((prev) => {
        if (prev === null) return prev;
        return Math.min(prev + 1, images.length - 1);
      });
      return;
    }

    if (!hasMore) return;

    const previousLength = images.length;
    const loadedCount = await loadMorePhotos();

    if (loadedCount > 0) {
      setSelectedIndex(previousLength);
    }
  }, [selectedIndex, images.length, hasMore, loadMorePhotos]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tagName = target.tagName;
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('contenteditable') === 'true'
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousImage();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        void goToNextImage();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, goToPreviousImage, goToNextImage]);

  useEffect(() => {
    if (!selected) {
      setIsModalImageReady(false);
      return;
    }

    setIsModalImageReady(false);
    const image = new Image();
    image.src = selected.image.src;

    if (image.complete) {
      setIsModalImageReady(true);
      return;
    }

    image.onload = () => setIsModalImageReady(true);
    image.onerror = () => setIsModalImageReady(true);

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [selected]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">No photos found.</p>
      </div>
    );
  }

  return (
    <>
      <MasonryGrid 
        columns={columns}
        imageData={images.map(img => ({
          width: img.dimensions.width,
          height: img.dimensions.height,
          aspectRatio: img.dimensions.aspectRatio
        }))}
        balanceByHeight={true}
      >
        {images.map((img, i) => (
          <button
            type="button"
            key={img._id || i}
            className="overflow-hidden shadow-md relative w-full focus:outline-none cursor-hover transition-transform hover:scale-[1.02] focus:scale-[1.02]"
            style={{ width: "100%" }}
            onClick={() => setSelectedIndex(i)}
            tabIndex={0}
            aria-label={img.image.alt || img.title || `View photo ${i + 1}`}
          >
            <img
              src={img.image.src}
              alt={img.image.alt || img.title || `Photo ${i + 1}`}
              width={img.image.width}
              height={img.image.height}
              className="w-full object-cover"
              style={{ display: 'block' }}
              loading="lazy"
            />
            {/* Location overlay */}
            {(img.location || img.title) && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded shadow backdrop-blur-sm">
                {img.location || img.title}
              </div>
            )}
          </button>
        ))}
      </MasonryGrid>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-16 mb-8">
          <Button
            type="button"
            onClick={loadMorePhotos}
            disabled={isLoading}
            variant="ghost"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading photos...
              </>
            ) : (
              <>
                Load More Photos
                <Plus className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {!hasMore && images.length > 0 && (
        <div className="text-center mt-16 mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full">
            <span className="text-muted-foreground">
              End of gallery • {images.length} photos total
            </span>
          </div>
        </div>
      )}

      <Dialog open={selectedIndex !== null} onOpenChange={open => !open && setSelectedIndex(null)}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 m-0 flex items-center justify-center bg-background">
          {selected && (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div 
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Accessibility: DialogTitle and DialogDescription */}
              <>
                <span style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)', whiteSpace: 'nowrap'}}>
                  <DialogTitle>
                    {selected.title || selected.location || selected.image.alt || 'Image'}
                  </DialogTitle>
                  <DialogDescription>
                    {selected.image.alt || selected.title || ''}
                  </DialogDescription>
                </span>
                <div className="flex flex-col items-center w-full h-full">
                  <div className="relative w-full h-full flex justify-center items-center" style={{ maxHeight: '80vh' }}>
                    {isModalImageReady && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70 rounded-full"
                        onClick={goToPreviousImage}
                        disabled={!canGoPrevious}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Previous image</span>
                      </Button>
                    )}

                    <div style={{ width: '100%', height: 'auto', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FilmDistortionImage
                        key={`modal-${selected._id || selectedIndex}`}
                        src={selected.image.src}
                        alt={selected.image.alt || selected.title}
                        width={selected.image.width}
                        height={selected.image.height}
                        className="block cursor-hover"
                        style={{ maxHeight: '80vh', maxWidth: '100%', width: 'auto', height: 'auto' }}
                      />
                    </div>

                    {isModalImageReady && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/70 rounded-full"
                        onClick={() => {
                          void goToNextImage();
                        }}
                        disabled={!canGoNext || isLoading}
                        aria-label="Next image"
                      >
                        {isLoading && isLastLoadedImage ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <ChevronRight className="h-6 w-6" />
                        )}
                        <span className="sr-only">
                          {isLoading && isLastLoadedImage ? 'Loading next image' : 'Next image'}
                        </span>
                      </Button>
                    )}

                    {isModalImageReady && (
                      <div className="absolute bottom-4 right-4 z-10">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              tabIndex={-1}
                              className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                              aria-label="Show photo details"
                            >
                              <Info size={16} className="text-gray-600 dark:text-gray-300" />
                              <span className="sr-only">Photo details</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
                            <div className="grid grid-cols-3 gap-y-6 gap-x-8 justify-center items-start text-base text-muted-foreground">
                              {selected.location && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Location</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{selected.location}</span>
                                </div>
                              )}
                              {selected.shutterSpeed && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Shutter</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{selected.shutterSpeed}</span>
                                </div>
                              )}
                              {selected.iso && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">ISO</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{selected.iso}</span>
                                </div>
                              )}
                              {selected.aperture && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Aperture</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{selected.aperture}</span>
                                </div>
                              )}
                              {selected.lens && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Lens</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{
                                    typeof selected.lens === 'string'
                                      ? selected.lens
                                      : selected.lens.name || selected.lens.brand || JSON.stringify(selected.lens)
                                  }</span>
                                </div>
                              )}
                              {selected.camera && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Camera</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{
                                    typeof selected.camera === 'string'
                                      ? selected.camera
                                      : selected.camera.name || selected.camera.brand || JSON.stringify(selected.camera)
                                  }</span>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              </>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LazyMasonryGallery;