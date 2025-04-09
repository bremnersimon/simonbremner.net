import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/globals/ThemeToggle";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, Home, User, Briefcase, Camera, Paintbrush, Code, Scissors, GalleryVerticalEnd, Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

type NavbarProps = {
    title: string;
    icon: React.ReactNode;
    href?: string;
    description?: string;
    main?: boolean;
    children?: NavbarProps[];
}

export const Navbar = () => {
    const navigationLinks: NavbarProps[] = [
        {
            title: "Home",
            href: "/",
            icon: <Home />,
        },
        {
            title: "Projects",
            icon: <Briefcase />,
            children: [
                {
                    title: "Photography",
                    href: "/projects/photography",
                    description: "Visual storytelling through my personal lens.",
                    icon: <Camera />,
                },
                {
                    title: "Design",
                    href: "/projects/design",
                    description: "Functional and beautiful design solutions.",
                    icon: <Paintbrush />,
                },
                {
                    title: "Development",
                    href: "/projects/development",
                    description: "Creating interactive and responsive web applications.",
                    icon: <Code />,
                },
                {
                    title: "Handcrafted",
                    href: "/projects/handcrafted",
                    description: "Creating unique items by hand.",
                    icon: <Scissors />,
                },
            ],
        },
        {
            title: "About",
            href: "/about",
            icon: <User />,
        },
    ];

    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    // Toggle dropdown state for mobile
    const toggleDropdown = (title: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    return (
        <header
            className="bg-background w-full px-4 lg:px-6 h-14 fixed top-0 right-0 left-0 z-50 border-b shadow-sm"
        >
            <div className="w-full h-full container mx-auto  flex items-center justify-between">
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
                            {navigationLinks.map((link) => (
                                <NavigationMenuItem key={link.title}>
                                    {link.children ? (
                                        <>
                                            <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                                                {link.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                    {link.children?.map((child) => (
                                                        <li key={child.title} className={child?.main === true ? "col-span-2" : "col-span-1"}>
                                                            <NavigationMenuLink asChild>
                                                                <a
                                                                    href={child.href}
                                                                    className={cn(
                                                                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                                                    )}
                                                                >
                                                                    <div className="text-sm font-medium leading-none flex items-center gap-2">
                                                                        {child.icon && child.icon}
                                                                        {child.title}
                                                                    </div>
                                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                                        {child.description}
                                                                    </p>
                                                                </a>
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    ) : (
                                        <NavigationMenuLink
                                            href={link.href}
                                            className="bg-transparent hover:bg-accent/50 flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
                                        >
                                            {link.title}
                                        </NavigationMenuLink>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Right side controls (theme toggle + mobile menu) */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* Mobile Menu (Sheet from shadcn/ui) */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="bg-transparent">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full max-w-xs p-0">
                            <div className="flex flex-col h-full">
                                {/* Header with close button */}
                                <div className="flex justify-between items-center p-4 border-b">
                                    <h2 className="text-lg font-semibold">Simon Bremner</h2>
                                    <div className="flex items-center gap-2">
                                        <SheetClose className="rounded-full h-8 w-8 flex items-center justify-center bg-transparent">
                                            <X className="h-6 w-6" />
                                            <span className="sr-only">Close</span>
                                        </SheetClose>
                                    </div>
                                </div>

                                {/* Main mobile navigation */}
                                <nav className="flex flex-col divide-y">
                                    {navigationLinks.map((link) => (
                                        <div key={link.title}>
                                            {link.children ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleDropdown(link.title)}
                                                        className="flex items-center justify-between w-full p-4 text-foreground hover:bg-muted"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {link.icon && link.icon}
                                                            <span>{link.title}</span>
                                                        </div>
                                                        <ChevronRight className={`h-4 w-4 transition-transform ${openDropdowns[link.title] ? 'rotate-90' : ''}`} />
                                                    </button>

                                                    {/* Collapsible submenu */}
                                                    {openDropdowns[link.title] && (
                                                        <div className="bg-muted/40 pl-4">
                                                            {link.children.map((child, childIndex) => (
                                                                <SheetClose key={child.title} asChild>
                                                                    <a
                                                                        href={child.href}
                                                                        className="flex items-center gap-2 p-3 pl-8 text-sm text-foreground hover:bg-muted"
                                                                    >
                                                                        {child.icon && child.icon}
                                                                        {child.title}
                                                                    </a>
                                                                </SheetClose>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <SheetClose asChild>
                                                    <a
                                                        href={link.href}
                                                        className="flex items-center gap-3 p-4 text-foreground hover:bg-muted"
                                                    >
                                                        {link.icon && link.icon}
                                                        <span>{link.title}</span>
                                                    </a>
                                                </SheetClose>
                                            )}
                                        </div>
                                    ))}
                                </nav>

                                {/* Footer */}
                                <div className="mt-auto p-4 border-t">
                                    <p className="text-sm text-muted-foreground text-center">
                                        © {new Date().getFullYear()} Simon Bremner
                                    </p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};