import { defineField, defineType } from "sanity";

export default defineType({
	name: "featuredSection",
	title: "Featured Section",
	type: "object",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 2,
		}),
		defineField({
			name: "posts",
			title: "Featured Posts",
			type: "array",
			of: [
				{
					type: "reference",
					to: [
						{ type: "photography" },
						{ type: "design" },
						{ type: "development" },
					],
				},
			],
			validation: (Rule) => Rule.required().min(1).max(3),
		}),
	],
});
