import { defineField, defineType } from "sanity";
import codeBlock from "./blocks/codeBlock";
import dividerBlock from "./blocks/dividerBlock";
import featuredImageBlock from "./blocks/featuredImageBlock";
import galleryBlock from "./blocks/galleryBlock";
import headlineBlock from "./blocks/headlineBlock";
import imageBlock from "./blocks/imageBlock";
import quoteBlock from "./blocks/quoteBlock";
import stackBlock from "./blocks/stackBlock";
import textBlock from "./blocks/textBlock";

export default defineType({
	name: "design",
	title: "Design",
	type: "document",
	groups: [
		{
			name: "core",
			title: "Core Information",
		},
		{
			name: "content",
			title: "Content",
		},
		{
			name: "gallery",
			title: "Gallery",
		},
		{
			name: "process",
			title: "Design Process",
		},
		{
			name: "outcomes",
			title: "Outcomes",
		},
		{
			name: "designSystem",
			title: "Design System",
		},
	],
	fields: [
		defineField({
			name: "title",
			title: "Project Title",
			type: "string",
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "title",
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "publishedAt",
			title: "Published at",
			type: "datetime",
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "mainImage",
			title: "Hero Image",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				{
					name: "alt",
					title: "Alt Text",
					type: "string",
					validation: (Rule) => Rule.required(),
				},
				{
					name: "caption",
					title: "Caption",
					type: "string",
				},
			],
			group: "core",
		}),
		defineField({
			name: "author",
			title: "Author",
			type: "reference",
			to: [{ type: "author" }],
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "excerpt",
			title: "Excerpt",
			description: "A brief summary of the project",
			type: "text",
			rows: 3,
			group: "core",
		}),
		defineField({
			name: "category",
			title: "Project Category",
			type: "string",
			options: {
				list: [
					"Brand Identity",
					"Web Design",
					"UI/UX Design",
					"Print Design",
					"Marketing Design",
					"Packaging Design",
					"Environmental Design",
					"Motion Design",
				],
			},
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
			options: {
				layout: "tags",
			},
			group: "core",
		}),
		defineField({
			name: "content",
			title: "Content Blocks",
			description: "Add and arrange content blocks in any order",
			type: "array",
			of: [
				headlineBlock,
				textBlock,
				imageBlock,
				galleryBlock,
				codeBlock,
				dividerBlock,
				quoteBlock,
				featuredImageBlock,
				stackBlock,
			],
			group: "content",
		}),
	],
	preview: {
		select: {
			title: "title",
			slug: "slug.current",
			media: "mainImage",
		},
		prepare({ title, slug, media }) {
			return {
				title,
				slug,
				media,
			};
		},
	},
	orderings: [
		{
			title: "Publication Date, New → Old",
			name: "publishedAtDesc",
			by: [{ field: "publishedAt", direction: "desc" }],
		},
		{
			title: "Project Status",
			name: "projectStatus",
			by: [
				{ field: "projectStatus", direction: "asc" },
				{ field: "title", direction: "asc" },
			],
		},
		{
			title: "Category",
			name: "categoryAsc",
			by: [{ field: "category", direction: "asc" }],
		},
		{
			title: "Title, A → Z",
			name: "titleAsc",
			by: [{ field: "title", direction: "asc" }],
		},
	],
});
