// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sanity({
    projectId: "hzdtear2",
    dataset: "production",
    apiVersion: "2024-01-01",
    useCdn: false,
  })],
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  }
});