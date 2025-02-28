import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Container } from "./Container";
import type { ProjectCardProps } from "@/types";
import { urlForImage } from "@/lib/sanity";

interface PostSliderProps {
    featuredProjects: ProjectCardProps[];
    title?: string;
    subtitle?: string;
    categories?: string[];
    defaultTab?: string;
    lazyLoad?: boolean;
}

// Single carousel component to avoid hook issues
const PostCarousel = ({ projects }: { projects: ProjectCardProps[] }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps",
    });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    // Convert Sanity posts to the ProjectsGrid format
    const convertedProjects = projects.map((post) => ({
        _id: post._id,
        title: post.title,
        slug: post.slug,
        mainImage: {
            src: post.mainImage
                ? urlForImage(post.mainImage).url()
                : "/images/placeholder.jpg",
            alt: post.title,
        },
        category: post.category,
        caption: post.caption,
        tags: post.tags || [],
        publishedAt: post.publishedAt,
    }));

    return (
        <div className="relative mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6">
                    {convertedProjects?.map((project) => (
                        <div
                            key={project._id}
                            className="flex-[0_0_280px] sm:flex-[0_0_350px] md:flex-[0_0_400px] min-w-0"
                        >
                            <ProjectCard
                                _id={project._id}
                                title={project.title}
                                mainImage={project.mainImage}
                                slug={project.slug}
                                category={project.category}
                                tags={project.tags}
                                aspectRatio="square"
                            />
                        </div>
                    ))}
                    {projects?.length === 0 && (
                        <div className="flex-1 min-h-[300px] flex items-center justify-center">
                            <p className="text-muted-foreground">No projects in this category</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
                <Button variant="outline" size="icon" onClick={scrollPrev} disabled={!prevBtnEnabled}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={scrollNext} disabled={!nextBtnEnabled}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default function TabbedPostSlider({
    featuredProjects,
    title = "Reputation is everything.",
    subtitle = "Ours is flawless.",
    categories = ["All", "Photography", "Design", "Development", "Handcrafted"],
    defaultTab = "All",
    lazyLoad = true,
}: PostSliderProps) {
    const [loadedTabs, setLoadedTabs] = useState<string[]>([defaultTab]);

    // Handle tab change
    const handleTabChange = (value: string) => {
        // If tab hasn't been loaded and lazyLoad is enabled, add it to loaded tabs
        if (lazyLoad && !loadedTabs.includes(value)) {
            setLoadedTabs(prev => [...prev, value]);
        }
    };

    // Filter projects based on active tab
    const getFilteredProjects = (category: string): ProjectCardProps[] => {
        if (!featuredProjects) return [];

        if (category === "All") {
            return featuredProjects;
        }

        return featuredProjects.filter(project =>
            project.category && project.category.toLowerCase() === category.toLowerCase()
        );
    };

    return (
        <section className="w-full py-24">
            <Container>
                <div className="text-left mb-12">
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">{title}</h2>
                    <p className="text-2xl md:text-4xl text-muted-foreground">{subtitle}</p>
                </div>

                <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="mb-8">
                        {categories.map(category => (
                            <TabsTrigger key={category} value={category} className="px-4 py-2">
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {categories.map(category => (
                        <TabsContent key={category} value={category} className="mt-0">
                            {(!lazyLoad || loadedTabs.includes(category)) && (
                                <PostCarousel projects={getFilteredProjects(category)} />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </Container>
        </section>
    );
}