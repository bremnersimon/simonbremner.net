import { defineType } from "sanity";

export default defineType({
	name: "headlineBlock",
	title: "Headline Block",
	type: "object",
	fields: [
		{
			name: "headline",
			title: "Headline",
			type: "string",
			validation: (Rule) => Rule.required(),
		},
		{
			name: "size",
			title: "Size",
			type: "string",
			options: {
				list: [
					{ title: "Small", value: "text-lg font-semibold" },
					{ title: "Medium", value: "text-xl font-semibold" },
					{ title: "Large", value: "text-2xl font-bold" },
					{
						title: "Hero",
						value: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
					},
				],
				layout: "radio",
			},
			initialValue: "text-xl font-semibold",
		},
		{
			name: "alignment",
			title: "Alignment",
			type: "string",
			options: {
				list: [
					{ title: "Left", value: "text-left" },
					{ title: "Center", value: "text-center" },
					{ title: "Right", value: "text-right" },
				],
				layout: "radio",
			},
			initialValue: "text-left",
		},
		{
			name: "width",
			title: "Content Width",
			type: "string",
			options: {
				list: [
					{ title: "Normal", value: "normal" },
					{ title: "Wide", value: "wide" },
					{ title: "Full", value: "full" },
				],
			},
			initialValue: "normal",
		},
	],
	preview: {
		select: {
			headline: "headline",
			size: "size",
		},
		prepare({ headline, size }) {
			const sizes = {
				"text-lg font-semibold": "Small",
				"text-xl font-semibold": "Medium",
				"text-2xl font-bold": "Large",
				"text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight": "Hero",
			};
			return {
				title: headline || "Headline",
				subtitle: `${sizes[size] || "Medium"} headline`,
			};
		},
	},
});
