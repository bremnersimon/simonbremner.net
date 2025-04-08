# Simon Bremner's Portfolio

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── PageLayout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

// Component Structure:

// 1. GENERIC CONTENT BLOCKS (for all content types):
// - TextBlock.astro: For general text content with headings and paragraphs
// - ImageBlock.astro: For displaying single images with captions
// - GalleryBlock.astro: For displaying multiple images in a grid or carousel
// - QuoteBlock.astro: For displaying quotes with attribution
// - DividerBlock.astro: For visual separation between content sections

// 2. PHOTOGRAPHY-SPECIFIC BLOCKS:
// - FeaturedImageBlock.astro: Image with technical metadata (camera, settings, etc.)
// - TechSpecsBlock.astro: For displaying equipment details in a table format
// - BehindTheScenesBlock.astro: For showing the process with description and images
// - MetadataFooter.astro: For displaying location, tags, and technical notes

// 3. HELPER COMPONENTS:
// - ContentBlockWrapper.astro: Wrapper with consistent styling for all blocks
