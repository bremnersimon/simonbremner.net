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
  name: "handcrafted",
  title: "Handcrafted",
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
      name: "metadata",
      title: "Project Metadata",
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
      options: {
        layout: "list",
        editModal: "fullscreen",
      },
    }),

    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      group: "metadata",
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      media: "mainImage",
      publishedAt: "publishedAt",
    },
    prepare({ title, slug, media, publishedAt }) {
      const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString()
        : "No date";

      return {
        title: title || "Untitled",
        subtitle: `${formattedDate}`,
        media: media,
        description: `/handcrafted/${slug}`,
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
