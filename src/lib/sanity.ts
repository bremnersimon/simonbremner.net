import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const client = createClient({
  projectId: "hzdtear2",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

const builder = imageUrlBuilder(client);

// Helper function to build image URLs
export function urlForImage(source: SanityImageSource) {
  // Handle cases where source might be null or undefined
  if (!source) {
    return {
      url: () => "",
      width: () => urlForImage(source),
      height: () => urlForImage(source),
      fit: () => urlForImage(source),
      auto: () => urlForImage(source),
      crop: () => urlForImage(source),
      format: () => urlForImage(source),
    };
  }

  return builder.image(source);
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
    } | order(publishedAt desc)[0...12]
  }`);
}

export async function getAllPostsByType(
  type: "photography" | "design" | "development" | "handcrafted",
  limit = 24
) {
  return await client.fetch(
    `*[_type == $type]{
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    tags,
    "category": _type
  } | order(publishedAt desc)[0...$limit]`,
    { type, limit },
  );
}

// Define project type constants
export const PROJECT_TYPES = {
  PHOTOGRAPHY: "photography",
  DESIGN: "design",
  DEVELOPMENT: "development",
  HANDCRAFTED: "handcrafted",
};

/**
 * Fetch project data by type and slug
 *
 * @param projectType - The type of project (photography, design, development, handcrafted)
 * @param slug - The slug of the project to fetch
 * @returns The project data with all referenced blocks expanded
 */
export async function fetchProjectById(projectType: string, slug: string) {
  if (!projectType || !slug) {
    throw new Error("Project type and slug are required");
  }

  // Base query structure
  const baseQuery = `
    *[_type == $projectType && slug.current == $slug][0]{
      _id,
      title,
      slug,
      publishedAt,
      excerpt,
      mainImage{
        ...,
        asset->
      },
      author->{
        name,
        image{
          ...,
          asset->
        }
      },
      
      // Common fields for all project types
      tags,
      
      // Type-specific fields
      ${projectType === PROJECT_TYPES.PHOTOGRAPHY
      ? `
        location,
        shootMetadata{
          theme,
          equipment{
            cameras[]->{
              _id,
              name,
              brand,
              modelNumber,
              type
            },
            lenses[]->{
              _id,
              name,
              brand,
              focalLength,
              maxAperture
            }
          },
          technicalNotes
        },
      `
      : ""
    }
      
      ${projectType === PROJECT_TYPES.DESIGN
      ? `
        designTeam[]->{
          name,
          image{
            ...,
            asset->
          }
        },
        projectStatus,
        projectDuration,
        client,
        category,
        tools[]->{
          _id,
          name,
          description,
          icon{
            ...,
            asset->
          }
        },
        caseStudy,
        gallery[]{
          ...,
          asset->
        },
        process[]{
          ...,
          artifacts[]{
            ...,
            media{
              ...,
              asset->
            }
          }
        },
        designSystem{
          colors,
          typography,
          logos[]{
            ...,
            image{
              ...,
              asset->
            }
          }
        },
      `
      : ""
    }
      
      ${projectType === PROJECT_TYPES.DEVELOPMENT
      ? `
        projectStatus,
        projectDuration,
        clientName,
        projectLink,
        projectType,
        techStack{
          frontend[]-> {_id, name, description, icon{..., asset->}},
          backend[]-> {_id, name, description, icon{..., asset->}},
          database[]-> {_id, name, description, icon{..., asset->}},
          devOps[]-> {_id, name, description, icon{..., asset->}}
        },
        frameworks[]-> {_id, name, description, icon{..., asset->}},
        libraries[]-> {_id, name, description, icon{..., asset->}},
        hostingPlatform-> {_id, name, description, icon{..., asset->}},
      `
      : ""
    }
      
      ${projectType === PROJECT_TYPES.HANDCRAFTED
      ? `
        craftMeta{
          materials,
          dimensions,
          techniques,
          timeToComplete
        },
      `
      : ""
    }
      
      // Content blocks - common for all project types with project-specific variations
      content[]{
        ...,
        _type == "stackBlock" => {
          ...,
          "technologies": technologies[]-> {
            _id,
            name,
            description,
            icon{
              ...,
              asset->
            }
          }
        },
        _type == "featuredImageBlock" => {
          ...,
          "cameraData": imageMetadata.camera->,
          "lensData": imageMetadata.lens->,
          image{
            ...,
            asset->
          }
        },
        _type == "behindTheScenesBlock" => {
          ...,
          images[]{
            ...,
            asset->
          }
        },
        _type == "galleryBlock" => {
          ...,
          images[]{
            ...,
            asset->
          }
        },
        _type == "imageBlock" => {
          ...,
          image{
            ...,
            asset->
          }
        },
        _type == "demoBlock" => {
          ...,
          demoContent[]{
            ...,
            _type == "image" => {
              ...,
              asset->
            },
            _type == "file" => {
              ...,
              asset->
            }
          }
        },
        _type == "processBlock" => {
          ...,
          phases[]{
            ...,
            description[]
          }
        },
        _type == "challengeBlock" => {
          ...,
          challenges[]{
            ...,
            solution[]
          }
        },
        _type == "techSpecsBlock" => {
          ...,
          specs[]
        },
        _type == "codeBlock" => {
          ...,
          code,
          language
        },
        _type == "quoteBlock" => {
          ...,
          quote,
          attribution,
          style
        },
        _type == "textBlock" => {
          ...,
          content[]
        },
        _type == "headlineBlock" => {
          ...,
          headline,
          size,
          alignment,
          width
        },
        _type == "dividerBlock" => {
          ...,
          style
        },
        // Design-specific blocks
        _type == "beforeAfterBlock" => {
          ...,
          beforeImage{
            ...,
            asset->
          },
          afterImage{
            ...,
            asset->
          }
        },
        _type == "testimonialBlock" => {
          ...,
          avatar{
            ...,
            asset->
          }
        },
        _type == "responsiveDesignBlock" => {
          ...,
          devices[]{
            ...,
            image{
              ...,
              asset->
            }
          }
        },
        _type == "iterationBlock" => {
          ...,
          iterations[]{
            ...,
            image{
              ...,
              asset->
            }
          }
        },
        _type == "repoLinkBlock" => {
          ...,
          repository,
          liveUrl
        }
      }
    }
  `;

  try {
    return await client.fetch(baseQuery, {
      projectType,
      slug,
    });
  } catch (error) {
    console.error(`Error fetching ${projectType} project:`, error);
    throw error;
  }
}

/**
 * Example usage:
 *
 * // For photography
 * const photographyProject = await fetchProjectById(PROJECT_TYPES.PHOTOGRAPHY, 'photography-id');
 *
 * // For design
 * const designProject = await fetchProjectById(PROJECT_TYPES.DESIGN, 'design-id');
 *
 * // For development
 * const developmentProject = await fetchProjectById(PROJECT_TYPES.DEVELOPMENT, 'dev-id');
 *
 * // For handcrafted
 * const handcraftedProject = await fetchProjectById(PROJECT_TYPES.HANDCRAFTED, 'craft-id');
 */
