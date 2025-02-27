import imageUrlBuilder from '@sanity/image-url';
import {createClient} from '@sanity/client';
import type {SanityImageSource} from '@sanity/image-url/lib/types/types';

type SanityImageWithAsset = {
  asset: {
    _ref: string;
    _type: string;
  }
} & Record<string, any>;

export const client = createClient({
  projectId: "hzdtear2",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const builder = imageUrlBuilder(client);

export function urlForImage(source: any) {
  console.log('Image source:', source);

  // Check for Sanity image structure
  if (
    source && 
    source._type === 'image' && 
    source.asset && 
    source.asset._type === 'reference' && 
    source.asset._ref
  ) {
    return builder.image(source);
  }
  
  console.error('Invalid Sanity image source:', source);
  
  // Return a fallback to prevent errors
  return builder.image({
    asset: { _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg' }
  });
}

export async function getHomePageProjects() {
  return await client.fetch(`{
    "featuredProjects": *[
      _type in ["photography", "design", "development", "handcrafted"]
    ] {
      _id,
      title,
      slug,
      publishedAt,
      mainImage,
      tags,
      "category": _type
    } | order(publishedAt desc)[0...24]
  }`);
}

// Utility function to fetch all photography posts
export async function getAllPhotographyPosts() {
  return await client.fetch(`*[_type == "photography"]{
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    tags,
  }`);
}

// Utility function to fetch a single photography post by slug
export async function getPhotographyPostBySlug(slug: string) {
  const data = await client.fetch(`*[_type == "photography" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    excerpt,
    author->{
      name,
      image
    },
    content,
    location,
    tags,
    "shootMetadata": {
      "camera": camera->{ title, model, brand },
      "lens": lens->{ title, model, brand }
    },
    "relatedContent": relatedContent[]->{ 
      title, 
      slug,
      mainImage
    }
  }`, {slug});
  
  // Add extensive logging
  console.log('Fetched Photography Post:', JSON.stringify({
    mainImage: data.mainImage,
    contentImages: data.content
      ?.filter((block: any) => 
        block._type === 'imageBlock' || 
        block._type === 'galleryBlock' || 
        block._type === 'featuredImageBlock'
      )
      .map((block: any) => ({
        type: block._type,
        images: block.images || block.image
      })),
  }, null, 2));
  
  return data;
}