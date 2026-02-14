import { defineField, defineType } from "sanity";

export default defineType({
    name: "photo",
    title: "Photo",
    type: "document",
    groups: [
        {
            name: "image",
            title: "Image",
        },
        {
            name: "details",
            title: "Details",
        },
        {
            name: "technical",
            title: "Technical Info",
        },
        {
            name: "organization",
            title: "Organization",
        },
    ],
    fields: [
        defineField({
            name: "image",
            title: "Photo Image",
            type: "image",
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
            group: "image",
        }),
        defineField({
            name: "location",
            title: "Location",
            type: "string",
            validation: (Rule) => Rule.required(),
            group: "details",
        }),
        defineField({
            name: "categories",
            title: "Categories",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: { type: "category" },
                },
            ],
            validation: (Rule) => Rule.required().min(1),
            group: "organization",
        }),
        defineField({
            name: "dateTaken",
            title: "Date Taken",
            type: "datetime",
            description: "When this photo was taken",
            group: "details",
        }),
        defineField({
            name: "camera",
            title: "Camera",
            type: "reference",
            to: { type: "camera" },
            group: "technical",
        }),
        defineField({
            name: "lens",
            title: "Lens",
            type: "reference",
            to: { type: "lens" },
            group: "technical",
        }),
        defineField({
            name: "focalLength",
            title: "Focal Length",
            type: "string",
            description: "e.g., '85mm', '24-70mm'",
            group: "technical",
        }),
        defineField({
            name: "aperture",
            title: "Aperture",
            type: "string",
            description: "e.g., 'f/2.8', 'f/5.6'",
            group: "technical",
        }),
        defineField({
            name: "shutterSpeed",
            title: "Shutter Speed",
            type: "string",
            description: "e.g., '1/125s', '2s'",
            group: "technical",
        }),
        defineField({
            name: "iso",
            title: "ISO",
            type: "number",
            description: "e.g., 100, 800, 3200",
            group: "technical",
        }),
        defineField({
            name: "publishedAt",
            title: "Published At",
            type: "datetime",
            description: "When to publish this photo",
            initialValue: () => new Date().toISOString(),
            validation: (Rule) => Rule.required(),
            group: "organization",
        }),
    ],
    preview: {
        select: {
            title: "title",
            subtitle: "location",
            media: "image",
        },
    },
    orderings: [
        {
            title: "Date Taken, New",
            name: "dateTakenDesc",
            by: [{ field: "dateTaken", direction: "desc" }],
        },
        {
            title: "Date Taken, Old",
            name: "dateTakenAsc",
            by: [{ field: "dateTaken", direction: "asc" }],
        },
        {
            title: "Published, New",
            name: "publishedAtDesc",
            by: [{ field: "publishedAt", direction: "desc" }],
        },
    ],
});