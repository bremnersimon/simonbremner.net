export type FadingSectionProps = {
    id: number;
    title: string;
    content: string[];
    image: ImageMetadata;
    imagePosition: "left" | "right";
    button: { label: string, href: string, icon?: string, external?: boolean }
}

export type AboutHeroTextProps = {
    headline: string;
    paragraphs: string[];
}