import type React from "react";

interface Location {
	name?: string;
	city?: string;
	country?: string;
}

interface Camera {
	brand: string;
	name: string;
	type?: string;
}

interface Lens {
	brand: string;
	name: string;
	focalLength?: {
		min: number;
		max: number;
	};
}

interface Equipment {
	cameras?: Camera[];
	lenses?: Lens[];
}

interface ShootMetadata {
	equipment?: Equipment;
	technicalNotes?: string;
	theme?: string; // From previous component
}

interface PhotoMetadataProps {
	location?: Location;
	shootMetadata?: ShootMetadata;
	isPhotographyPost: boolean; // Flag to determine if component should render
}

const PhotoMetadata: React.FC<PhotoMetadataProps> = ({
	location,
	shootMetadata,
	isPhotographyPost,
}) => {
	// Don't render anything if this is not a photography post
	if (!isPhotographyPost) return null;

	// Don't render if we don't have any relevant metadata to show
	const hasEquipment =
		shootMetadata?.equipment?.cameras?.length ||
		shootMetadata?.equipment?.lenses?.length;

	const hasMetadata = location || hasEquipment || shootMetadata?.technicalNotes;

	if (!hasMetadata) return null;

	return (
		<div className="mb-12">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-l-0 border-r-0 border-t-0 border-muted p-6">
				{/* Location if available */}
				{location && (
					<div className="h-full">
						<h3 className="text-lg font-semibold mb-2">Location</h3>
						<p className="text-muted-foreground text-sm">{location.name}</p>
						<p className="text-muted-foreground text-sm">{location.city}</p>
						<p className="text-muted-foreground text-sm">{location.country}</p>
					</div>
				)}

				{/* Equipment used */}
				{hasEquipment && (
					<div className="h-full">
						<h3 className="text-lg font-semibold mb-3">Equipment Used</h3>

						{!!shootMetadata?.equipment?.cameras?.length && (
							<div className="mb-4">
								<h4 className="font-medium mb-2">Cameras</h4>
								<ul className="list-disc pl-5 space-y-1 text-sm">
									{shootMetadata.equipment.cameras.map((camera) => (
										<li key={`camera-${JSON.stringify(camera)}`}>
											{camera.brand} {camera.name}
											{camera.type && (
												<span className="text-muted-foreground">
													{" "}
													({camera.type})
												</span>
											)}
										</li>
									))}
								</ul>
							</div>
						)}

						{!!shootMetadata?.equipment?.lenses?.length && (
							<div>
								<h4 className="font-medium mb-2">Lenses</h4>
								<ul className="list-disc pl-5 space-y-1">
									{shootMetadata.equipment.lenses.map((lens) => (
										<li key={`lens-${JSON.stringify(lens)}`}>
											{lens.brand} {lens.name}
											{lens.focalLength && (
												<span className="text-muted-foreground">
													{" "}
													(
													{lens.focalLength.min === lens.focalLength.max
														? `${lens.focalLength.min}mm`
														: `${lens.focalLength.min}-${lens.focalLength.max}mm`}
													)
												</span>
											)}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}

				{/* Technical notes if available */}
				{shootMetadata?.technicalNotes && (
					<div className="h-full">
						<h3 className="text-lg font-semibold mb-2">Technical Notes</h3>
						<p className="text-muted-foreground text-sm">
							{shootMetadata.technicalNotes}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export { PhotoMetadata };
