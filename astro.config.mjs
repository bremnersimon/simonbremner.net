// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sanity from "@sanity/astro";
import path from "node:path";
import sitemap from "@astrojs/sitemap";

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
