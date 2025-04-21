import path from "node:path";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";

import partytown from "@astrojs/partytown";

export default defineConfig({
	site: "https://www.simonbremner.net",
	integrations: [
		react(),
		sanity({
			projectId: "hzdtear2",
			dataset: "production",
			apiVersion: "2024-01-01",
			useCdn: false,
		}),
		sitemap(),
		partytown(),
	],
	vite: {
		// @ts-ignore
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve("./src"),
			},
		},
	},
});
