import { ThemeToggle } from "@/components/globals/ThemeToggle";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
	Briefcase,
	Camera,
	ChevronRight,
	Code,
	GalleryVerticalEnd,
	Home,
	Menu,
	Paintbrush,
	Scissors,
	User,
	Wrench,
	X,
} from "lucide-react";
import { useState } from "react";

type NavbarProps = {
	title: string;
	icon: React.ReactNode;
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
		<header className="bg-background w-full px-4 lg:px-6 h-14 sticky top-0 right-0 left-0 z-50 border-b shadow-sm">
			<div className="w-full h-full container mx-auto  flex items-center justify-between">
				{/* Logo always visible */}
				<div className="flex items-center">
					<a href="/" className="flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							version="1.1"
							viewBox="0 0 200 200"
							width="32"
							height="32"
						>
							<title>Simonbremner.net Logo</title>
							<path
								style={{ fill: "#ea580c" }}
								d="M100,13.1l75.3,43.5v86.9l-75.3,43.5-75.3-43.5V56.5L100,13.1M100,1.5L14.7,50.8v98.5l85.3,49.2,85.3-49.2V50.8L100,1.5h0Z"
							/>
							<g>
								<path
									style={{ fill: "#ea580c" }}
									d="M55.1,113.7c4.4,4.9,10.5,8.3,19.1,8.3s13.9-3.4,13.9-9.4-2.8-6-6.4-7.3c-5.4-1.9-12.8-2.7-19.5-5.4-6.7-2.7-11.2-6.6-11.2-14.1s8.3-17.6,22.9-17.6,19.7,5.1,23.5,9.9l-7.8,6.8c-3.7-3.9-8.8-6.8-16.2-6.8s-11.5,2.7-11.5,7.1,2.4,5,5.5,6.2c5.3,2.1,13.5,2.7,19.9,5.2c6.5,2.5,11.7,7,11.7,15.8,0,12.7-10.7,19.3-25.5,19.3s-21.7-4.9-26.7-11.2l8.4-6.8h0Z"
								/>
								<path
									style={{ fill: "#ea580c" }}
									d="M132.3,68.8c11.2,0,18.8,5.8,18.8,16.7s-2.3,10.5-7,13c5.6,2.4,9.2,7.1,9.2,14.8,0,11.2-7.6,17.7-21,17.7h-27.5v-62.3h27.5ZM115.8,94.7h16.8c4.4,0,8-2.8,8-8.1s-3.3-7.7-8-7.7h-16.8s0,15.8,0,15.8ZM115.8,121h16.5c7,0,10.4-3,10.4-8.4s-4.3-8.7-11.4-8.7h-15.5v17.1h0Z"
								/>
							</g>
						</svg>
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
															{link.icon && link.icon}
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
