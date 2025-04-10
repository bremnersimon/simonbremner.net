// Main Types
export interface ProjectCardProps {
  [x: string]: any;
  _id: string;
  mainImage: { src: string; alt: string };
  caption?: string;
  title: string;
  slug: { current: string };
  category?: string;
  tags?: string[];
  publishedAt?: string;
  // Add any other properties you need
}

interface FooterLink {
  title: string
  href: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterProps {
  title: string
  sections: FooterSection[]
  year?: number
}

// Global Types
// export interface SiteConfig {}