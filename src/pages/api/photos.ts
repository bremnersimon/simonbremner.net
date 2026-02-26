import type { APIRoute } from 'astro';
import { getAllPhotos, urlForImage } from '@/lib/sanity';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = new URL(url).searchParams;
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    const photos = await getAllPhotos(limit, offset);
    
    // Transform photos for display (same logic as in gallery.astro)
    const galleryPhotos = photos.map((photo) => {
      const dimensions = photo.image?.asset?.metadata?.dimensions;
      const width = dimensions?.width || 800;
      const height = dimensions?.height || 600;
      const aspectRatio = dimensions?.aspectRatio || (width / height);
      const orientation = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
      
      return {
        _id: photo._id,
        title: photo.title,
        slug: photo.slug,
        altText: photo.altText,
        description: photo.description,
        image: {
          src: photo.image 
            ? urlForImage(photo.image).format("webp").width(1920).quality(90).url()
            : "/images/no-image.svg",
          thumbnail: photo.image
            ? urlForImage(photo.image).format("webp").width(600).quality(85).url()  
            : "/images/no-image.svg",
          alt: photo.altText || photo.title,
          width,
          height,
        },
        dimensions: {
          width,
          height,
          aspectRatio,
          orientation
        },
        categories: photo.categories || [],
        tags: photo.tags || [],  
        dateTaken: photo.dateTaken,
        location: photo.location,
        featured: photo.featured,
        camera: photo.camera || null,
        lens: photo.lens || null,
        focalLength: photo.focalLength || null,
        aperture: photo.aperture || null,
        shutterSpeed: photo.shutterSpeed || null,
        iso: photo.iso || null,
      };
    });

    return new Response(JSON.stringify({
      photos: galleryPhotos,
      hasMore: photos.length === limit, // If we got the full limit, there might be more
      offset,
      limit
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch photos' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};