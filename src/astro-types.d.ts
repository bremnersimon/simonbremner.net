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