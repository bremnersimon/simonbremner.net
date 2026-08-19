import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

const SINGLETON_TYPES = new Set(["socialSettings"]);

export default defineConfig({
	name: "default",
	title: process.env.SANITY_STUDIO_PROJECT_TITLE || "",
	projectId: process.env.SANITY_STUDIO_PROJECT_ID || "",
	dataset: process.env.SANITY_STUDIO_DATA_SET || "production",
	plugins: [
		structureTool({
			structure: (S) =>
				S.list()
					.title("Content")
					.items([
						S.listItem()
							.title("Social Links & Resume")
							.id("socialSettings")
							.child(
								S.document()
									.schemaType("socialSettings")
									.documentId("socialSettings")
									.title("Social Links & Resume"),
							),
						S.divider(),
						...S.documentTypeListItems().filter(
							(item) => !SINGLETON_TYPES.has(item.getId() ?? ""),
						),
					]),
		}),
		visionTool(),
	],

	document: {
		// Singletons can't be duplicated or deleted from the document actions menu
		actions: (input, context) =>
			SINGLETON_TYPES.has(context.schemaType)
				? input.filter(
						({ action }) =>
							action &&
							["publish", "discardChanges", "restore"].includes(action),
					)
				: input,
	},

	schema: {
		types: schemaTypes,
	},
});
