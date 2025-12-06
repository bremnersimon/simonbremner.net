import { defineType } from "sanity";

export default defineType({
	name: "codeBlock",
	title: "Code Block",
	type: "object",
	fields: [
		{
			name: "code",
			title: "Code",
			type: "text",
			rows: 10,
		},
		{
			name: "language",
			title: "Language",
			type: "string",
			options: {
				list: [
					{ title: "JavaScript", value: "javascript" },
					{ title: "TypeScript", value: "typescript" },
					{ title: "HTML", value: "html" },
					{ title: "CSS", value: "css" },
					{ title: "Python", value: "python" },
					{ title: "Bash", value: "bash" },
				],
			},
		},
	],
	preview: {
		select: {
			language: "language",
			code: "code",
		},
		prepare({ language, code }) {
			return {
				title: "Code Block",
				subtitle: `${language || "No language"} - ${code?.substring(0, 50) || "Empty"}`,
			};
		},
	},
});
