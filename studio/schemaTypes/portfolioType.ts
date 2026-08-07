import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
	name: "portfolio",
	title: "Portfolio",
	type: "document",
	groups: [
		{
			name: "core",
			title: "Core",
		},
		{
			name: "branding",
			title: "Branding",
		},
		{
			name: "content",
			title: "Content",
		},
		{
			name: "meta",
			title: "Meta",
		},
	],
	fields: [
		defineField({
			name: "headline",
			title: "Headline",
			type: "string",
			description: "Project name shown on portfolio cards and detail pages",
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "headline",
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "category",
			title: "Categories",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
			options: {
				list: [
					{ title: "Design", value: "design" },
					{ title: "Development", value: "development" },
				],
				layout: "grid",
			},
			validation: (Rule) =>
				Rule.required()
					.min(1)
					.unique()
					.custom((value) => {
						if (!Array.isArray(value)) {
							return true;
						}

						const allowed = new Set(["design", "development"]);
						const hasInvalidValue = value.some(
							(item) => typeof item !== "string" || !allowed.has(item),
						);

						if (hasInvalidValue) {
							return "Categories can only include Design or Development.";
						}

						if (value.length > 2) {
							return "You can select at most Design and Development.";
						}

						return true;
					}),
			group: "core",
		}),
		defineField({
			name: "introduction",
			title: "Introduction Text",
			type: "text",
			rows: 4,
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "heroImage",
			title: "Hero Image",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				defineField({
					name: "alt",
					title: "Alt Text",
					type: "string",
					validation: (Rule) => Rule.required(),
				}),
				defineField({
					name: "caption",
					title: "Caption",
					type: "string",
				}),
			],
			validation: (Rule) => Rule.required(),
			group: "core",
		}),
		defineField({
			name: "techStack",
			title: "Tech Stack",
			type: "array",
			description: "Select the software used for this project.",
			of: [
				defineArrayMember({
					type: "reference",
					to: [{ type: "softwareType" }],
				}),
			],
			group: "content",
		}),
		defineField({
			name: "serviceTags",
			title: "Service Tags",
			type: "array",
			description:
				"Suggested tags: Branding, Print, Web Design, Development. You can also add custom values.",
			of: [defineArrayMember({ type: "string" })],
			options: {
				list: [
					"Branding",
					"Print",
					"Web Design",
					"Development",
					"Logo Design",
					"Product Design",
					"UI/UX Design",
					"Illustration",
					"Photo Editing",
					"Animation",
					"Video Production",
					"Marketing",
					"SEO",
					"Content Creation",
					"Packaging Design",
					"photography",
				],
				layout: "grid",
			},
			validation: (Rule) => Rule.required().min(1),
			group: "branding",
		}),
		defineField({
			name: "content",
			title: "Content",
			type: "array",
			of: [
				defineArrayMember({ type: "block" }),
				defineArrayMember({
					type: "image",
					options: {
						hotspot: true,
					},
					fields: [
						defineField({
							name: "alt",
							title: "Alt Text",
							type: "string",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "caption",
							title: "Caption",
							type: "string",
						}),
					],
				}),
				defineArrayMember({
					type: "object",
					name: "callout",
					title: "Callout",
					fields: [
						defineField({
							name: "title",
							title: "Title",
							type: "string",
						}),
						defineField({
							name: "tone",
							title: "Tone",
							type: "string",
							options: {
								list: [
									{ title: "Info", value: "info" },
									{ title: "Success", value: "success" },
									{ title: "Warning", value: "warning" },
									{ title: "Neutral", value: "neutral" },
								],
								layout: "radio",
							},
							initialValue: "info",
						}),
						defineField({
							name: "body",
							title: "Body",
							type: "text",
							rows: 4,
							validation: (Rule) => Rule.required(),
						}),
					],
					preview: {
						select: {
							title: "title",
							tone: "tone",
							body: "body",
						},
						prepare({ title, tone, body }) {
							return {
								title: title || "Callout",
								subtitle: `${tone || "info"}: ${body?.slice(0, 60) || ""}`,
							};
						},
					},
				}),
				defineArrayMember({
					type: "object",
					name: "videoEmbed",
					title: "Video",
					fields: [
						defineField({
							name: "url",
							title: "Video URL",
							type: "url",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "caption",
							title: "Caption",
							type: "string",
						}),
					],
					preview: {
						select: {
							title: "caption",
							subtitle: "url",
						},
						prepare({ title, subtitle }) {
							return {
								title: title || "Video",
								subtitle,
							};
						},
					},
				}),
				defineArrayMember({
					type: "object",
					name: "cta",
					title: "CTA",
					fields: [
						defineField({
							name: "label",
							title: "Label",
							type: "string",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "url",
							title: "URL",
							type: "url",
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: "style",
							title: "Style",
							type: "string",
							options: {
								list: [
									{ title: "Primary", value: "primary" },
									{ title: "Secondary", value: "secondary" },
								],
								layout: "radio",
							},
							initialValue: "primary",
						}),
					],
					preview: {
						select: {
							title: "label",
							subtitle: "url",
						},
					},
				}),
				defineArrayMember({
					type: "object",
					name: "imageCarousel",
					title: "Image Carousel",
					fields: [
						defineField({
							name: "images",
							title: "Images",
							type: "array",
							of: [
								defineArrayMember({
									type: "image",
									options: {
										hotspot: true,
									},
									fields: [
										defineField({
											name: "alt",
											title: "Alt Text",
											type: "string",
											validation: (Rule) => Rule.required(),
										}),
										defineField({
											name: "caption",
											title: "Caption",
											type: "string",
										}),
									],
								}),
							],
							validation: (Rule) => Rule.required().min(1),
						}),
					],
					preview: {
						select: {
							images: "images",
						},
						prepare({ images }) {
							return {
								title: "Image Carousel",
								subtitle: `${images?.length || 0} images`,
								media: images?.[0],
							};
						},
					},
				}),
			],
			group: "content",
			options: {
				layout: "list",
			},
		}),
		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
			initialValue: () => new Date().toISOString(),
			validation: (Rule) => Rule.required(),
			group: "meta",
		}),
	],
	preview: {
		select: {
			title: "headline",
			categories: "category",
			media: "heroImage",
		},
		prepare({ title, categories, media }) {
			const categoryLabels = Array.isArray(categories)
				? categories
						.map((category) =>
							category === "design"
								? "Design"
								: category === "development"
									? "Development"
									: category,
						)
						.filter(Boolean)
				: [];

			return {
				title: title || "Untitled Portfolio Post",
				subtitle:
					categoryLabels.length > 0
						? categoryLabels.join(" · ")
						: "Uncategorised",
				media,
			};
		},
	},
	orderings: [
		{
			title: "Published, New",
			name: "publishedAtDesc",
			by: [{ field: "publishedAt", direction: "desc" }],
		},
		{
			title: "Published, Old",
			name: "publishedAtAsc",
			by: [{ field: "publishedAt", direction: "asc" }],
		},
		{
			title: "Headline A-Z",
			name: "headlineAsc",
			by: [{ field: "headline", direction: "asc" }],
		},
	],
});
