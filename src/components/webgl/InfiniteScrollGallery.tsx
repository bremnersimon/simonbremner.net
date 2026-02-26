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
import { Info, Loader2 } from "lucide-react";

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

interface InfiniteScrollGalleryProps {
  initialImages: Photo[];
  photosPerPage?: number;
  enableInfiniteScroll?: boolean;
}

const InfiniteScrollGallery = ({ 
  initialImages, 
  photosPerPage = 12, 
  enableInfiniteScroll = true 
}: InfiniteScrollGalleryProps) => {
  const [images, setImages] = useState<Photo[]>(initialImages || []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialImages?.length || 0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 1024) {
        setColumns(3);
      } else if (window.innerWidth >= 768) {
        setColumns(2);
      } else {
        setColumns(1);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const loadMorePhotos = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
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
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more photos:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [offset, photosPerPage, isLoading, hasMore]);

  // Infinite scroll implementation
  useEffect(() => {
    if (!enableInfiniteScroll || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMorePhotos();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [enableInfiniteScroll, hasMore, isLoading, loadMorePhotos]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">No photos found.</p>
      </div>
    );
  }

  return (
    <>
      <MasonryGrid columns={columns}>
        {images.map((img, i) => (
          <button
            type="button"
            key={img._id || i}
            className="overflow-hidden shadow-md relative w-full focus:outline-none cursor-hover transition-transform hover:scale-[1.02] focus:scale-[1.02] group"
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
              className="w-full object-cover transition-all duration-300 group-hover:brightness-110"
              style={{ display: 'block' }}
              loading="lazy"
            />
            {(img.location || img.title) && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded shadow backdrop-blur-sm transition-opacity group-hover:opacity-100 opacity-80">
                {img.location || img.title}
              </div>
            )}
          </button>
        ))}
      </MasonryGrid>

      {/* Infinite scroll sentinel */}
      {enableInfiniteScroll && hasMore && (
        <div ref={sentinelRef} className="flex justify-center mt-16 mb-8">
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more photos...</span>
            </div>
          )}
        </div>
      )}

      {/* Manual load more button (for when infinite scroll is disabled) */}
      {!enableInfiniteScroll && hasMore && (
        <div className="flex justify-center mt-16 mb-8">
          <button
            type="button"
            onClick={loadMorePhotos}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading photos...
              </>
            ) : (
              <>
                Load More Photos
                <span className="ml-2 text-sm opacity-75">({photosPerPage} more)</span>
              </>
            )}
          </button>
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
              <>
                <span style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)', whiteSpace: 'nowrap'}}>
                  <DialogTitle>
                    {selected.title || selected.location || selected.image.alt || 'Image'}
                  </DialogTitle>
                  <DialogDescription>
                    {selected.image.alt || selected.title || ''}
                  </DialogDescription>
                </span>
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-full flex justify-center">
                    <FilmDistortionImage
                      key={`modal-${selected._id || selectedIndex}`}
                      src={selected.image.src}
                      alt={selected.image.alt || selected.title}
                      width={selected.image.width}
                      height={selected.image.height}
                      className="block cursor-hover"
                    />
                    <div className="absolute bottom-4 right-4 z-10">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            tabIndex={-1}
                            className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
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

export default InfiniteScrollGallery;