import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
	name: "socialSettings",
	title: "Social Links & Resume",
	type: "document",
	fields: [
		defineField({
			name: "resumeFile",
			title: "Resume (PDF)",
			type: "file",
			description:
				"Upload a new PDF here to swap the resume everywhere on the site.",
			options: {
				accept: "application/pdf",
			},
		}),
		defineField({
			name: "links",
			title: "Links",
			type: "array",
			of: [defineArrayMember({ type: "socialLink" })],
			description: "Drag to reorder. Order is used on the site.",
		}),
	],
	preview: {
		prepare() {
			return { title: "Social Links & Resume" };
		},
	},
});
