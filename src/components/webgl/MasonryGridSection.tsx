import React from "react";
import MasonryGrid from "./MasonryGrid";
import FilmDistortionImage from "./FilmDistortionImage";

const testImages = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/500?random=2',
  'https://picsum.photos/400/700?random=3',
];

const MasonryGridSection: React.FC = () => (
  <MasonryGrid>
    {testImages.map((src, i) => (
      <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md relative">
        <FilmDistortionImage src={src} alt={`Masonry image ${i + 1}`} className="w-full h-full" />
      </div>
    ))}
  </MasonryGrid>
);

export default MasonryGridSection;