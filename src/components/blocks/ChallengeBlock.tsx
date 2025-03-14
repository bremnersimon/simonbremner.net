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
import { motion, AnimatePresence } from "motion/react";

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

// Custom AccordionTrigger with left alignment and bolder text
const CustomAccordionTrigger = ({
    children,
    className = "",
    index,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    index: number;
    [key: string]: any;
}) => (
    <AccordionTrigger
        className={`text-left font-semibold text-lg justify-start ${className}`}
        {...props}
    >
        <span className="mr-2 text-primary">{index + 1}.</span>{" "}
        {children}
    </AccordionTrigger>
);

// Custom AccordionContent with animation
const CustomAccordionContent = ({
    children,
    className = "",
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
}) => {
    return (
        <AccordionContent className={className} {...props}>
            <div className="pt-2">
                {children}
            </div>
        </AccordionContent>
    );
};

const ChallengeBlock: React.FC<ChallengeBlockProps> = ({
    type = 'Challenges',
    heading = 'Project Challenges',
    challenges = []
}) => {
    if (!challenges.length) return null;

    const [activeItem, setActiveItem] = React.useState<string | null>(null);

    const handleValueChange = (value: string) => {
        setActiveItem(value === activeItem ? null : value);
    };

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">{type}</Badge>
                <CardTitle>{heading}</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={activeItem || undefined}
                    onValueChange={handleValueChange}
                >
                    {challenges.map((challenge, index) => (
                        <AccordionItem key={challenge._key} value={challenge._key}>
                            <CustomAccordionTrigger index={index}>
                                {challenge.problem}
                            </CustomAccordionTrigger>

                            <AnimatePresence initial={false}>
                                {activeItem === challenge._key && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <CustomAccordionContent>
                                            {challenge.solution && challenge.solution.length > 0 && (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <PortableText
                                                        value={challenge.solution}
                                                    />
                                                </div>
                                            )}
                                        </CustomAccordionContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
};

export default ChallengeBlock;