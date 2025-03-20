import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Copy, ChevronDown, ChevronUp, Check } from 'lucide-react';

// Types
type ColorFormat = 'hsl' | 'oklch';

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

// Utility functions
const hslToOklch = (h: number, s: number, l: number): string => {
    const hueRadians = (h % 360) * Math.PI / 180;
    const chroma = Math.min(0.4, (s / 100) * 0.4);
    const lightness = l / 100;
    return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hueRadians.toFixed(3)})`;
};

const ThemeEditor = () => {
    // State
    const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');
    const [themeValues, setThemeValues] = useState<ThemeValues>({ light: {}, dark: {} });
    const [exportedTheme, setExportedTheme] = useState('');
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState(false);

    // Color conversion utilities
    const hexToHsl = useCallback((hex: string): { h: number; s: number; l: number } => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

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

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
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

        return {
            format: 'hsl',
            values: { h: 0, s: 0, l: 50 }
        };
    }, []);

    // Initialize theme values
    useEffect(() => {
        const parsedLightTheme: Record<string, ColorData> = {};
        const parsedDarkTheme: Record<string, ColorData> = {};
        const initialGroupsState: Record<string, boolean> = {};

        Object.entries(initialThemes.light).forEach(([key, value]) => {
            parsedLightTheme[key] = parseColor(value);

            // Set initial open state for groups
            const group = Object.entries(variableGroups).find(([_group, vars]) =>
                vars.includes(key))?.[0];
            if (group) {
                initialGroupsState[group] = true;
            }
        });

        Object.entries(initialThemes.dark).forEach(([key, value]) => {
            parsedDarkTheme[key] = parseColor(value);
        });

        setThemeValues({
            light: parsedLightTheme,
            dark: parsedDarkTheme,
        });
        setOpenGroups(initialGroupsState);
    }, [parseColor]);

    // Update theme preview styles
    useEffect(() => {
        let styleElement = document.getElementById('theme-preview-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'theme-preview-styles';
            document.head.appendChild(styleElement);
        }

        let css = `.theme-preview-container {\n`;
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

        styleElement.textContent = css;

        return () => {
            if (styleElement && document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, [activeTheme, themeValues]);

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
            return '#808080'; // Default for OKLCH
        }
    }, [activeTheme, hslToHex, themeValues]);

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

    const toggleGroup = useCallback((group: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    }, []);

    // Generate and export theme
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

    const exportTheme = useCallback(() => {
        setExportedTheme(generateThemeCSS());
    }, [generateThemeCSS]);

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

    // Component for color variable row
    const ColorVariableRow = ({ variable, theme }: { variable: string; theme: 'light' | 'dark' }) => (
        <tr key={variable} className="border-b border-b-muted/50">
            <td className="py-1 pr-1">
                <Label htmlFor={`${theme}-${variable}`} className="text-xs">
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
                    id={`${theme}-${variable}-color`}
                    className="w-6 h-6 p-0 bg-transparent"
                    value={getHexColor(variable)}
                    onChange={(e) => handleColorChange(variable, e.target.value)}
                />
            </td>
            <td className="py-1 pl-1">
                <Input
                    type="text"
                    id={`${theme}-${variable}-text`}
                    className="h-6 text-xs"
                    value={getColorPreview(variable)}
                    onChange={(e) => handleColorChange(variable, e.target.value)}
                />
            </td>
        </tr>
    );

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">Theme Editor</CardTitle>
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
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                        <div>
                            <Tabs defaultValue="light" onValueChange={(value) => setActiveTheme(value as 'light' | 'dark')} className="mb-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="light">Light Theme</TabsTrigger>
                                    <TabsTrigger value="dark">Dark Theme</TabsTrigger>
                                </TabsList>

                                <div className="overflow-y-auto pr-2 border rounded-md p-2 mt-4">
                                    {['light', 'dark'].map((theme) => (
                                        <TabsContent key={theme} value={theme} className="mt-0 data-[state=active]:block">
                                            {Object.entries(variableGroups).map(([groupName, variables]) => (
                                                <Collapsible
                                                    key={`${theme}-${groupName}`}
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
                                                                    <ColorVariableRow
                                                                        key={`${theme}-${variable}`}
                                                                        variable={variable}
                                                                        theme={theme as 'light' | 'dark'}
                                                                    />
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            ))}
                                        </TabsContent>
                                    ))}
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