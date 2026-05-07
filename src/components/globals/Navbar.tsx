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
import { Button } from "../shad-ui/button";

type NavbarProps = {
	title: string;
	href: string;
};

export const Navbar = () => {
	const navigationLinks: NavbarProps[] = [
		{
			title: "Gallery",
			href: "/",
		},
		{
			title: "About",
			href: "/about",
		},
	];

	return (
		<header className="bg-background fixed top-0 right-0 left-0 z-20 w-full">
			<div className="container mx-auto flex h-14 w-full items-center justify-between px-4 lg:px-6">
				{/* Logo always visible */}
				<div className="flex items-center">
					<a href="/" className="text-2xl font-thin">
						Simon Bremner
					</a>
				</div>

				{/* Desktop Navigation - hidden on mobile */}
				<div className="hidden md:flex">
					<NavigationMenu>
						<NavigationMenuList>
							{navigationLinks.map((link) => (
								<NavigationMenuItem key={link.title}>
									<NavigationMenuLink
										href={link.href}
										className="bg-transparent hover:bg-transparent flex h-10 w-max items-center justify-center rounded-none hover:border-b hover:border-foreground focus:bg-transparent px-4 py-2 text-sm font-medium"
									>
										{link.title}
									</NavigationMenuLink>
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
