// src/components/blocks/DesignMetadata.tsx
import type React from 'react';
import { Badge } from '../ui/badge';
import {
    Calendar,
    Link as LinkIcon,
    Palette,
    Clock,
    Briefcase,
    Type,
    Globe,
    User,
    PenTool
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";
import { cn } from '@/lib/utils';

// Define types for the component props
interface DesignTool {
    _id?: string;
    name: string;
    description?: string;
    icon?: {
        asset?: {
            url?: string;
        }
    };
}

interface Color {
    name?: string;
    hex?: string;
    _key?: string;
}

interface Font {
    name?: string;
    weights?: string[];
    _key?: string;
}

interface Typography {
    primaryFont?: Font;
    secondaryFont?: Font;
}

interface Logo {
    name?: string;
    image?: {
        asset?: {
            url?: string;
        }
    };
    _key?: string;
}

interface DesignSystem {
    colors?: Color[];
    typography?: Typography;
    logos?: Logo[];
}

interface Client {
    name?: string;
    industry?: string;
    website?: string;
}

interface ProjectDuration {
    startDate?: string;
    endDate?: string;
    timeSpent?: string;
}

interface DesignMetadataProps {
    tools?: DesignTool[];
    designSystem?: DesignSystem;
    client?: Client;
    projectStatus?: string;
    category?: string;
    projectDuration?: ProjectDuration;
}

// Tool component
const DesignTool: React.FC<{ tool: DesignTool }> = ({ tool }) => {
    // Get first letter for fallback display
    const firstLetter = tool.name.charAt(0).toUpperCase();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 cursor-help">
                        <div className="w-14 h-14 border border-foreground/10 rounded-sm p-1 flex items-center justify-center">
                            {tool.icon?.asset?.url ? (
                                <img
                                    src={tool.icon.asset.url}
                                    alt={tool.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-lg font-bold">{firstLetter}</span>
                            )}
                        </div>
                        <span className="text-xs text-center">{tool.name}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tool.description || tool.name}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

// Color swatch component
const ColorSwatch: React.FC<{ color: Color }> = ({ color }) => {
    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="w-14 h-14 rounded-sm border border-foreground/10"
                style={{ backgroundColor: color.hex || '#000000' }}
            />
            <div className="text-xs text-center">
                <div>{color.name || 'Unnamed'}</div>
                <div className="text-muted-foreground">{color.hex}</div>
            </div>
        </div>
    );
};

// Logo component
const LogoDisplay: React.FC<{ logo: Logo }> = ({ logo }) => {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 border border-foreground/10 rounded-sm p-1 flex items-center justify-center">
                {logo.image?.asset?.url ? (
                    <img
                        src={logo.image.asset.url}
                        alt={logo.name || 'Logo'}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="text-sm font-medium text-center">{logo.name || 'Logo'}</div>
                )}
            </div>
            <span className="text-xs text-center">{logo.name || 'Logo variant'}</span>
        </div>
    );
};

// Font component
const FontDisplay: React.FC<{ font: Font, label: string }> = ({ font, label }) => {
    if (!font || !font.name) return null;

    return (
        <div className="mb-3">
            <h4 className="text-sm font-medium">{label}</h4>
            <div className="text-base">{font.name}</div>
            {font.weights && font.weights.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    Weights: {font.weights.join(', ')}
                </div>
            )}
        </div>
    );
};

const DesignMetadata: React.FC<DesignMetadataProps> = ({
    tools,
    designSystem,
    client,
    projectStatus,
    category,
    projectDuration
}) => {
    // Format dates
    const formatDate = (dateString?: string): string => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const startDate = formatDate(projectDuration?.startDate);
    const endDate = formatDate(projectDuration?.endDate);

    return (
        <div className="border-b-1 overflow-hidden mb-8">
            {/* Project Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Project Info */}
                <div>
                    {/* Status & Category */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {projectStatus && (
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                                Status: {projectStatus}
                            </Badge>
                        )}
                        {category && (
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                                Type: {category}
                            </Badge>
                        )}
                    </div>

                    {/* Timeline */}
                    {projectDuration && (
                        <div className="mb-6">
                            <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                                <Calendar className="h-5 w-5" />
                                Timeline
                            </h3>
                            <div className="space-y-1">
                                {startDate && <div>Started: {startDate}</div>}
                                {endDate && <div>Completed: {endDate}</div>}
                                {projectDuration.timeSpent && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{projectDuration.timeSpent}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Client Info */}
                {client && (
                    <div>
                        <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                            <Briefcase className="h-5 w-5" />
                            Client
                        </h3>
                        <div className="space-y-1">
                            {client.name && <div>{client.name}</div>}
                            {client.industry && (
                                <div className="text-sm text-muted-foreground">
                                    Industry: {client.industry}
                                </div>
                            )}
                            {client.website && (
                                <div className="flex items-center gap-1 mt-2">
                                    <Globe className="h-4 w-4" />
                                    <a
                                        href={client.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {client.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Design System Section */}
            {designSystem && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Design System</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Color Palette */}
                        {designSystem.colors && designSystem.colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                                    <Palette className="h-5 w-5" />
                                    Color Palette
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {designSystem.colors.map((color) => (
                                        <ColorSwatch key={color._key || color.hex} color={color} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Typography */}
                        {designSystem.typography && (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                                    <Type className="h-5 w-5" />
                                    Typography
                                </h3>
                                <div>
                                    <FontDisplay
                                        font={designSystem.typography.primaryFont ? designSystem.typography.primaryFont : {}}
                                        label="Primary Font"
                                    />
                                    <FontDisplay
                                        font={designSystem.typography.secondaryFont ? designSystem.typography.secondaryFont : {}}
                                        label="Secondary Font"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logos */}
                    {designSystem.logos && designSystem.logos.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-base font-medium mb-3">Logo Variations</h3>
                            <div className="flex flex-wrap gap-6">
                                {designSystem.logos.map((logo) => (
                                    <LogoDisplay key={logo._key} logo={logo} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Design Tools Section */}
            {tools && tools.length > 0 && (
                <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                        <PenTool className="h-5 w-5" />
                        Design Tools
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {tools.map((tool) => (
                            <DesignTool key={tool._id || tool.name} tool={tool} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export { DesignMetadata };