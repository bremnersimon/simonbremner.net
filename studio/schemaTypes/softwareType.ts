import { defineField, defineType } from "sanity";

export default defineType({
	name: "softwareType",
	title: "Software Type",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			description: 'Name of the software/framework (e.g., "React", "Next.js")',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			description: "Brief description of the software/framework",
			rows: 2,
		}),
		defineField({
			name: "category",
			title: "Category",
			type: "string",
			description: "Category of the software",
			options: {
				list: [
					{ title: "Development", value: "development" },
					{ title: "Design", value: "design" },
					{ title: "Photography", value: "photography" },
				],
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "icon",
			title: "Icon",
			type: "image",
			description: "Upload an SVG icon for the software",
			options: {
				accept: "image/svg+xml",
				hotspot: true,
			},
			fields: [
				{
					name: "alt",
					type: "string",
					title: "Alternative text",
					description: "Important for SEO and accessibility.",
				},
			],
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: "name",
			subtitle: "category",
			media: "icon",
		},
	},
});
