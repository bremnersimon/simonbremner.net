import { defineType } from "sanity";

export default defineType({
	name: "imageBlock",
	title: "Image Block",
	type: "object",
	fields: [
		{
			name: "image",
			title: "Image",
			type: "image",
			options: {
				hotspot: true,
			},
		},
		{
			name: "caption",
			title: "Caption",
			type: "string",
		},
		{
			name: "alt",
			title: "Alt Text",
			type: "string",
		},
		{
			name: "width",
			title: "Image Width",
			type: "string",
			options: {
				list: [
					{ title: "Normal", value: "normal" },
					{ title: "Wide", value: "wide" },
					{ title: "Full", value: "full" },
				],
			},
		},
	],
	preview: {
		select: {
			image: "image",
			caption: "caption",
		},
		prepare({ image, caption }) {
			return {
				title: "Image Block",
				subtitle: caption || "No caption",
				media: image,
			};
		},
	},
});
