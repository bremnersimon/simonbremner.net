import path from "node:path";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import aws from "astro-sst";
// @ts-check
import { defineConfig, envField } from "astro/config";

import partytown from "@astrojs/partytown";


export default defineConfig({
	output: "server",
	adapter: aws(),
	site: "https://simonbremner.net",
	prefetch: {
		prefetchAll: true,
		// defaultStrategy: 'viewport'
	},
	integrations: [
		react(),
		sanity({
			projectId: process.env.PUBLIC_PROJECT_ID || "",
			dataset: process.env.PUBLIC_DATASET || "",
			apiVersion: "2026-07-30",
			useCdn: true,
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
	env: {
    schema: {
      PUBLIC_PROJECT_ID: envField.string({ context: "server", access: "secret"}),
      PUBLIC_DATASET: envField.string({ context: "server", access: "secret"}),
    }
  }
});
