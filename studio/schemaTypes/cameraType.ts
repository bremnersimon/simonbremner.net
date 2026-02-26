import { defineField, defineType } from "sanity";

export default defineType({
	name: "camera",
	title: "Camera",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Camera Name",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "brand",
			title: "Brand",
			type: "string",
		}),
		defineField({
			name: "modelNumber",
			title: "Model Number",
			type: "string",
			description: 'e.g., "EOS R5", "A7 IV", "Z6 II"',
		}),
		defineField({
			name: "type",
			title: "Type",
			type: "string",
			options: {
				list: ["DSLR", "Mirrorless", "Film", "Medium Format", "Drone", "Other"],
			},
		}),
	],
	preview: {
		select: {
			title: "name",
			brand: "brand",
			model: "modelNumber",
		},
		prepare(selection) {
			const { title, brand, model } = selection;
			return {
				title: title,
				subtitle: model ? `${brand} | ${model}` : brand,
			};
		},
	},
});
