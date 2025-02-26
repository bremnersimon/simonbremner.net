type Project = {
    id: string;
    image: {
        src: string;
        alt: string;
    };
    caption: string;
    title: string;
    slug: string;
    category: string;
    tags: string[];
};

export const projects: Project[] = [
    {
        id: "1",
        image: {
            src: "/images/example.png",
            alt: "Mountain landscape photography",
        },
        caption: "Alpine Vistas",
        title: "Mountain Majesty",
        slug: "mountain-majesty",
        category: "Photography",
        tags: ["Landscape", "Nature", "Alps"],
    },
    {
        id: "2",
        image: { src: "/images/example.png", alt: "Urban street photography" },
        caption: "Urban Stories",
        title: "City Rhythms",
        slug: "city-rhythms",
        category: "Photography",
        tags: ["Urban", "Street", "Black & White"],
    },
    {
        id: "3",
        image: { src: "/images/example.png", alt: "Portrait photography" },
        caption: "Character Studies",
        title: "Faces of Humanity",
        slug: "faces-humanity",
        category: "Photography",
        tags: ["Portrait", "People", "Documentary"],
    },
    {
        id: "4",
        image: {
            src: "/images/example.png",
            alt: "Handcrafted wooden furniture",
        },
        caption: "Oakwood Designs",
        title: "Artisanal Tables",
        slug: "artisanal-tables",
        category: "Handcrafted",
        tags: ["Furniture", "Wood", "Artisan"],
    },
    {
        id: "5",
        image: {
            src: "/images/example.png",
            alt: "E-commerce website development",
        },
        caption: "Digital Solutions",
        title: "Marketplace Platform",
        slug: "marketplace-platform",
        category: "Development",
        tags: ["E-commerce", "Web App", "React"],
    },
    {
        id: "6",
        image: { src: "/images/example.png", alt: "Brand identity design" },
        caption: "Brand Elevation",
        title: "Corporate Identity Redesign",
        slug: "corporate-identity",
        category: "Design",
        tags: ["Branding", "Identity", "Corporate"],
    },
    {
        id: "7",
        image: { src: "/images/example.png", alt: "Minimalist logo design" },
        caption: "Minimal Design Co.",
        title: "Logo Collection 2025",
        slug: "logo-collection-2025",
        category: "Design",
        tags: ["Logo", "Minimalist", "Collection"],
    },
    {
        id: "8",
        image: { src: "/images/example.png", alt: "Mobile app interface" },
        caption: "AppTech Solutions",
        title: "Fitness Tracker App",
        slug: "fitness-tracker-app",
        category: "Development",
        tags: ["Mobile", "UI/UX", "Health Tech"],
    },
    {
        id: "9",
        image: {
            src: "/images/example.png",
            alt: "Handcrafted ceramic pottery",
        },
        caption: "Clay Artisans",
        title: "Ceramic Collection",
        slug: "ceramic-collection",
        category: "Handcrafted",
        tags: ["Ceramic", "Pottery", "Handmade"],
    },
    {
        id: "10",
        image: { src: "/images/example.png", alt: "Wildlife photography" },
        caption: "Wild Encounters",
        title: "Safari Documentation",
        slug: "safari-documentation",
        category: "Photography",
        tags: ["Wildlife", "Safari", "Documentary"],
    },
    {
        id: "11",
        image: { src: "/images/example.png", alt: "Web application dashboard" },
        caption: "DataViz Inc.",
        title: "Analytics Dashboard",
        slug: "analytics-dashboard",
        category: "Development",
        tags: ["Dashboard", "Data Viz", "SaaS"],
    },
    {
        id: "12",
        image: { src: "/images/example.png", alt: "Handcrafted jewelry" },
        caption: "Silver & Stone",
        title: "Artisan Jewelry Line",
        slug: "artisan-jewelry",
        category: "Handcrafted",
        tags: ["Jewelry", "Silver", "Gems"],
    },
    {
        id: "13",
        image: { src: "/images/example.png", alt: "Magazine layout design" },
        caption: "Print Masters",
        title: "Editorial Design",
        slug: "editorial-design",
        category: "Design",
        tags: ["Editorial", "Print", "Layout"],
    },
    {
        id: "14",
        image: { src: "/images/example.png", alt: "Night sky photography" },
        caption: "Astral Images",
        title: "Milky Way Exposures",
        slug: "milky-way-exposures",
        category: "Photography",
        tags: ["Astrophotography", "Night Sky", "Long Exposure"],
    },
    {
        id: "15",
        image: { src: "/images/example.png", alt: "Social media app" },
        caption: "ConnectTech",
        title: "Social Platform Redesign",
        slug: "social-platform-redesign",
        category: "Development",
        tags: ["Social Media", "UX Design", "Mobile"],
    },
    {
        id: "16",
        image: { src: "/images/example.png", alt: "Packaging design" },
        caption: "PackRight Studios",
        title: "Sustainable Packaging",
        slug: "sustainable-packaging",
        category: "Design",
        tags: ["Packaging", "Eco-friendly", "Product Design"],
    },
    {
        id: "17",
        image: { src: "/images/example.png", alt: "Handcrafted wooden toys" },
        caption: "Timber Toys",
        title: "Children's Wood Collection",
        slug: "childrens-wood-collection",
        category: "Handcrafted",
        tags: ["Toys", "Children", "Sustainable"],
    },
    {
        id: "18",
        image: { src: "/images/example.png", alt: "Wedding photography" },
        caption: "Eternal Moments",
        title: "Wedding Portfolio",
        slug: "wedding-portfolio",
        category: "Photography",
        tags: ["Wedding", "Events", "Portrait"],
    },
];