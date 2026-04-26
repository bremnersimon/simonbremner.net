import React from 'react';


interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: number;
  className?: string;
  imageData?: Array<{ width: number; height: number; aspectRatio: number }>;
  balanceByHeight?: boolean;
}

// Safest React masonry: distribute children into columns in JS
const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  children, 
  columns = 3, 
  className = '',
  imageData = [],
  balanceByHeight = true
}) => {
  // Ensure children is always an array
  const childArray = React.Children.toArray(children);
  // Create empty columns
  const cols: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  
  if (balanceByHeight && imageData.length === childArray.length) {
    // Height-based distribution: add each image to the shortest column
    const columnHeights = Array(columns).fill(0);
    
    childArray.forEach((child, i) => {
      // Find the column with the smallest total height
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Add the child to the shortest column
      cols[shortestColumnIndex].push(child);
      
      // Update the column height (normalize to a common width for calculation)
      if (imageData[i]) {
        const normalizedHeight = imageData[i].height / imageData[i].aspectRatio;
        columnHeights[shortestColumnIndex] += normalizedHeight;
      } else {
        // Fallback: assume average aspect ratio if data missing
        columnHeights[shortestColumnIndex] += 300;
      }
    });
  } else {
    // Fallback to round-robin distribution
    childArray.forEach((child, i) => {
      cols[i % columns].push(child);
    });
  }

  return (
    <div className={`w-full flex gap-2 md:gap-4 ${className}`}>
      {cols.map((col, i) => (
        <div key={i} className="flex flex-col gap-2 md:gap-4 flex-1">
          {col}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;

