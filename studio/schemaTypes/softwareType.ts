import { defineField, defineType } from "sanity";

export default defineType({
	name: "softwareType",
	title: "Software",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "category",
			title: "Category",
			type: "string",
			options: {
				list: ["design", "development"],
				layout: "radio",
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "icon",
			title: "Logo",
			type: "image",
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
		}),
	],
	preview: {
		select: {
			title: "name",
			subtitle: "description",
			media: "icon",
		},
		prepare(selection) {
			const { title, subtitle, media } = selection;

			return {
				title,
				subtitle,
				media,
			};
		},
	},
});
