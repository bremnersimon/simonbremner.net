import { defineType } from "sanity";

export default defineType({
	name: "dividerBlock",
	title: "Divider",
	type: "object",
	fields: [
		{
			name: "style",
			title: "Style",
			type: "string",
			options: {
				list: [
					{ title: "Line", value: "line" },
					{ title: "Dots", value: "dots" },
					{ title: "Stars", value: "stars" },
					{ title: "Space", value: "space" },
				],
				layout: "radio",
			},
			initialValue: "line",
		},
	],
	preview: {
		prepare() {
			return {
				title: "Divider",
			};
		},
	},
});
