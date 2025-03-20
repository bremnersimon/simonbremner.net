import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Copy, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';

interface ColorHSL {
    format: 'hsl';
    values: { h: number; s: number; l: number };
}

interface ColorOKLCH {
    format: 'oklch';
    values: { l: number; c: number; h: number };
}

type ColorData = ColorHSL | ColorOKLCH;
type ThemeData = Record<string, ColorData>;
type ThemeValues = { light: ThemeData; dark: ThemeData };

interface HSLColor {
    h: number;
    s: number;
    l: number;
}

// Variable groups for UI organization
const variableGroups = {
    'Base': ['background', 'foreground'],
    'Card': ['card', 'card-foreground'],
    'Popover': ['popover', 'popover-foreground'],
    'Primary': ['primary', 'primary-foreground'],
    'Secondary': ['secondary', 'secondary-foreground'],
    'Muted': ['muted', 'muted-foreground'],
    'Accent': ['accent', 'accent-foreground'],
    'Destructive': ['destructive', 'destructive-foreground'],
    'Elements': ['border', 'input', 'ring'],
    'Charts': ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
};

// Initial theme values 
const initialThemes = {
    light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.145 0 0)',
        primary: '24.6 95% 53.1%',
        'primary-foreground': '60 9.1% 97.8%',
        secondary: '60 4.8% 95.9%',
        'secondary-foreground': '24 9.8% 10%',
        muted: '60 4.8% 95.9%',
        'muted-foreground': '25 5.3% 44.7%',
        accent: '60 4.8% 95.9%',
        'accent-foreground': '24 9.8% 10%',
        destructive: '0 84.2% 60.2%',
        'destructive-foreground': '60 9.1% 97.8%',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: '24.6 95% 53.1%',
        'chart-1': '12 76% 61%',
        'chart-2': '173 58% 39%',
        'chart-3': '197 37% 24%',
        'chart-4': '43 74% 66%',
        'chart-5': '27 87% 67%',
    },
    dark: {
        background: 'oklch(0.145 0 0)',
        foreground: 'oklch(0.985 0 0)',
        card: 'oklch(0.145 0 0)',
        'card-foreground': 'oklch(0.985 0 0)',
        popover: 'oklch(0.145 0 0)',
        'popover-foreground': 'oklch(0.985 0 0)',
        primary: '20.5 90.2% 48.2%',
        'primary-foreground': '60 9.1% 97.8%',
        secondary: '12 6.5% 15.1%',
        'secondary-foreground': '60 9.1% 97.8%',
        muted: '12 6.5% 15.1%',
        'muted-foreground': '24 5.4% 63.9%',
        accent: '12 6.5% 15.1%',
        'accent-foreground': '60 9.1% 97.8%',
        destructive: '0 72.2% 50.6%',
        'destructive-foreground': '60 9.1% 97.8%',
        border: 'oklch(0.269 0 0)',
        input: 'oklch(0.269 0 0)',
        ring: '20.5 90.2% 48.2%',
        'chart-1': '220 70% 50%',
        'chart-2': '160 60% 45%',
        'chart-3': '30 80% 55%',
        'chart-4': '280 65% 60%',
        'chart-5': '340 75% 55%',
    }
};


// HSL to OKLCH conversion function
const hslToOklch = (h: number, s: number, l: number): string => {
    // Convert h to radians for OKLCH hue
    const hueRadians = (h % 360) * Math.PI / 180;

    // Map saturation to chroma (0-0.4 range is visually similar)
    const chroma = Math.min(0.4, (s / 100) * 0.4);

    // Map lightness directly (0-1 range)
    const lightness = l / 100;

    return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hueRadians.toFixed(3)})`;
};

// Color manipulation utilities
const adjustLightness = (color: HSLColor, amount: number): HSLColor => {
    return {
        ...color,
        l: Math.max(0, Math.min(100, color.l + amount))
    };
};

const adjustSaturation = (color: HSLColor, amount: number): HSLColor => {
    return {
        ...color,
        s: Math.max(0, Math.min(100, color.s + amount))
    };
};

const shiftHue = (color: HSLColor, amount: number): HSLColor => {
    return {
        ...color,
        h: (color.h + amount) % 360
    };
};

// Get accessible foreground color based on WCAG contrast
const getAccessibleForeground = (color: HSLColor): HSLColor => {
    // Simple contrast algorithm - for real implementation use more sophisticated contrast calculation
    return color.l > 60
        ? { h: color.h, s: color.s * 0.2, l: 10 }  // Dark text on light backgrounds
        : { h: color.h, s: color.s * 0.1, l: 95 }; // Light text on dark backgrounds
};

const initialTheme = {
    light: {
        primary: { h: 24.6, s: 95, l: 53.1 },
        secondary: { h: 60, s: 4.8, l: 95.9 },
        background: { h: 0, s: 0, l: 100 }
    },
    dark: {
        primary: { h: 20.5, s: 90.2, l: 48.2 },
        secondary: { h: 12, s: 6.5, l: 15.1 },
        background: { h: 0, s: 0, l: 14.5 }
    }
};



const ThemeEditor = () => {
    // State for active theme tab (light/dark)
    const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');

    // Base colors for derivative system
    const [baseColors, setBaseColors] = useState(initialTheme);

    // State for theme values (colors in HSL format)
    const [themeValues, setThemeValues] = useState<ThemeValues>({ light: {}, dark: {} });

    // State for dialog and UI
    const [exportedTheme, setExportedTheme] = useState('');
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);


    // Generate derived colors from base colors
    const generateDerivedColors = useCallback((
        baseColor: HSLColor,
        secondaryColor: HSLColor,
        backgroundColor: HSLColor,
        isDark: boolean
    ): ThemeData => {
        // Get primary and variants
        const primary: ColorHSL = {
            format: 'hsl',
            values: baseColor
        };

        const primaryForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(baseColor)
        };

        // Get secondary and variants
        const secondary: ColorHSL = {
            format: 'hsl',
            values: secondaryColor
        };

        const secondaryForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(secondaryColor)
        };

        // Background and foreground
        const background: ColorHSL = {
            format: 'hsl',
            values: backgroundColor
        };

        const foreground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(backgroundColor)
        };

        // Card (slight variant of background)
        const card: ColorHSL = {
            format: 'hsl',
            values: backgroundColor
        };

        const cardForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(backgroundColor)
        };

        // Popover (same as card for simplicity)
        const popover: ColorHSL = {
            format: 'hsl',
            values: backgroundColor
        };

        const popoverForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(backgroundColor)
        };

        // Muted (lower saturation version of secondary)
        const muted: ColorHSL = {
            format: 'hsl',
            values: adjustSaturation(
                adjustLightness(secondaryColor, isDark ? 0 : 0),
                isDark ? 0 : 0
            )
        };

        const mutedForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(muted.values)
        };

        // Accent (analogous to primary)
        const accent: ColorHSL = {
            format: 'hsl',
            values: isDark ? secondaryColor : secondaryColor
        };

        const accentForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(accent.values)
        };

        // Destructive (always red-based)
        const destructive: ColorHSL = {
            format: 'hsl',
            values: { h: 0, s: isDark ? 72.2 : 84.2, l: isDark ? 50.6 : 60.2 }
        };

        const destructiveForeground: ColorHSL = {
            format: 'hsl',
            values: getAccessibleForeground(destructive.values)
        };

        // Border, input, ring
        const border: ColorHSL = {
            format: 'hsl',
            values: adjustSaturation(
                adjustLightness(backgroundColor, isDark ? 15 : -15),
                5
            )
        };

        const input: ColorHSL = {
            format: 'hsl',
            values: border.values
        };

        const ring: ColorHSL = {
            format: 'hsl',
            values: adjustSaturation(baseColor, -20)
        };

        // Chart colors - create a nice range of distinct colors
        const chartBase = baseColor.h;

        const chart1: ColorHSL = {
            format: 'hsl',
            values: isDark
                ? { h: (chartBase + 0) % 360, s: 70, l: 50 }
                : { h: (chartBase + 0) % 360, s: 76, l: 61 }
        };

        const chart2: ColorHSL = {
            format: 'hsl',
            values: isDark
                ? { h: (chartBase + 72) % 360, s: 60, l: 45 }
                : { h: (chartBase + 72) % 360, s: 58, l: 39 }
        };

        const chart3: ColorHSL = {
            format: 'hsl',
            values: isDark
                ? { h: (chartBase + 144) % 360, s: 80, l: 55 }
                : { h: (chartBase + 144) % 360, s: 37, l: 24 }
        };

        const chart4: ColorHSL = {
            format: 'hsl',
            values: isDark
                ? { h: (chartBase + 216) % 360, s: 65, l: 60 }
                : { h: (chartBase + 216) % 360, s: 74, l: 66 }
        };

        const chart5: ColorHSL = {
            format: 'hsl',
            values: isDark
                ? { h: (chartBase + 288) % 360, s: 75, l: 55 }
                : { h: (chartBase + 288) % 360, s: 87, l: 67 }
        };

        return {
            primary,
            'primary-foreground': primaryForeground,
            secondary,
            'secondary-foreground': secondaryForeground,
            background,
            foreground,
            card,
            'card-foreground': cardForeground,
            popover,
            'popover-foreground': popoverForeground,
            muted,
            'muted-foreground': mutedForeground,
            accent,
            'accent-foreground': accentForeground,
            destructive,
            'destructive-foreground': destructiveForeground,
            border,
            input,
            ring,
            'chart-1': chart1,
            'chart-2': chart2,
            'chart-3': chart3,
            'chart-4': chart4,
            'chart-5': chart5,
        };
    }, []);

    // Color conversion utilities
    const hexToHsl = useCallback((hex: string): HSLColor => {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse r, g, b values
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        let l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        // Round values
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        return { h, s, l };
    }, []);

    const hslToHex = useCallback((h: number, s: number, l: number): string => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }, []);

    // Parse color string
    const parseColor = useCallback((colorStr: string): ColorData => {
        if (colorStr.startsWith('oklch')) {
            const values = colorStr.match(/oklch\((.*?)\)/)?.[1]?.split(' ');
            if (values && values.length >= 3) {
                return {
                    format: 'oklch',
                    values: {
                        l: parseFloat(values[0]),
                        c: parseFloat(values[1]),
                        h: parseFloat(values[2])
                    }
                };
            }
        } else if (colorStr.includes(' ')) {
            // Assume HSL format: "H S% L%"
            const parts = colorStr.split(' ');
            if (parts.length >= 3) {
                return {
                    format: 'hsl',
                    values: {
                        h: parseFloat(parts[0]),
                        s: parseFloat(parts[1].replace('%', '')),
                        l: parseFloat(parts[2].replace('%', ''))
                    }
                };
            }
        }

        // Default fallback
        return {
            format: 'hsl',
            values: { h: 0, s: 0, l: 50 }
        };
    }, []);


    const resetToOriginalColors = useCallback(() => {
        // Parse default theme values from initialThemes
        const lightTheme: Record<string, ColorData> = {};
        const darkTheme: Record<string, ColorData> = {};

        Object.entries(initialThemes.light).forEach(([key, value]) => {
            lightTheme[key] = parseColor(value);
        });

        Object.entries(initialThemes.dark).forEach(([key, value]) => {
            darkTheme[key] = parseColor(value);
        });

        // Set the base colors back to original values
        setBaseColors(initialTheme);

        // Also reset the theme values
        setThemeValues({
            light: lightTheme,
            dark: darkTheme
        });
    }, [parseColor]);

    // Initialize theme values
    useEffect(() => {
        // Parse default theme values
        const parsedLightTheme: Record<string, ColorData> = {};
        const parsedDarkTheme: Record<string, ColorData> = {};
        const initialGroupsState: Record<string, boolean> = {};

        // Set initial group states
        Object.keys(variableGroups).forEach(group => {
            initialGroupsState[group] = group === 'Primary' || group === 'Secondary';
        });

        // Generate derived colors
        const lightTheme = generateDerivedColors(
            baseColors.light.primary,
            baseColors.light.secondary,
            baseColors.light.background,
            false
        );

        const darkTheme = generateDerivedColors(
            baseColors.dark.primary,
            baseColors.dark.secondary,
            baseColors.dark.background,
            true
        );

        setThemeValues({
            light: lightTheme,
            dark: darkTheme,
        });
        setOpenGroups(initialGroupsState);
    }, [generateDerivedColors, parseColor]);

    // Create a dynamic style element to update theme variables
    useEffect(() => {
        // Create a style element if it doesn't exist
        let styleElement = document.getElementById('theme-preview-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'theme-preview-styles';
            document.head.appendChild(styleElement);
        }

        // Generate CSS rules for the current theme
        let css = `.theme-preview-container {\n`;

        // Add all current theme variables
        Object.entries(themeValues[activeTheme]).forEach(([key, colorData]) => {
            let colorValue;
            if (colorData.format === 'hsl') {
                const { h, s, l } = colorData.values;
                colorValue = `hsl(${h}, ${s}%, ${l}%)`;
            } else {
                colorValue = `oklch(${colorData.values.l} ${colorData.values.c} ${colorData.values.h})`;
            }

            css += `  --${key}: ${colorValue};\n`;
        });

        css += `}\n`;

        // Update the style element content
        styleElement.textContent = css;

        // Cleanup
        return () => {
            if (styleElement && document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, [activeTheme, themeValues]);

    // Update derived colors when base colors change
    useEffect(() => {
        // Generate derived colors
        const lightTheme = generateDerivedColors(
            baseColors.light.primary,
            baseColors.light.secondary,
            baseColors.light.background,
            false
        );

        const darkTheme = generateDerivedColors(
            baseColors.dark.primary,
            baseColors.dark.secondary,
            baseColors.dark.background,
            true
        );

        setThemeValues({
            light: lightTheme,
            dark: darkTheme,
        });
    }, [baseColors, generateDerivedColors]);

    // Utility functions for UI
    const getColorPreview = useCallback((variable: string): string => {
        if (!themeValues[activeTheme][variable]) return 'hsl(0, 0%, 50%)';

        const colorData = themeValues[activeTheme][variable];
        if (colorData.format === 'hsl') {
            return `hsl(${colorData.values.h}, ${colorData.values.s}%, ${colorData.values.l}%)`;
        } else {
            return `oklch(${colorData.values.l} ${colorData.values.c} ${colorData.values.h})`;
        }
    }, [activeTheme, themeValues]);

    const getHexColor = useCallback((variable: string): string => {
        if (!themeValues[activeTheme][variable]) return '#808080';

        const colorData = themeValues[activeTheme][variable];
        if (colorData.format === 'hsl') {
            const { h, s, l } = colorData.values;
            return hslToHex(h, s, l);
        } else {
            // For OKLCH, just return a medium gray
            return '#808080';
        }
    }, [activeTheme, hslToHex, themeValues]);

    // Handle base color change
    const handleBaseColorChange = useCallback((
        colorType: 'primary' | 'secondary' | 'background',
        colorValue: string
    ) => {
        const hslColor = hexToHsl(colorValue);

        setBaseColors(prev => ({
            ...prev,
            [activeTheme]: {
                ...prev[activeTheme],
                [colorType]: hslColor
            }
        }));
    }, [activeTheme, hexToHsl]);

    // Handle individual color change in advanced mode
    const handleColorChange = useCallback((variable: string, colorString: string) => {
        try {
            let colorData: ColorData;

            if (colorString.startsWith('#')) {
                const { h, s, l } = hexToHsl(colorString);
                colorData = {
                    format: 'hsl',
                    values: { h, s, l }
                };
            } else {
                colorData = parseColor(colorString);
            }

            setThemeValues(prev => ({
                ...prev,
                [activeTheme]: {
                    ...prev[activeTheme],
                    [variable]: colorData
                }
            }));
        } catch (error) {
            console.error('Error parsing color:', error);
        }
    }, [activeTheme, hexToHsl, parseColor]);

    // Toggle a group open/closed
    const toggleGroup = useCallback((group: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    }, []);

    // Generate theme CSS in oklch format
    const generateThemeCSS = useCallback((): string => {
        const generateThemeSection = (theme: 'light' | 'dark') => {
            const prefix = theme === 'light' ? ':root' : '.dark';
            let css = `${prefix} {\n`;

            Object.entries(themeValues[theme]).forEach(([key, colorData]) => {
                let oklchValue;
                if (colorData.format === 'hsl') {
                    const { h, s, l } = colorData.values;
                    oklchValue = hslToOklch(h, s, l);
                } else {
                    oklchValue = `oklch(${colorData.values.l} ${colorData.values.c} ${colorData.values.h})`;
                }
                css += `  --${key}: ${oklchValue};\n`;
            });

            css += `  --radius: 0.5rem;\n}\n`;
            return css;
        };

        return `${generateThemeSection('light')}\n${generateThemeSection('dark')}`;
    }, [themeValues]);

    // Export theme to CSS
    const exportTheme = useCallback(() => {
        setExportedTheme(generateThemeCSS());
    }, [generateThemeCSS]);

    // Copy to clipboard
    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    // Generate theme section for copy buttons
    const getThemeSection = useCallback((theme: 'light' | 'dark'): string => {
        const prefix = theme === 'light' ? ':root' : '.dark';
        let css = `${prefix} {\n`;

        Object.entries(themeValues[theme]).forEach(([key, colorData]) => {
            let oklchValue;
            if (colorData.format === 'hsl') {
                const { h, s, l } = colorData.values;
                oklchValue = hslToOklch(h, s, l);
            } else {
                oklchValue = `oklch(${colorData.values.l} ${colorData.values.c} ${colorData.values.h})`;
            }
            css += `  --${key}: ${oklchValue};\n`;
        });

        css += `  --radius: 0.5rem;\n}`;
        return css;
    }, [themeValues]);

    // Generate analogous color scheme
    const generateAnalogousScheme = useCallback(() => {
        const baseHue = baseColors[activeTheme].primary.h;

        setBaseColors(prev => ({
            ...prev,
            [activeTheme]: {
                ...prev[activeTheme],
                primary: { ...prev[activeTheme].primary },
                secondary: {
                    h: (baseHue + 30) % 360,
                    s: prev[activeTheme].primary.s * 0.8,
                    l: prev[activeTheme].primary.l * (activeTheme === 'light' ? 1.4 : 0.8)
                }
            }
        }));
    }, [activeTheme, baseColors]);

    // Generate complementary color scheme
    const generateComplementaryScheme = useCallback(() => {
        const baseHue = baseColors[activeTheme].primary.h;

        setBaseColors(prev => ({
            ...prev,
            [activeTheme]: {
                ...prev[activeTheme],  // Spread the entire theme object, not just primary
                primary: { ...prev[activeTheme].primary },
                secondary: {
                    h: (baseHue + 180) % 360,
                    s: prev[activeTheme].primary.s * 0.9,
                    l: prev[activeTheme].primary.l * (activeTheme === 'light' ? 1.3 : 0.7)
                }
            }
        }));
    }, [activeTheme, baseColors]);

    // Generate triadic color scheme
    const generateTriadicScheme = useCallback(() => {
        const baseHue = baseColors[activeTheme].primary.h;

        setBaseColors(prev => ({
            ...prev,
            [activeTheme]: {
                ...prev[activeTheme],
                primary: { ...prev[activeTheme].primary },
                secondary: {
                    h: (baseHue + 120) % 360,
                    s: prev[activeTheme].primary.s * 0.85,
                    l: prev[activeTheme].primary.l * (activeTheme === 'light' ? 1.2 : 0.8)
                }
            }
        }));
    }, [activeTheme, baseColors]);

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">Theme Editor</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetToOriginalColors}
                                className="text-xs flex items-center gap-1"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Reset Colors
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button onClick={exportTheme}>Export Theme</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-5xl">
                                    <DialogHeader>
                                        <DialogTitle>Theme CSS</DialogTitle>
                                    </DialogHeader>
                                    <Tabs defaultValue="both" className="w-full">
                                        <TabsList className="grid grid-cols-3 mb-4">
                                            <TabsTrigger value="both">Both Themes</TabsTrigger>
                                            <TabsTrigger value="light">Light Theme</TabsTrigger>
                                            <TabsTrigger value="dark">Dark Theme</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="both" className="mt-0">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <h4 className="text-sm font-medium mb-2">Light Theme</h4>
                                                    <pre className="bg-secondary/50 rounded-md p-4 overflow-auto text-xs max-h-96">
                                                        {getThemeSection('light')}
                                                    </pre>
                                                </div>
                                                <div className="relative">
                                                    <h4 className="text-sm font-medium mb-2">Dark Theme</h4>
                                                    <pre className="bg-secondary/50 rounded-md p-4 overflow-auto text-xs max-h-96">
                                                        {getThemeSection('dark')}
                                                    </pre>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="light" className="mt-0">
                                            <pre className="bg-secondary/50 rounded-md p-4 overflow-auto text-sm max-h-96">
                                                {getThemeSection('light')}
                                            </pre>
                                        </TabsContent>

                                        <TabsContent value="dark" className="mt-0">
                                            <pre className="bg-secondary/50 rounded-md p-4 overflow-auto text-sm max-h-96">
                                                {getThemeSection('dark')}
                                            </pre>
                                        </TabsContent>
                                    </Tabs>

                                    <DialogFooter className="sm:justify-start gap-2">
                                        <Button
                                            variant="secondary"
                                            className="gap-1"
                                            onClick={() => copyToClipboard(exportedTheme)}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            {copied ? "Copied!" : "Copy All"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-1"
                                            onClick={() => copyToClipboard(getThemeSection('light'))}
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copy Light Theme
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-1"
                                            onClick={() => copyToClipboard(getThemeSection('dark'))}
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copy Dark Theme
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                        <div>
                            <Tabs defaultValue="light" onValueChange={(value) => setActiveTheme(value as 'light' | 'dark')} className="mb-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="light">Light Theme</TabsTrigger>
                                    <TabsTrigger value="dark">Dark Theme</TabsTrigger>
                                </TabsList>

                                <div className="overflow-y-auto pr-2 border rounded-md p-4 mt-4">
                                    {/* Base Color Controls */}
                                    <div className="mb-6">
                                        <h3 className="text-base font-medium mb-4">Base Colors</h3>

                                        <div className="space-y-4">
                                            {/* Primary Color */}
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`${activeTheme}-primary-base`} className="text-sm">
                                                        Primary Color
                                                    </Label>
                                                    <div
                                                        className="w-6 h-6 rounded-full border"
                                                        style={{
                                                            backgroundColor: `hsl(${baseColors[activeTheme].primary.h}, ${baseColors[activeTheme].primary.s}%, ${baseColors[activeTheme].primary.l}%)`
                                                        }}
                                                    />
                                                </div>
                                                <Input
                                                    type="color"
                                                    id={`${activeTheme}-primary-base`}
                                                    className="h-10"
                                                    value={hslToHex(
                                                        baseColors[activeTheme].primary.h,
                                                        baseColors[activeTheme].primary.s,
                                                        baseColors[activeTheme].primary.l
                                                    )}
                                                    onChange={(e) => handleBaseColorChange('primary', e.target.value)}
                                                />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <Label htmlFor={`${activeTheme}-primary-h`} className="text-xs">Hue</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Slider
                                                                id={`${activeTheme}-primary-h`}
                                                                min={0}
                                                                max={360}
                                                                step={1}
                                                                value={[baseColors[activeTheme].primary.h]}
                                                                onValueChange={(values) => {
                                                                    const newHue = values[0];
                                                                    setBaseColors(prev => ({
                                                                        ...prev,
                                                                        [activeTheme]: {
                                                                            ...prev[activeTheme],
                                                                            primary: {
                                                                                ...prev[activeTheme].primary,
                                                                                h: newHue
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-xs w-8 text-right">{Math.round(baseColors[activeTheme].primary.h)}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`${activeTheme}-primary-s`} className="text-xs">Saturation</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Slider
                                                                id={`${activeTheme}-primary-s`}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                value={[baseColors[activeTheme].primary.s]}
                                                                onValueChange={(values) => {
                                                                    const newSaturation = values[0];
                                                                    setBaseColors(prev => ({
                                                                        ...prev,
                                                                        [activeTheme]: {
                                                                            ...prev[activeTheme],
                                                                            primary: {
                                                                                ...prev[activeTheme].primary,
                                                                                s: newSaturation
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-xs w-8 text-right">{Math.round(baseColors[activeTheme].primary.s)}%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`${activeTheme}-primary-l`} className="text-xs">Lightness</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Slider
                                                                id={`${activeTheme}-primary-l`}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                value={[baseColors[activeTheme].primary.l]}
                                                                onValueChange={(values) => {
                                                                    const newLightness = values[0];
                                                                    setBaseColors(prev => ({
                                                                        ...prev,
                                                                        [activeTheme]: {
                                                                            ...prev[activeTheme],
                                                                            primary: {
                                                                                ...prev[activeTheme].primary,
                                                                                l: newLightness
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-xs w-8 text-right">{Math.round(baseColors[activeTheme].primary.l)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Secondary Color */}
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`${activeTheme}-secondary-base`} className="text-sm">
                                                        Secondary Color
                                                    </Label>
                                                    <div
                                                        className="w-6 h-6 rounded-full border"
                                                        style={{
                                                            backgroundColor: `hsl(${baseColors[activeTheme].secondary.h}, ${baseColors[activeTheme].secondary.s}%, ${baseColors[activeTheme].secondary.l}%)`
                                                        }}
                                                    />
                                                </div>
                                                <Input
                                                    type="color"
                                                    id={`${activeTheme}-secondary-base`}
                                                    className="h-10"
                                                    value={hslToHex(
                                                        baseColors[activeTheme].secondary.h,
                                                        baseColors[activeTheme].secondary.s,
                                                        baseColors[activeTheme].secondary.l
                                                    )}
                                                    onChange={(e) => handleBaseColorChange('secondary', e.target.value)}
                                                />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <Label htmlFor={`${activeTheme}-secondary-h`} className="text-xs">Hue</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Slider
                                                                id={`${activeTheme}-secondary-h`}
                                                                min={0}
                                                                max={360}
                                                                step={1}
                                                                value={[baseColors[activeTheme].secondary.h]}
                                                                onValueChange={(values) => {
                                                                    const newHue = values[0];
                                                                    setBaseColors(prev => ({
                                                                        ...prev,
                                                                        [activeTheme]: {
                                                                            ...prev[activeTheme],
                                                                            secondary: {
                                                                                ...prev[activeTheme].secondary,
                                                                                h: newHue
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-xs w-8 text-right">{Math.round(baseColors[activeTheme].secondary.h)}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`${activeTheme}-secondary-s`} className="text-xs">Saturation</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Slider
                                                                id={`${activeTheme}-secondary-s`}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                value={[baseColors[activeTheme].secondary.s]}
                                                                onValueChange={(values) => {
                                                                    const newSaturation = values[0];
                                                                    setBaseColors(prev => ({
                                                                        ...prev,
                                                                        [activeTheme]: {
                                                                            ...prev[activeTheme],
                                                                            secondary: {
                                                                                ...prev[activeTheme].secondary,
                                                                                s: newSaturation
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-xs w-8 text-right">{Math.round(baseColors[activeTheme].secondary.s)}%</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`${activeTheme}-secondary-l`} className="text-xs">Lightness</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Slider
                                                                id={`${activeTheme}-secondary-l`}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                value={[baseColors[activeTheme].secondary.l]}
                                                                onValueChange={(values) => {
                                                                    const newLightness = values[0];
                                                                    setBaseColors(prev => ({
                                                                        ...prev,
                                                                        [activeTheme]: {
                                                                            ...prev[activeTheme],
                                                                            secondary: {
                                                                                ...prev[activeTheme].secondary,
                                                                                l: newLightness
                                                                            }
                                                                        }
                                                                    }));
                                                                }}
                                                                className="flex-1"
                                                            />
                                                            <span className="text-xs w-8 text-right">{Math.round(baseColors[activeTheme].secondary.l)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Background Color */}
                                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`${activeTheme}-background-base`} className="text-sm">
                                                        Background Color
                                                    </Label>
                                                    <div
                                                        className="w-6 h-6 rounded-full border"
                                                        style={{
                                                            backgroundColor: `hsl(${baseColors[activeTheme].background.h}, ${baseColors[activeTheme].background.s}%, ${baseColors[activeTheme].background.l}%)`
                                                        }}
                                                    />
                                                </div>
                                                <Input
                                                    type="color"
                                                    id={`${activeTheme}-background-base`}
                                                    className="h-10 w-20"
                                                    value={hslToHex(
                                                        baseColors[activeTheme].background.h,
                                                        baseColors[activeTheme].background.s,
                                                        baseColors[activeTheme].background.l
                                                    )}
                                                    onChange={(e) => handleBaseColorChange('background', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Color Harmony Quick Settings */}
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Quick Color Harmonies</h4>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={generateAnalogousScheme}
                                                    className="text-xs"
                                                >
                                                    Analogous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={generateComplementaryScheme}
                                                    className="text-xs"
                                                >
                                                    Complementary
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={generateTriadicScheme}
                                                    className="text-xs"
                                                >
                                                    Triadic
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Settings Toggle */}
                                    <div className="mt-4 mb-2">
                                        <Button
                                            variant="ghost"
                                            className="w-full flex items-center justify-between"
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                        >
                                            <span>Advanced Settings</span>
                                            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {/* Advanced Settings */}
                                    {showAdvanced && (
                                        <div className="mt-4">
                                            {Object.entries(variableGroups).map(([groupName, variables]) => (
                                                <Collapsible
                                                    key={`${activeTheme}-${groupName}`}
                                                    open={openGroups[groupName]}
                                                    onOpenChange={() => toggleGroup(groupName)}
                                                    className="mb-2"
                                                >
                                                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded">
                                                        <h3 className="text-sm font-semibold">{groupName}</h3>
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                {openGroups[groupName] ? (
                                                                    <ChevronUp className="h-3 w-3" />
                                                                ) : (
                                                                    <ChevronDown className="h-3 w-3" />
                                                                )}
                                                                <span className="sr-only">Toggle</span>
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </div>
                                                    <CollapsibleContent className="pt-1 pb-2">
                                                        <table className="w-full text-sm">
                                                            <tbody>
                                                                {variables.map(variable => (
                                                                    <tr key={`${activeTheme}-${variable}`} className="border-b border-b-muted/50">
                                                                        <td className="py-1 pr-1">
                                                                            <Label htmlFor={`${activeTheme}-${variable}`} className="text-xs">
                                                                                --{variable}
                                                                            </Label>
                                                                        </td>
                                                                        <td className="py-1 w-6">
                                                                            <div
                                                                                className="w-4 h-4 rounded-full border"
                                                                                style={{ backgroundColor: getColorPreview(variable) }}
                                                                            />
                                                                        </td>
                                                                        <td className="py-1 w-8">
                                                                            <Input
                                                                                type="color"
                                                                                id={`${activeTheme}-${variable}-color`}
                                                                                className="w-6 h-6 p-0 bg-transparent"
                                                                                value={getHexColor(variable)}
                                                                                onChange={(e) => handleColorChange(variable, e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td className="py-1 pl-1">
                                                                            <Input
                                                                                type="text"
                                                                                id={`${activeTheme}-${variable}-text`}
                                                                                className="h-6 text-xs"
                                                                                value={getColorPreview(variable)}
                                                                                onChange={(e) => handleColorChange(variable, e.target.value)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Tabs>
                        </div>

                        <div className="sticky top-4 max-h-[calc(100vh-2rem)]">
                            <h3 className="font-medium text-sm mb-2">Theme Preview</h3>
                            <div className="theme-preview-container p-4 rounded-lg border overflow-y-auto dark:bg-background">
                                <div className="p-4 rounded-md bg-background text-foreground">
                                    <h4 className="text-foreground font-bold text-sm mb-3">UI Components</h4>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-foreground text-xs font-medium mb-2">Buttons</h5>
                                            <div className="flex flex-wrap gap-2">
                                                <Button size="sm">Primary</Button>
                                                <Button size="sm" variant="secondary">Secondary</Button>
                                                <Button size="sm" variant="outline">Outline</Button>
                                                <Button size="sm" variant="destructive">Destructive</Button>
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-foreground text-xs font-medium mb-2">Input Fields</h5>
                                            <div className="grid gap-2">
                                                <Label htmlFor="preview-input" className="text-xs">Input Label</Label>
                                                <Input id="preview-input" placeholder="Enter text here..." className="h-8 text-sm" />
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-foreground text-xs font-medium mb-2">Backgrounds</h5>
                                            <div className="grid gap-2">
                                                <div className="p-2 rounded-md bg-card text-card-foreground border text-xs">
                                                    Card Background
                                                </div>
                                                <div className="p-2 rounded-md bg-primary text-primary-foreground text-xs">
                                                    Primary Background
                                                </div>
                                                <div className="p-2 rounded-md bg-secondary text-secondary-foreground text-xs">
                                                    Secondary Background
                                                </div>
                                                <div className="p-2 rounded-md bg-muted text-muted-foreground text-xs">
                                                    Muted Background
                                                </div>
                                                <div className="p-2 rounded-md bg-accent text-accent-foreground text-xs">
                                                    Accent Background
                                                </div>
                                                <div className="p-2 rounded-md bg-destructive text-destructive-foreground text-xs">
                                                    Destructive Background
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ThemeEditor;