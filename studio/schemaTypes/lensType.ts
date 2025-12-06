import { defineField, defineType } from "sanity";

export default defineType({
	name: "lens",
	title: "Lens",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Lens Name",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "brand",
			title: "Brand",
			type: "string",
		}),
		defineField({
			name: "focalLength",
			title: "Focal Length",
			type: "object",
			fields: [
				{
					name: "min",
					title: "Minimum Focal Length",
					type: "string",
					description: 'e.g., "24mm" (include units)',
				},
				{
					name: "max",
					title: "Maximum Focal Length",
					type: "string",
					description: "Leave empty for prime lenses",
				},
			],
		}),
		defineField({
			name: "maxAperture",
			title: "Maximum Aperture",
			type: "string",
			description: 'e.g., "f/1.8" or "f/2.8-4" for zoom lenses',
		}),
	],
	preview: {
		select: {
			title: "name",
			brand: "brand",
			minFocal: "focalLength.min",
			maxFocal: "focalLength.max",
		},
		prepare(selection) {
			const { title, brand, minFocal, maxFocal } = selection;
			const focal = maxFocal ? `${minFocal}-${maxFocal}` : minFocal;
			return {
				title: title,
				subtitle: `${brand} | ${focal}`,
			};
		},
	},
});
