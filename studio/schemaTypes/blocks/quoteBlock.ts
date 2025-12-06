import { defineType } from "sanity";

export default defineType({
	name: "quoteBlock",
	title: "Quote Block",
	type: "object",
	fields: [
		{
			name: "quote",
			title: "Quote",
			type: "text",
			validation: (Rule) => Rule.required(),
		},
		{
			name: "attribution",
			title: "Attribution",
			type: "string",
			description: "Who said or wrote this quote",
		},
		{
			name: "style",
			title: "Style",
			type: "string",
			options: {
				list: [
					{ title: "Simple", value: "simple" },
					{ title: "Pull Quote", value: "pullQuote" },
					{ title: "Block Quote", value: "blockquote" },
				],
				layout: "radio",
			},
			initialValue: "simple",
		},
	],
	preview: {
		select: {
			quote: "quote",
			attribution: "attribution",
		},
		prepare({ quote, attribution }) {
			return {
				title: "Quote Block",
				subtitle: `${quote?.substring(0, 40)}... ${attribution ? `— ${attribution}` : ""}`,
			};
		},
	},
});
