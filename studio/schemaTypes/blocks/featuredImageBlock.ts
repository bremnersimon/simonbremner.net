import { defineType } from "sanity";

export default defineType({
	name: "featuredImageBlock",
	title: "Featured Image Block",
	type: "object",
	fields: [
		{
			name: "image",
			title: "Featured Image",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				{
					name: "alt",
					title: "Alt Text",
					type: "string",
					description: "Alternative text for screen readers and SEO",
					validation: (Rule) => Rule.required(),
				},
				{
					name: "caption",
					title: "Caption",
					type: "string",
				},
			],
			validation: (Rule) => Rule.required(),
		},
		{
			name: "size",
			title: "Image Size",
			type: "string",
			options: {
				list: [
					{ title: "Standard", value: "standard" },
					{ title: "Large", value: "large" },
					{ title: "Full Width", value: "fullWidth" },
				],
				layout: "radio",
			},
			initialValue: "standard",
		},
		{
			name: "imageMetadata",
			title: "Image Metadata",
			type: "object",
			fields: [
				{
					name: "camera",
					title: "Camera",
					type: "reference",
					to: [{ type: "camera" }],
				},
				{
					name: "lens",
					title: "Lens",
					type: "reference",
					to: [{ type: "lens" }],
				},
				{
					name: "aperture",
					title: "Aperture",
					type: "string",
					description: "e.g. f/1.8, f/2.8",
				},
				{
					name: "shutterSpeed",
					title: "Shutter Speed",
					type: "string",
					description: "e.g. 1/125s, 30s",
				},
				{
					name: "iso",
					title: "ISO",
					type: "number",
				},
			],
		},
		{
			name: "showMetadata",
			title: "Show Metadata",
			type: "boolean",
			description: "Display technical metadata with the image",
			initialValue: true,
		},
	],
	preview: {
		select: {
			image: "image",
			caption: "image.caption",
		},
		prepare({ image, caption }) {
			return {
				title: "Featured Image",
				subtitle: caption || "No caption",
				media: image,
			};
		},
	},
});
