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
  name: "photography",
  title: "Photography",
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
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      title: "Cover Image",
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
      validation: (Rule) => Rule.required(),
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
      type: "text",
      rows: 4,
      group: "core",
    }),

    defineField({
      name: "content",
      title: "Content Blocks",
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
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      tags: "tags",
      media: "mainImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, slug, tags, media, publishedAt }) {
      const tagsList = tags ? tags.join(", ") : "No tags";
      const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString()
        : "No date";

      return {
        title: title || "Untitled",
        subtitle: `${formattedDate} | ${tagsList}`,
        media: media,
        description: `/photography/${slug}`,
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
      title: "Title, A → Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
