import React, { useState } from "react";
import MasonryGrid from "./MasonryGrid";
import FilmDistortionImage from "./FilmDistortionImage";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "../shad-ui/dialog";

// This component fetches Sanity images from the Astro-provided prop
const MasonrySanityGridSection = ({ images }) => {
  if (!images || images.length === 0) {
    return <div>No images found.</div>;
  }
  const [selected, setSelected] = useState(null);

  return (
    <>
      <MasonryGrid columns={3}>
        {images.map((img, i) => (
          <button
            key={img._id || i}
            className="overflow-hidden shadow-md relative mb-6 w-full focus:outline-none"
            style={{ width: "100%" }}
            onClick={() => setSelected(img)}
            tabIndex={0}
            aria-label={img.image.alt || img.title || `View photo ${i + 1}`}
          >
            <FilmDistortionImage
              src={img.image.src}
              alt={img.image.alt || img.title || `Photo ${i + 1}`}
              width={img.image.width}
              height={img.image.height}
              className="w-full"
            />
          </button>
        ))}
      </MasonryGrid>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent
          className="p-0 bg-black/95 flex items-center justify-center w-screen h-screen max-w-screen max-h-screen rounded-none"
          style={{ inset: 0 }}
        >
          {selected && (
            <div className="flex items-center justify-center w-full h-full">
              <div className="relative w-full h-full flex items-center justify-center">
                <FilmDistortionImage
                  src={selected.image.src}
                  alt={selected.image.alt || selected.title}
                  width={selected.image.width}
                  height={selected.image.height}
                  className="max-w-[90vw] max-h-[90vh] w-auto h-auto"
                />
                <DialogClose className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 focus:outline-none">
                  <span className="sr-only">Close</span>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MasonrySanityGridSection;
