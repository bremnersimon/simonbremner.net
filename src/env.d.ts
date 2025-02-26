/// <reference types="astro/client" />

interface ImportMetaEnv {
    // Define env variables here if needed
  }
  
  declare namespace Astro {
    interface Globals {
      generator: string;
      site: string;
      url: URL; // This is necessary to access Astro.url.pathname
      request: Request;
      params: Record<string, string>;
      props: Record<string, any>;
      response: Response;
      slots: Record<string, boolean>;
      redirect(path: string, status?: number): Response;
      // Add other Astro global properties as needed
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