import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Container } from "./Container";
import ProjectCard from "./ProjectCard";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
    id: string;
    image: { src: string; alt: string };
    caption?: string;
    title: string;
    slug: string;
    category?: string;
    tags?: string[];
}

interface ProjectsGridProps {
    allProjects: Project[];
    title?: string;
    subtitle?: string;
    categories?: string[];
    defaultTab?: string;
    projectsPerPage?: number;
    currentPath?: string;
    hideTabsOnSubPages?: boolean;
}

export default function ProjectsGrid({
    allProjects = [],
    title = "Our Projects",
    subtitle = "Check out what we've been working on",
    categories = ["All", "Photography", "Design", "Development", "Handcrafted"],
    defaultTab = "All",
    projectsPerPage = 10,
    currentPath = "",
    hideTabsOnSubPages = false
}: ProjectsGridProps) {
    // Determine if we're on a category page
    const isSubPage = currentPath.includes('/projects/') && currentPath !== '/projects/';
    const pathSegments = currentPath.split('/').filter(Boolean);
    const currentCategory = pathSegments.length > 1 ? pathSegments[1] : null;

    // Set initial active tab based on path or default
    const initialTab = currentCategory ?
        categories.find(cat => cat.toLowerCase() === currentCategory.toLowerCase()) || defaultTab :
        defaultTab;

    const [activeTab, setActiveTab] = useState(initialTab);
    const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Filter projects based on active tab
    const getFilteredProjects = useCallback((category: string): Project[] => {
        if (category === "All") return allProjects;
        return allProjects.filter(project =>
            project.category?.toLowerCase() === category.toLowerCase()
        );
    }, [allProjects]);

    // Update visible projects when tab changes or page changes
    useEffect(() => {
        const filtered = getFilteredProjects(activeTab);
        const startIndex = 0;
        const endIndex = page * projectsPerPage;

        setVisibleProjects(filtered.slice(startIndex, endIndex));
        setHasMore(filtered.length > endIndex);
    }, [activeTab, page, projectsPerPage, getFilteredProjects]);

    // Handle tab change - could update URL in a client-side router
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setPage(1); // Reset to first page when changing tabs

        // Optional: Navigate to the category page if we're on the main projects page
        if (currentPath === '/projects/' || currentPath === '/projects') {
            if (value !== 'All') {
                window.location.href = `/projects/${value.toLowerCase()}`;
            }
        }
    };

    // Load more projects
    const loadMore = () => {
        setLoading(true);

        setTimeout(() => {
            setPage(prevPage => prevPage + 1);
            setLoading(false);
        }, 500); // Small delay for better UX
    };

    // Determine whether to show tabs based on props and current path
    const showTabs = !(hideTabsOnSubPages && isSubPage);

    return (
        <section className="w-full py-24">
            <Container>
                <motion.div
                    className="text-left mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-4">{title}</h2>
                    <p className="text-2xl md:text-4xl text-muted-foreground">{subtitle}</p>
                </motion.div>

                {showTabs && (
                    <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="mb-8">
                            {categories.map(category => (
                                <TabsTrigger key={category} value={category} className="px-4 py-2">
                                    {category}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="relative">
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                layout
                            >
                                <AnimatePresence initial={false}>
                                    {visibleProjects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                opacity: { duration: 0.3 },
                                                layout: {
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30
                                                }
                                            }}
                                        >
                                            <ProjectCard
                                                title={project.title}
                                                imageUrl={project.image.src}
                                                href={project.slug} // Pass just the slug, not the full path
                                                category={project.category}
                                                tags={project.tags || []}
                                                aspectRatio="square"
                                                showCategory={!isSubPage}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {visibleProjects.length === 0 && (
                                    <motion.div
                                        className="col-span-full min-h-[300px] flex items-center justify-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <p className="text-muted-foreground">No projects in this category</p>
                                    </motion.div>
                                )}
                            </motion.div>

                            {hasMore && (
                                <motion.div
                                    className="flex justify-center mt-12"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="min-w-[200px]"
                                    >
                                        {loading ? "Loading..." : "Load More"}
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </Tabs>
                )}

                {!showTabs && (
                    <div>
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            layout
                        >
                            <AnimatePresence initial={false}>
                                {visibleProjects.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            opacity: { duration: 0.3 },
                                            layout: {
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 30
                                            }
                                        }}
                                    >
                                        <ProjectCard
                                            title={project.title}
                                            imageUrl={project.image.src}
                                            href={project.slug} // Pass just the slug, not the full path
                                            category={project.category}
                                            tags={project.tags || []}
                                            aspectRatio="square"
                                            showCategory={!isSubPage}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {visibleProjects.length === 0 && (
                                <motion.div
                                    className="col-span-full min-h-[300px] flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className="text-muted-foreground">No projects in this category</p>
                                </motion.div>
                            )}
                        </motion.div>

                        {hasMore && (
                            <motion.div
                                className="flex justify-center mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="min-w-[200px]"
                                >
                                    {loading ? "Loading..." : "Load More"}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                )}
            </Container>
        </section>
    );
}