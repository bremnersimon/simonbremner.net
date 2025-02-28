// src/components/blocks/ChallengeBlock.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortableText } from '@portabletext/react';
import { textComponents } from './shared/portable-text-components';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface Challenge {
    problem?: string;
    solution?: any[];
    _key: string;
}

interface ChallengeBlockProps {
    type?: string;
    heading?: string;
    challenges?: Challenge[];
}

const ChallengeBlock: React.FC<ChallengeBlockProps> = ({
    type = 'Challenges',
    heading = 'Project Challenges',
    challenges = []
}) => {
    if (!challenges.length) return null;

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">{type}</Badge>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {challenges.map((challenge, index) => (
                        <AccordionItem key={challenge._key} value={challenge._key}>
                            <AccordionTrigger className="text-left font-medium text-base">
                                <span className="mr-2 text-primary">{index + 1}.</span> {challenge.problem}
                            </AccordionTrigger>
                            <AccordionContent>
                                {challenge.solution && challenge.solution.length > 0 && (
                                    <div className="prose prose-sm dark:prose-invert max-w-none pt-2">
                                        <PortableText
                                            value={challenge.solution}
                                            components={textComponents}
                                        />
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default ChallengeBlock;