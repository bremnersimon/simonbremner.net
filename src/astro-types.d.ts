// astro-types.d.ts
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    'client:load'?: boolean;
    'client:visible'?: boolean;
    'client:idle'?: boolean;
    'client:only'?: string;
  }
}

  // For Astro JSX
  declare namespace astroHTML.JSX {
    interface HTMLAttributes {
      // Allow both class and className in Astro
      class?: string;
      className?: string;
    }
  }