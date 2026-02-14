import { ThemeToggle } from "@/components/globals/ThemeToggle";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/shad-ui/navigation-menu";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/shad-ui/sheet";
import { cn } from "@/lib/utils";
import {
	ChevronRight,
	GalleryVerticalEnd,
	Home,
	Menu,
	User,
	X,
} from "lucide-react";
import { useState } from "react";

type NavbarProps = {
	title: string;
	href?: string;
	description?: string;
	main?: boolean;
	children?: NavbarProps[];
};

export const Navbar = () => {
	const navigationLinks: NavbarProps[] = [
		{
			title: "Home",
			href: "/",
		},
		{
			title: "Gallery",
			href: "/gallery",
		},
		{
			title: "About",
			href: "/about",
		},
	];

	const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
		{},
	);

	// Toggle dropdown state for mobile
	const toggleDropdown = (title: string) => {
		setOpenDropdowns((prev) => ({
			...prev,
			[title]: !prev[title],
		}));
	};

	return (
		<header className="bg-background/50 container mx-auto w-full px-4 lg:px-6 h-14 sticky top-4 right-0 left-0 z-50 border shadow-sm backdrop-blur-sm">
			<div className="w-full h-full  flex items-center justify-between">
				{/* Logo always visible */}
				<div className="flex items-center">
					<a href="/" className="flex items-center">
						<span className="font-bold text-lg">Simon Bremner</span>
						
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
														<li
															key={child.title}
															className={
																child?.main === true
																	? "col-span-2"
																	: "col-span-1"
															}
														>
															<NavigationMenuLink asChild>
																<a
																	href={child.href}
																	className={cn(
																		"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
																	)}
																>
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
										<div key={link.title}>
											{link.children ? (
												<>
													<button
														type="button"
														onClick={() => toggleDropdown(link.title)}
														className="flex items-center justify-between w-full p-4 text-foreground hover:bg-muted"
													>
														<div className="flex items-center gap-3">
															<span>{link.title}</span>
														</div>
														<ChevronRight
															className={`h-4 w-4 transition-transform ${openDropdowns[link.title] ? "rotate-90" : ""}`}
														/>
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
