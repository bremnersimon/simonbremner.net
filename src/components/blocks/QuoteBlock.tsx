// src/components/blocks/QuoteBlock.tsx
import type React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface QuoteBlockProps {
    quote?: string;
    attribution?: string;
    style?: 'simple' | 'pullQuote' | 'blockquote';
}

const QuoteBlock: React.FC<QuoteBlockProps> = ({
    quote,
    attribution,
    style = 'simple'
}) => {
    if (!quote) return null;

    const simpleQuote = (
        <div className="text-center max-w-3xl mx-auto my-8 py-6">
            <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 italic font-serif">
                "{quote}"
            </p>
            {attribution && (
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                    — {attribution}
                </p>
            )}
        </div>
    );

    const renderQuote = () => {
        switch (style) {
            case 'pullQuote':
                return (
                    <Card className="border-0 bg-gray-50 dark:bg-muted shadow-sm max-w-3xl mx-auto my-8">
                        <CardContent className="pt-8 pb-4 px-6 sm:px-10 relative">
                            <Quote className="absolute text-gray-200 dark:text-gray-800 h-10 w-10 -top-2 left-2" />
                            <p className="italic text-xl md:text-2xl font-serif text-gray-800 dark:text-gray-200 relative z-10 leading-relaxed">
                                "{quote}"
                            </p>
                        </CardContent>
                        {attribution && (
                            <CardFooter className="px-6 sm:px-10 pb-6 pt-0">
                                <p className="text-right w-full text-gray-600 dark:text-gray-400">
                                    — {attribution}
                                </p>
                            </CardFooter>
                        )}
                    </Card>
                );

            case 'blockquote':
                return (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-6 max-w-3xl mx-auto">
                        <p className="text-lg text-gray-800 dark:text-gray-200 italic">
                            "{quote}"
                        </p>
                        {attribution && (
                            <footer className="mt-1 text-gray-600 dark:text-gray-400">
                                — {attribution}
                            </footer>
                        )}
                    </blockquote>
                );

            case 'simple':
                return simpleQuote;
            default:
                return simpleQuote;
        }
    };

    return renderQuote();
};

export { QuoteBlock };