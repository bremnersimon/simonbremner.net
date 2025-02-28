// src/components/blocks/ProcessBlock.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortableText } from '@portabletext/react';
import { textComponents } from './shared/portable-text-components';

interface Phase {
    phase?: string;
    description?: any[];
    _key: string;
}

interface ProcessBlockProps {
    type?: string;
    heading?: string;
    phases?: Phase[];
}

const ProcessBlock: React.FC<ProcessBlockProps> = ({
    type = 'Process',
    heading = 'Development Process',
    phases = []
}) => {
    if (!phases.length) return null;

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">{type}</Badge>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {phases.map((phase, index) => (
                    <div
                        key={phase._key}
                        className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-800"
                    >
                        {/* Phase number circle */}
                        <div className="absolute -left-4 top-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            {index + 1}
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-2">{phase.phase}</h3>

                            {phase.description && phase.description.length > 0 && (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <PortableText
                                        value={phase.description}
                                        components={textComponents}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default ProcessBlock;