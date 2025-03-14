// src/components/blocks/DevelopmentMetadata.tsx
import React from 'react';
import { Badge } from '../ui/badge';
import {
    Calendar,
    Link as LinkIcon,
    Box,
    Clock,
    Server,
    Database,
    Code2,
    Package,
    Cloud,
    User
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

// Define types for the component props
interface TechItem {
    name: string;
    _id?: string;
    description?: string;
    logo?: {
        asset?: {
            url?: string;
        }
    };
    [key: string]: any;
}

interface ProjectDuration {
    startDate?: string;
    endDate?: string;
    timeSpent?: string;
}

interface TechStack {
    frontend?: TechItem[] | null;
    backend?: TechItem[] | null;
    database?: TechItem[] | null;
    devOps?: TechItem[] | null;
}

interface DevelopmentMetadataProps {
    projectDuration?: ProjectDuration | null;
    projectStatus?: string | null;
    projectType?: string | null;
    clientName?: string | null;
    projectLink?: string | null;
    techStack?: TechStack | null;
    frameworks?: TechItem[] | null;
    libraries?: TechItem[] | null;
    hostingPlatform?: TechItem | null;
}

interface TechStackSectionProps {
    label: string;
    items: TechItem[] | null | undefined;
}

// Single tech item component
const TechItem: React.FC<{ tech: TechItem }> = ({ tech }) => {
    // Get first letter for fallback display
    const firstLetter = tech.name.charAt(0).toUpperCase();

    return (
        <div className="">
            <div className="w-14 h-14 border border-foreground/10 rounded-sm p-1">
                {tech.icon?.asset?.url ? (
                    <img
                        src={tech.icon.asset.url}
                        alt={tech.name}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-lg font-bold">{firstLetter}</span>
                )}
            </div>
            <span className="text-xs text-center">{tech.name}</span>
        </div>

    );
};

// Tech stack section component (Frontend, Backend, etc.)
const TechStackSection: React.FC<TechStackSectionProps> = ({ label, items }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-medium">{label}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
                {items.map((tech) => (
                    <TechItem key={tech._id || tech.name} tech={tech} />
                ))}
            </div>
        </div>
    );
};

const DevelopmentMetadata: React.FC<DevelopmentMetadataProps> = ({
    projectDuration,
    projectStatus,
    projectType,
    clientName,
    projectLink,
    techStack,
    frameworks,
    libraries,
    hostingPlatform
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
            {/* <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Project Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="mb-6 flex flex-col gap-10">
                        <div className="">
                            <h3 className="text-base font-medium mb-3">Status</h3>
                            {projectStatus && (
                                <Badge variant="outline" className="rounded-full px-3 py-1">
                                    {projectStatus}
                                </Badge>
                            )}
                        </div>
                        <div className="">
                            <h3 className="text-base font-medium mb-3">Type</h3>
                            {projectType && (
                                <Badge variant="outline" className="rounded-full px-3 py-1">
                                    Type: {projectType}
                                </Badge>
                            )}
                        </div>
                    </div>

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

                    <div>
                        {clientName && (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                                    <User className="h-5 w-5" />
                                    Client
                                </h3>
                                <div>{clientName}</div>
                            </div>
                        )}

                        {projectLink && (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-base font-medium mb-3">
                                    <LinkIcon className="h-5 w-5" />
                                    Live Project
                                </h3>
                                <a
                                    href={projectLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {projectLink}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

            </div> */}
            {/* Technology Stack Section */}
            <div className="border-border pb-4">
                <h2 className="text-xl font-semibold mb-4">Technology Stack</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Frontend */}
                    {techStack?.frontend && techStack.frontend.length > 0 && (
                        <TechStackSection
                            label="Frontend"
                            items={techStack.frontend}
                        />
                    )}

                    {/* Backend */}
                    {techStack?.backend && techStack.backend.length > 0 && (
                        <TechStackSection
                            label="Backend"
                            items={techStack.backend}
                        />
                    )}

                    {/* Database */}
                    {techStack?.database && techStack.database.length > 0 && (
                        <TechStackSection
                            label="Database"
                            items={techStack.database}
                        />
                    )}

                    {/* DevOps */}
                    {techStack?.devOps && techStack.devOps.length > 0 && (
                        <TechStackSection
                            label="DevOps"
                            items={techStack.devOps}
                        />
                    )}

                    {/* Frameworks */}
                    {frameworks && frameworks.length > 0 && (
                        <TechStackSection
                            label="Frameworks"
                            items={frameworks}
                        />
                    )}

                    {/* Libraries */}
                    {libraries && libraries.length > 0 && (
                        <TechStackSection
                            label="Libraries"
                            items={libraries}
                        />
                    )}

                    {/* Hosting Platform */}
                    {hostingPlatform && (
                        <TechStackSection
                            label="Hosting"
                            items={[hostingPlatform]}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevelopmentMetadata;