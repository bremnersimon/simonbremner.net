/// <reference types="astro/client" />

interface ImportMetaEnv {
    // Define env variables here if needed
  }
  
  // Explicitly declare the Astro namespace
  declare namespace Astro {
    interface Globals {
      generator: string;
      site: string;
      // Add other Astro global properties as needed
    }
  }
  
  // Make the Astro object available globally in .astro files
  declare const Astro: Astro.Globals;
  
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
  
  