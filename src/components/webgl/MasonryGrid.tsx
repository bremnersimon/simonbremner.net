import React from "react";

interface MasonryGridProps {
	children: React.ReactNode[];
	columns?: number;
	className?: string;
	imageData?: Array<{ width: number; height: number; aspectRatio: number }>;
	balanceByHeight?: boolean;
	columnAssignments?: number[];
}

// Safest React masonry: distribute children into columns in JS
const MasonryGrid: React.FC<MasonryGridProps> = ({
	children,
	columns = 3,
	className = "",
	imageData = [],
	balanceByHeight = true,
	columnAssignments,
}) => {
	// Ensure children is always an array
	const childArray = React.Children.toArray(children);
	// Create empty columns
	const cols: React.ReactNode[][] = Array.from({ length: columns }, () => []);

	if (columnAssignments && columnAssignments.length === childArray.length) {
		childArray.forEach((child, i) => {
			const assignedColumn = columnAssignments[i] ?? 0;
			const columnIndex = Math.max(0, Math.min(columns - 1, assignedColumn));
			cols[columnIndex].push(child);
		});
	} else if (balanceByHeight && imageData.length === childArray.length) {
		// Height-based distribution: add each image to the shortest column
		const columnHeights = Array(columns).fill(0);

		childArray.forEach((child, i) => {
			// Find the column with the smallest total height
			const shortestColumnIndex = columnHeights.indexOf(
				Math.min(...columnHeights),
			);

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

	const columnIds = Array.from(
		{ length: columns },
		(_, index) => `masonry-column-${index}`,
	);

	return (
		<div className={`w-full flex gap-2 md:gap-4 ${className}`}>
			{cols.map((col, i) => (
				<div key={columnIds[i]} className="flex flex-col gap-2 md:gap-4 flex-1">
					{col}
				</div>
			))}
		</div>
	);
};

export default MasonryGrid;
