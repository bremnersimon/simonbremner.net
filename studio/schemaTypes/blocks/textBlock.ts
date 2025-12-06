import { defineType } from "sanity";

export default defineType({
	name: "textBlock",
	title: "Text Block",
	type: "object",
	fields: [
		{
			name: "content",
			title: "Content",
			type: "array",
			of: [{ type: "block" }],
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
		},
	],
	preview: {
		select: {
			content: "content",
		},
		prepare({ content }) {
			return {
				title: "Text Block",
				subtitle: content?.[0]?.children?.[0]?.text || "Empty text block",
			};
		},
	},
});
