import { ThemeToggle } from "@/components/globals/ThemeToggle";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/shad-ui/navigation-menu";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/shad-ui/sheet";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../shad-ui/button";

type NavbarProps = {
	title: string;
	href: string;
};

function isLinkActive(pathname: string, href: string) {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export const Navbar = () => {
	const navigationLinks: NavbarProps[] = [
		{
			title: "Gallery",
			href: "/",
		},
		{
			title: "Portfolio",
			href: "/portfolio",
		},
		{
			title: "About",
			href: "/about",
		},
	];

	// Navbar is a persisted island (transition:persist), so it isn't
	// remounted on client-side navigation; re-read the path after each swap.
	const [currentPath, setCurrentPath] = useState("");

	useEffect(() => {
		const updatePath = () => setCurrentPath(window.location.pathname);
		updatePath();
		document.addEventListener("astro:page-load", updatePath);
		return () => document.removeEventListener("astro:page-load", updatePath);
	}, []);

	return (
		<header className="bg-background fixed top-0 right-0 left-0 z-20 w-full">
			<div className="container mx-auto flex h-14 w-full items-center justify-between px-4 lg:px-6">
				{/* Logo always visible */}
				<div className="flex items-center">
					<a href="/" className="text-2xl font-thin">
						Simon Bremner
					</a>
				</div>

				{/* Right side controls (nav links + theme toggle + mobile menu) */}
				<div className="flex items-center gap-2">
					{/* Desktop Navigation - hidden on mobile */}
					<div className="hidden md:flex">
						<NavigationMenu>
							<NavigationMenuList>
								{navigationLinks.map((link) => (
									<NavigationMenuItem key={link.title}>
										<NavigationMenuLink
											href={link.href}
											active={isLinkActive(currentPath, link.href)}
											className="bg-transparent hover:bg-transparent focus:bg-transparent relative flex h-10 w-max items-center justify-center rounded-none px-4 py-2 text-sm font-medium after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-foreground after:opacity-0 after:transition-opacity hover:after:opacity-100 data-[active]:after:opacity-100"
										>
											{link.title}
										</NavigationMenuLink>
									</NavigationMenuItem>
								))}
							</NavigationMenuList>
						</NavigationMenu>
					</div>
					<ThemeToggle />

					{/* Mobile Menu (Sheet from shadcn/ui) */}
					<Sheet>
						<SheetTrigger className="md:hidden" aria-label="Open mobile menu">
							<Menu className="h-6 w-6" />
						</SheetTrigger>
						<SheetContent side="right" className="w-full max-w-xs p-0">
							<div className="flex flex-col h-full">
								{/* Header with close button */}
								<div className="flex justify-between items-center p-4 border-b">
									<h2 className="text-lg font-semibold">Simon Bremner</h2>
									<div className="flex items-center gap-2">
										<SheetClose
											aria-label="Close mobile menu"
											className="rounded-full h-8 w-8 flex items-center justify-center bg-transparent"
										>
											<X className="h-6 w-6" />
										</SheetClose>
									</div>
								</div>

								{/* Main mobile navigation */}
								<nav className="flex flex-col divide-y">
									{navigationLinks.map((link) => (
										<SheetClose key={link.title} asChild>
											<a
												href={link.href}
												className="flex items-center gap-3 p-4 text-foreground hover:bg-muted"
											>
												<span>{link.title}</span>
											</a>
										</SheetClose>
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
