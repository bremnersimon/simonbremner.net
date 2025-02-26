/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  // Define env variables here if needed
}

declare namespace Astro {
  interface Globals {
    generator: string;
    site: string;
    url: URL;
    request: Request;
    params: { 
      category?: string;  // Category parameter for /projects/[category]
      slug?: string;      // Slug parameter for /projects/[category]/[slug]
    };
    response: Response;
    slots: Record<string, boolean>;
    redirect(path: string, status?: number): Response;
    props: {
      image?: {
        _type?: string;
        asset?: {
          _ref?: string;
        };
        alt?: string;
        caption?: string;
      } | null;
      size?: "standard" | "large" | "fullWidth";
      imageMetadata?: {
        camera?: { _ref?: string; _type?: string };
        lens?: { _ref?: string; _type?: string };
        aperture?: string;
        shutterSpeed?: string;
        iso?: number;
      };
      showMetadata?: boolean;
      showLabel?: boolean;
    };
  }
}
declare module '*.svg' {
  const content: {
    src: string;
    width?: number;
    height?: number;
  };
  export default content;
}

declare module '*.png' {
  const content: {
    src: string;
    width?: number;
    height?: number;
  };
  export default content;
}