import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const client = createClient({
	projectId: import.meta.env.PUBLIC_PROJECT_ID,
	dataset: import.meta.env.PUBLIC_DATASET,
	apiVersion: "2024-01-01",
	useCdn: import.meta.env.PROD,
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

// Equipment queries
export async function getLenses() {
	return await client.fetch(`*[_type == "lens"] | order(brand asc, name asc)`);
}

export async function getCameras() {
	return await client.fetch(
		`*[_type == "camera"] | order(brand asc, name asc)`,
	);
}

export async function getSoftwareTypes() {
	return await client.fetch(
		`*[_type == "softwareType"]{
      _id,
      name,
      category,
      description,
      icon{
        ..., 
        asset->
      }
    } | order(name asc)`,
	);
}

// Social links & resume (singleton)
export interface SocialLink {
	label: string;
	href: string;
	iconUrl: string;
	isSvg: boolean;
	isExternal: boolean;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
	const settings = await client.fetch<{
		resumeUrl: string | null;
		links: Array<{
			label: string;
			linkType: "external" | "resume";
			url: string | null;
			iconUrl: string | null;
			iconExtension: string | null;
		}> | null;
	} | null>(
		`*[_type == "socialSettings"][0]{
      "resumeUrl": resumeFile.asset->url,
      links[]{
        label,
        linkType,
        url,
        "iconUrl": icon.asset->url,
        "iconExtension": icon.asset->extension
      }
    }`,
	);

	if (!settings?.links) return [];

	return settings.links.flatMap((link) => {
		const href =
			link.linkType === "resume" ? settings.resumeUrl : (link.url ?? null);

		if (!href || !link.iconUrl) return [];

		return [
			{
				label: link.label,
				href,
				iconUrl: link.iconUrl,
				isSvg: link.iconExtension === "svg",
				isExternal: !href.startsWith("mailto:"),
			},
		];
	});
}

// Gallery Functions for Photos
export async function getAllPhotos(limit = 50, offset = 0) {
	const endIndex = offset + limit - 1;
	return await client.fetch(
		`*[_type == "photo"] | order(
      sortOrder asc,
      dateTaken desc
    )[$offset..$endIndex] {
      _id,
      title,
      slug,
      altText,
      description,
      image{
        ...,
        asset->{
          ...,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      },
      categories[]->{
        _id,
        name,
        slug,
        color
      },
      tags,
      dateTaken,
      location,
      featured,
      publishedAt,
      camera->{
        _id,
        name,
        brand,
        modelNumber
      },
      lens->{
        _id,
        name,
        brand,
        focalLength
      },
      focalLength,
      aperture,
      shutterSpeed,
      iso
    }`,
		{
			offset,
			endIndex,
		},
	);
}

export async function getAllCategories() {
	return await client.fetch(
		`*[_type == "category"] | order(sortOrder asc, name asc) {
      _id,
      name,
      slug,
      description,
      color,
      sortOrder
    }`,
	);
}

export async function getPhotosByCategory(categorySlug: string, limit = 50) {
	return await client.fetch(
		`*[_type == "photo" && publishedAt <= now() && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(
      sortOrder asc,
      dateTaken desc
    )[0...$limit] {
      _id,
      title,
      slug,
      altText,
      description,
      image{
        ...,
        asset->{
          ...,
          metadata {
            dimensions {
              width,
              height,
              aspectRatio
            }
          }
        }
      },
      categories[]->{
        _id,
        name,
        slug,
        color
      },
      tags,
      dateTaken,
      location,
      featured,
      publishedAt,
      camera->{
        _id,
        name,
        brand,
        modelNumber
      },
      lens->{
        _id,
        name,
        brand,
        focalLength
      },
      focalLength,
      aperture,
      shutterSpeed,
      iso
    }`,
		{ categorySlug, limit },
	);
}

export async function getPortfolioPosts(limit = 48) {
	return await client.fetch(
		`*[_type == "portfolio"] | order(publishedAt desc)[0...$limit]{
      _id,
      headline,
      slug,
      category,
      introduction,
      publishedAt,
      techStack[]->{
        _id,
        name,
        category,
        description,
        icon{
          ..., 
          asset->
        }
      },
      serviceTags,
      colorsUsed,
      brandLogo{
        ...,
        asset->
      },
      heroImage{
        ...,
        asset->
      },
      content[]{
        ...,
        _type == "image" => {
          ...,
          asset->
        },
        _type == "imageCarousel" => {
          ...,
          images[]{
            ...,
            asset->
          }
        }
      }
    }`,
		{ limit },
	);
}

export async function getPortfolioPostBySlug(slug: string) {
	return await client.fetch(
		`*[_type == "portfolio" && slug.current == $slug][0]{
      _id,
      headline,
      slug,
      category,
      introduction,
      publishedAt,
      techStack[]->{
        _id,
        name,
        category,
        description,
        icon{
          ..., 
          asset->
        }
      },
      serviceTags,
      colorsUsed,
      brandLogo{
        ...,
        asset->
      },
      heroImage{
        ...,
        asset->
      },
      content[]{
        ...,
        _type == "image" => {
          ...,
          asset->
        },
        _type == "imageCarousel" => {
          ...,
          images[]{
            ...,
            asset->
          }
        }
      }
    }`,
		{ slug },
	);
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
