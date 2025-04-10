import { Button } from "@/components/ui/button";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	// Initialize with a default value that will be updated after mount
	const [theme, setTheme] = useState<"light" | "dark">("light");
	// Add a mounting state to track if we're in the browser
	const [mounted, setMounted] = useState(false);

	// This useEffect runs once after component mount
	useEffect(() => {
		// Once mounted, we can safely access the document
		setMounted(true);

		const storedTheme = localStorage.getItem("theme") as
			| "light"
			| "dark"
			| null;
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;

		// Determine the current theme
		const currentTheme = document.documentElement.classList.contains("dark")
			? "dark"
			: storedTheme === "dark" || (!storedTheme && prefersDark)
				? "dark"
				: "light";

		// Update state to match the current theme
		setTheme(currentTheme);
	}, []);

	// Toggle function that works with client-side routing
	function toggleTheme() {
		const newTheme = theme === "light" ? "dark" : "light";

		// Update localStorage
		localStorage.setItem("theme", newTheme);

		// Update DOM
		if (newTheme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Update state
		setTheme(newTheme);
	}

	// Avoid hydration mismatch by rendering nothing until mounted
	if (!mounted) {
		return (
			<Button variant="ghost" size="icon">
				{/* Placeholder for pre-hydration */}
				<SunMoon className="h-[1.2rem] w-[1.2rem]" />
			</Button>
		);
	}

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
		</Button>
	);
}
