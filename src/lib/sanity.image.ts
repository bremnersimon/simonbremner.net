// src/lib/sanity.image.ts
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Sanity configuration (create a sanity.config.ts file with this info)
const config = {
  projectId: 'hzdtear2', // Replace with your Sanity project ID
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
};

// Create an image URL builder
const builder = imageUrlBuilder(config);

// Helper function to build image URLs
export const urlForImage = (source: SanityImageSource) => {
  return builder.image(source);
};

// Helper to resolve references in blocks
export const resolveReferences: any = async (block: any, client: any) => {
  if (!block) return block;

  // Handle arrays
  if (Array.isArray(block)) {
    return Promise.all(block.map(item => resolveReferences(item, client)));
  }

  // Handle objects
  if (typeof block === 'object' && block !== null) {
    const resolvedBlock = { ...block };

    // Check for references that need to be resolved
    for (const [key, value] of Object.entries(resolvedBlock)) {
      if (value && typeof value === 'object') {
        if (value._type === 'reference' && value._ref) {
          try {
            // Fetch the referenced document
            const referencedDoc = await client.fetch(`*[_id == $id][0]`, { id: value._ref });
            // Store the expanded reference in a special property
            resolvedBlock._expanded = referencedDoc;
          } catch (error) {
            console.error(`Error resolving reference for ${key}:`, error);
          }
        } else {
          // Recursively resolve references in nested objects
          resolvedBlock[key] = await resolveReferences(value, client);
        }
      }
    }

    return resolvedBlock;
  }

  return block;
};