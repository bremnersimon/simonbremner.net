import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    // Ref to track if our component has initialized
    const initialized = useRef(false);
    // Observer to watch for body style changes
    const observer = useRef<MutationObserver | null>(null);

    // Initialize theme from localStorage
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (storedTheme) {
            setTheme(storedTheme);
            if (storedTheme === "dark" || (storedTheme === "system" && prefersDark)) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else if (prefersDark) {
            document.documentElement.classList.add("dark");
        }

        initialized.current = true;
    }, []);

    // Setup mutation observer to prevent unwanted body styles
    useEffect(() => {
        if (!initialized.current) return;

        // Create mutation observer to watch for style changes
        observer.current = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'style' &&
                    mutation.target === document.body
                ) {
                    const style = document.body.style;

                    // If unwanted styles are detected, remove them
                    if (style.overflowY === 'scroll' || style.pointerEvents === 'none') {
                        // Remove padding-right
                        style.paddingRight = '';
                        // Remove overflow-y
                        style.overflowY = '';
                        // Remove pointer-events
                        style.pointerEvents = '';
                    }
                }
            });
        });

        // Start observing body element for attribute changes
        observer.current.observe(document.body, {
            attributes: true,
            attributeFilter: ['style']
        });

        // Cleanup observer on component unmount
        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [initialized.current]);

    // Handle system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        function handleChange() {
            if (theme === "system") {
                updateTheme("system");
            }
        }

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    function updateTheme(newTheme: "light" | "dark" | "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        localStorage.setItem("theme", newTheme);

        if (newTheme === "dark" || (newTheme === "system" && prefersDark)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        setTheme(newTheme);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-transparent">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={() => updateTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}