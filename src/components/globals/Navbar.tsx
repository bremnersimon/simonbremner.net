import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/globals/ThemeToggle";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, Home, User, Briefcase, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export const Navbar = () => {
    // Projects data for reuse
    const projects = [
        {
            title: "Photography",
            href: "/projects/photography",
            description: "Explore photography projects",
        },
        {
            title: "Design",
            href: "/projects/design",
            description: "Explore design projects",
        },
        {
            title: "Development",
            href: "/projects/development",
            description: "Explore development projects",
        },
        {
            title: "Handcrafted",
            href: "/projects/handcrafted",
            description: "Explore handcrafted projects",
        },
    ];

    // State to manage mobile project submenu
    const [projectsOpen, setProjectsOpen] = useState(false);

    return (
        <header
            className="w-full px-4 lg:px-6 h-14 flex items-center justify-between fixed top-0 right-0 left-0 z-50 bg-background/10 border-b shadow-sm backdrop-blur-sm"
        >
            {/* Logo always visible */}
            <div className="flex items-center">
                <a href="/" className="flex items-center">
                    <img src="/images/icon.svg" width={32} height={32} alt="Logo" />
                </a>
            </div>

            {/* Desktop Navigation - hidden on mobile */}
            <div className="hidden md:flex">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {projects.map((project, index) => (
                                        <li key={project.title + index} className="row-span-1">
                                            <NavigationMenuLink asChild>
                                                <a
                                                    href={project.href}
                                                    className={cn(
                                                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                    )}
                                                >
                                                    <div className="text-sm font-medium leading-none">
                                                        {project.title}
                                                    </div>
                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                        {project.description}
                                                    </p>
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink
                                href="/about"
                                className={navigationMenuTriggerStyle()}
                            >
                                About
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Right side controls (theme toggle + mobile menu) */}
            <div className="flex items-center gap-2">
                <ThemeToggle />

                {/* Mobile Menu (Sheet from shadcn/ui) */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" aria-label="Menu">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-xs p-0">
                        <div className="flex flex-col h-full">
                            {/* Header with close button */}
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-lg font-semibold">Menu</h2>
                                <div className="flex items-center gap-2">
                                    <ThemeToggle />
                                    <SheetClose className="rounded-full h-8 w-8 flex items-center flex flex-col items-center justify-center">
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Close</span>
                                    </SheetClose>
                                </div>
                            </div>

                            {/* Main mobile navigation */}
                            <nav className="flex flex-col divide-y">
                                <SheetClose asChild>
                                    <a
                                        href="/"
                                        className="flex items-center gap-3 p-4 text-foreground hover:bg-muted transition-colors"
                                    >
                                        <Home className="h-5 w-5" />
                                        <span>Home</span>
                                    </a>
                                </SheetClose>

                                {/* Projects menu with collapsible submenu */}
                                <div>
                                    <button
                                        onClick={() => setProjectsOpen(!projectsOpen)}
                                        className="flex items-center justify-between w-full p-4 text-foreground hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="h-5 w-5" />
                                            <span>Projects</span>
                                        </div>
                                        <ChevronRight className={`h-4 w-4 transition-transform ${projectsOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {/* Collapsible projects submenu */}
                                    {projectsOpen && (
                                        <div className="bg-muted/40 pl-4">
                                            {projects.map((project, index) => (
                                                <SheetClose key={project.title + index} asChild>
                                                    <a
                                                        href={project.href}
                                                        className="flex items-center gap-2 p-3 pl-8 text-sm text-foreground hover:bg-muted transition-colors"
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-foreground/70"></span>
                                                        {project.title}
                                                    </a>
                                                </SheetClose>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <SheetClose asChild>
                                    <a
                                        href="/about"
                                        className="flex items-center gap-3 p-4 text-foreground hover:bg-muted transition-colors"
                                    >
                                        <User className="h-5 w-5" />
                                        <span>About</span>
                                    </a>
                                </SheetClose>

                            </nav>

                            {/* Footer */}
                            <div className="mt-auto p-4 border-t">
                                <p className="text-sm text-muted-foreground text-center">
                                    © 2025 Your Company
                                </p>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
};