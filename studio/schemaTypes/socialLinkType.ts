import { defineField, defineType } from "sanity";

export default defineType({
	name: "socialLink",
	title: "Social Link",
	type: "object",
	fields: [
		defineField({
			name: "label",
			title: "Label",
			type: "string",
			description: 'Visible text, e.g. "LinkedIn" or "Resume"',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "icon",
			title: "Icon",
			type: "image",
			description:
				"SVG or PNG. SVGs using currentColor will follow the site theme.",
			options: {
				accept: "image/svg+xml,image/png",
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "linkType",
			title: "Link Type",
			type: "string",
			options: {
				list: [
					{ title: "External URL", value: "external" },
					{ title: "Resume File", value: "resume" },
				],
				layout: "radio",
			},
			initialValue: "external",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "url",
			title: "URL",
			type: "url",
			description: "Supports https and mailto links",
			hidden: ({ parent }) => parent?.linkType === "resume",
			validation: (Rule) =>
				Rule.uri({ scheme: ["http", "https", "mailto"] }).custom(
					(value, context) => {
						const parent = context.parent as { linkType?: string } | undefined;
						if (parent?.linkType !== "resume" && !value) {
							return "URL is required for external links";
						}
						return true;
					},
				),
		}),
	],
	preview: {
		select: {
			title: "label",
			linkType: "linkType",
			url: "url",
			media: "icon",
		},
		prepare(selection) {
			const { title, linkType, url, media } = selection;

			return {
				title,
				subtitle: linkType === "resume" ? "Resume file" : url,
				media,
			};
		},
	},
});
