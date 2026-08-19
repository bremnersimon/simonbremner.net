import path from "node:path";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import aws from "astro-sst";
import {loadEnv} from "vite";
// @ts-check
import { defineConfig } from "astro/config";

import partytown from "@astrojs/partytown";

const { SANITY_PROJECT_ID, DATA_SET } = loadEnv(process.env.NODE_ENV, process.cwd(), "");


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
			projectId: SANITY_PROJECT_ID,
			dataset: DATA_SET,
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
});
