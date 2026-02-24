import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/shad-ui/dialog';
import { X, Calendar, MapPin, Camera } from 'lucide-react';
import WebGLPhoto from '@/components/webgl/WebGLPhoto';

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

interface Category {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  color?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  categories: Category[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, categories }) => {
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const masonryGridRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const photoElement = entry.target as HTMLElement;
            const photoId = photoElement.dataset.photoId;
            if (photoId && !visiblePhotos.has(photoId)) {
              setVisiblePhotos(prev => new Set(prev).add(photoId));
              observerRef.current?.unobserve(photoElement);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [visiblePhotos]);

  // Filter photos by category
  const handleCategoryFilter = useCallback((categorySlug: string) => {
    setActiveCategory(categorySlug);
    if (categorySlug === 'all') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(
        photos.filter(photo =>
          photo.categories.some(cat => cat.slug.current === categorySlug)
        )
      );
    }
  }, [photos]);

  // Setup intersection observer for photo containers when filteredPhotos changes
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const photoContainers = document.querySelectorAll('.photo-container:not(.observed)');
      photoContainers.forEach(container => {
        container.classList.add('observed');
        observerRef.current?.observe(container);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredPhotos]);

  // Load photos that are already in viewport immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      const photoContainers = document.querySelectorAll('.photo-container');
      photoContainers.forEach((container) => {
        const htmlContainer = container as HTMLElement;
        const rect = htmlContainer.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport) {
          const photoId = htmlContainer.dataset.photoId;
          if (photoId && !visiblePhotos.has(photoId)) {
            setVisiblePhotos(prev => new Set(prev).add(photoId));
          }
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [filteredPhotos, visiblePhotos]);

  // Handle photo click
  const handlePhotoClick = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  }, []);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryFilter('all')}
          className={`px-4 py-2 border border-border hover:bg-accent transition-colors ${
            activeCategory === 'all' ? 'bg-accent text-accent-foreground' : ''
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryFilter(category.slug.current)}
            className={`px-4 py-2 border hover:bg-accent transition-colors ${
              activeCategory === category.slug.current ? 'bg-accent text-accent-foreground' : 'border-border'
            }`}
            style={{
              borderColor: activeCategory === category.slug.current || !category.color 
                ? undefined 
                : category.color
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Masonry Photo Grid */}
      <div ref={masonryGridRef} className="columns-1 sm:columns-2 gap-4 space-y-4">
        {filteredPhotos.map((photo) => (
          <Dialog key={photo._id} open={isModalOpen && selectedPhoto?._id === photo._id} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedPhoto(null);
          }}>
            <DialogTrigger asChild>
              <div
                className="photo-item break-inside-avoid mb-4 group cursor-pointer"
                data-categories={JSON.stringify(photo.categories.map(cat => cat.slug.current))}
                onClick={() => handlePhotoClick(photo)}
                style={{ viewTransitionName: `photo-${photo._id}` }}
              >
                <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300">
                  {/* WebGL Photo with chromatic aberration */}
                  <div 
                    className="photo-container w-full h-auto"
                    data-photo-id={photo._id}
                    style={{ aspectRatio: photo.dimensions.aspectRatio }}
                  >
                    <WebGLPhoto
                      photo={photo}
                      isInView={visiblePhotos.has(photo._id)}
                      className="w-full h-full"
                      onLoad={() => setLoadedImages(prev => new Set(prev).add(photo._id))}
                    />
                  </div>
                  
                  {/* Overlay with photo info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-semibold text-lg mb-1 leading-tight">{photo.title}</h3>
                      {photo.location && (
                        <p className="text-sm text-gray-200 mb-2 flex items-center gap-1">
                          <MapPin size={12} />
                          {photo.location}
                        </p>
                      )}
                      {photo.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {photo.categories.slice(0, 2).map((category) => (
                            <span
                              key={category._id}
                              className="px-2 py-1 text-xs bg-black/30 backdrop-blur-sm border border-white/20"
                            >
                              {category.name}
                            </span>
                          ))}
                          {photo.categories.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-black/30 backdrop-blur-sm border border-white/20">
                              +{photo.categories.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Featured indicator */}
                  {photo.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 text-xs font-semibold shadow-md">
                      ⭐
                    </div>
                  )}
                </div>
              </div>
            </DialogTrigger>
            
            {/* Photo Modal */}
            <DialogContent 
              className="p-0 bg-background border overflow-hidden 
                         w-[98vw] md:w-auto h-auto 
                         max-w-[98vw] md:max-w-[75vw] max-h-[95vh] md:max-h-[75vh] 
                         sm:rounded-none
                         left-[1vw] md:left-[50%] 
                         top-[2.5vh] md:top-[50%] 
                         translate-x-0 md:-translate-x-1/2 
                         translate-y-0 md:-translate-y-1/2"
              style={{ viewTransitionName: `photo-${photo._id}` }}
            >
              <div className="relative">
                {/* Close button */}
                <DialogClose className="absolute top-2 right-2 z-50 rounded-full bg-background/80 p-2 text-foreground hover:bg-accent transition-colors border">
                  <X size={16} />
                </DialogClose>
                
                {photo.dimensions.orientation === 'portrait' ? (
                  /* Portrait Layout: Responsive - vertical on mobile, side-by-side on desktop */
                  <div className="flex flex-col md:flex-row">
                    <div className="flex items-center justify-center p-4 bg-background">
                      <img
                        src={photo.image.src}
                        alt={photo.altText}
                        className="max-h-[60vh] md:max-h-[60vh] w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="w-full md:w-72 md:flex-shrink-0 overflow-y-auto bg-card p-4 text-card-foreground max-h-[35vh] md:max-h-[60vh] border-t md:border-t-0 md:border-l">
                      
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold md:hidden">{photo.title}</h2>
                        
                        {photo.location && (
                          <div className="flex items-center gap-2 text-sm md:text-lg">
                            <MapPin size={16} className="text-muted-foreground" />
                            <span>{photo.location}</span>
                          </div>
                        )}
                        
                        {/* Technical Details */}
                        {(photo.camera || photo.lens || photo.focalLength || photo.aperture || photo.shutterSpeed || photo.iso) && (
                          <div>
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-xs p-2">
                              {photo.camera && (
                                <div>{photo.camera.brand} {photo.camera.modelNumber}</div>
                              )}
                              {photo.lens && (
                                <div>{photo.lens.name}</div>
                              )}
                              {photo.aperture && (
                                <div>{photo.aperture}</div>
                              )}
                              {photo.shutterSpeed && (
                                <div>{photo.shutterSpeed}</div>
                              )}
                              {photo.iso && (
                                <div>{photo.iso} ISO</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {photo.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed">{photo.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Landscape/Square Layout: Always vertical layout */
                  <div className="flex flex-col">
                    <div className="flex items-center justify-center p-4 bg-background">
                      <img
                        src={photo.image.src}
                        alt={photo.altText}
                        className="max-h-[60vh] md:max-h-[55vh] w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Photo info overlay */}
                    <div className="bg-card/95 backdrop-blur-sm p-4 text-card-foreground border-t">
                      <div>
                        <h2 className="text-lg font-bold mb-2">{photo.title}</h2>
                        
                        <div className="flex flex-wrap gap-3 text-muted-foreground mb-2">
                          {photo.location && (
                            <div className="flex items-center gap-1 text-sm md:text-lg">
                              <MapPin size={14} />
                              <span>{photo.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Technical Details */}
                        {(photo.camera || photo.lens || photo.focalLength || photo.aperture || photo.shutterSpeed || photo.iso) && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs p-2 mb-2">
                            {photo.camera && (
                              <div>{photo.camera.brand} {photo.camera.name}</div>
                            )}
                            {photo.lens && (
                              <div>{photo.lens.brand} {photo.lens.name}</div>
                            )}
                            {photo.aperture && (
                              <div>{photo.aperture}</div>
                            )}
                            {photo.shutterSpeed && (
                              <div>{photo.shutterSpeed}</div>
                            )}
                            {photo.iso && (
                              <div>{photo.iso} ISO</div>
                            )}
                          </div>
                        )}
                        
                        {photo.description && (
                          <p className="text-muted-foreground mb-2 text-sm leading-relaxed">{photo.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* No photos message */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            No photos found for the selected category.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;