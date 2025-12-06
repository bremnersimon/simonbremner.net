import { defineType } from "sanity";

export default defineType({
	name: "stackBlock",
	title: "Technology Stack",
	type: "object",
	fields: [
		{
			name: "type",
			type: "string",
			initialValue: "stackBlock",
			hidden: true,
		},
		{
			name: "heading",
			title: "Heading",
			type: "string",
			initialValue: "Technology Stack",
		},
		{
			name: "technologies",
			title: "Technologies",
			type: "array",
			of: [
				{
					type: "reference",
					to: [{ type: "softwareType" }],
					options: { disableNew: false },
				},
			],
			validation: (Rule) => Rule.required().min(1),
		},
	],
	preview: {
		select: {
			title: "heading",
		},
	},
});
