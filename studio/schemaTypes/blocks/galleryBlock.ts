import { defineType } from "sanity";

export default defineType({
	name: "galleryBlock",
	title: "Gallery Block",
	type: "object",
	fields: [
		{
			name: "images",
			title: "Images",
			type: "array",
			of: [
				{
					type: "image",
					options: {
						hotspot: true,
					},
					fields: [
						{
							name: "alt",
							title: "Alt Text",
							type: "string",
						},
						{
							name: "caption",
							title: "Caption",
							type: "string",
						},
					],
				},
			],
		},
		{
			name: "layout",
			title: "Layout",
			type: "string",
			options: {
				list: [
					{ title: "Grid", value: "grid" },
					{ title: "Masonry", value: "masonry" },
					{ title: "Slider", value: "slider" },
				],
			},
		},
	],
	preview: {
		select: {
			images: "images",
			layout: "layout",
		},
		prepare({ images, layout }) {
			return {
				title: "Gallery Block",
				subtitle: `${layout || "Grid"} layout with ${images?.length || 0} images`,
				media: images?.[0],
			};
		},
	},
});
