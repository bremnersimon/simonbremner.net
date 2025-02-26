// For React components
declare namespace React {
    interface HTMLAttributes {
      // Allow Astro directives in React components when needed
      'client:load'?: boolean;
      'client:idle'?: boolean;
      'client:visible'?: boolean;
      'client:only'?: string | boolean;
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