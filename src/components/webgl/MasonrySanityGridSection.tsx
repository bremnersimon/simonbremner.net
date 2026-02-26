import type React from "react";
import { useState, useEffect } from "react";
import MasonryGrid from "./MasonryGrid";
import FilmDistortionImage from "./FilmDistortionImage";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "../shad-ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../shad-ui/tooltip";
import { Info } from "lucide-react";

// This component fetches Sanity images from the Astro-provided prop
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const MasonrySanityGridSection = ({ images }: { images: any[] }) => {
  if (!images || images.length === 0) {
    return <div>No images found.</div>;
  }
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [columns, setColumns] = useState(1);
  const selected = selectedIndex !== null ? images[selectedIndex] : null;

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

  return (
    <>
      <MasonryGrid columns={columns}>
        {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
        {images.map((img: { _id: any; image: { alt: any; src: string | undefined; width: string | number | undefined; height: string | number | undefined; }; title: any; location: any; city: string; country: any; }, i: number | React.SetStateAction<null>) => (
          <button
          type="button"
            key={img._id || i}
            className="overflow-hidden shadow-md relative w-full focus:outline-none cursor-hover"
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
            {(img.location || img.title || img.city || img.country) && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded shadow">
                {img.location || img.title || `${img.city ? `${img.city}, ` : ''}${img.country || ''}`}
              </div>
            )}
          </button>
        ))}
      </MasonryGrid>

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
                  <div className="flex flex-col items-center w-full">
                    <div className="relative w-full flex justify-center">
                      <FilmDistortionImage
                        key={`modal-${selected._id || selected.image.src || selected.title || selectedIndex}`}
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
                                      : selected.lens.name || selected.lens.model || selected.lens.brand || JSON.stringify(selected.lens)
                                  }</span>
                                </div>
                              )}
                              {selected.camera && (
                                <div className="flex flex-col items-start">
                                  <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">Camera</span>
                                  <span className="font-medium text-lg text-gray-900 dark:text-gray-100">{
                                    typeof selected.camera === 'string'
                                      ? selected.camera
                                      : selected.camera.name || selected.camera.model || selected.camera.brand || JSON.stringify(selected.camera)
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
              {/* <DialogClose className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 focus:outline-none">
                <span className="sr-only">Close</span>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </DialogClose> */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MasonrySanityGridSection;
