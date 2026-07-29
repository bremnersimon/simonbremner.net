import type { APIRoute } from 'astro';
import { mapGalleryPhoto } from '@/lib/galleryPhoto';
import { getAllPhotos } from '@/lib/sanity';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = new URL(url).searchParams;
  const offset = Number.parseInt(searchParams.get('offset') || '0');
  const limit = Number.parseInt(searchParams.get('limit') || '12');

  try {
    const photos = await getAllPhotos(limit, offset);
    
    const galleryPhotos = photos.map(mapGalleryPhoto);

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