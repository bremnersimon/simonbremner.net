import React from 'react';


interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: number;
  className?: string;
}

// Safest React masonry: distribute children into columns in JS
const MasonryGrid: React.FC<MasonryGridProps> = ({ children, columns = 2, className = '' }) => {
  // Ensure children is always an array
  const childArray = React.Children.toArray(children);
  // Create empty columns
  const cols: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  // Distribute children into columns (round-robin)
  childArray.forEach((child, i) => {
    cols[i % columns].push(child);
  });

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
