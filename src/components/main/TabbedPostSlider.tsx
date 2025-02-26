import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Container } from "./Container";

interface Post {
    id: string;
    image: { src: string; alt: string };
    caption?: string;
    title: string;
    slug: string;
    category?: string;
}

interface PostSliderProps {
    allPosts: Post[];
    title?: string;
    subtitle?: string;
    categories?: string[];
    defaultTab?: string;
    lazyLoad?: boolean;
}

// Single carousel component to avoid hook issues
const PostCarousel = ({ posts }: { posts: Post[] }) => {
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

    return (
        <div className="relative mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="flex-[0_0_280px] sm:flex-[0_0_350px] md:flex-[0_0_400px] min-w-0"
                        >
                            <ProjectCard
                                title={post.title}
                                imageUrl={post.image.src}
                                href={`/posts/${post.slug}`}
                                aspectRatio="square"
                            />
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="flex-1 min-h-[300px] flex items-center justify-center">
                            <p className="text-muted-foreground">No posts in this category</p>
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
    allPosts,
    title = "Reputation is everything.",
    subtitle = "Ours is flawless.",
    categories = ["All", "Photography", "Design", "Development", "Handcrafted"],
    defaultTab = "All",
    lazyLoad = true,
}: PostSliderProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [loadedTabs, setLoadedTabs] = useState<string[]>([defaultTab]);

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);

        // If tab hasn't been loaded and lazyLoad is enabled, add it to loaded tabs
        if (lazyLoad && !loadedTabs.includes(value)) {
            setLoadedTabs(prev => [...prev, value]);
        }
    };

    // Filter posts based on active tab
    const getFilteredPosts = (category: string): Post[] => {
        if (category === "All") return allPosts;
        return allPosts.filter(post => post.category === category);
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
                                <PostCarousel posts={getFilteredPosts(category)} />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </Container>
        </section>
    );
}