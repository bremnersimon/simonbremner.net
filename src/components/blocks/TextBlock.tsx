// src/components/blocks/TextBlock.tsx
import type React from 'react';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';

interface TextBlockProps {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    content?: any[];
    width?: 'normal' | 'wide' | 'full';
}

// Import shared Portable Text components
import { textComponents } from './shared/portable-text-components';

const TextBlock: React.FC<TextBlockProps> = ({ content, width = 'normal' }) => {
    if (!content || !content.length) return null;

    const widthClasses = {
        normal: 'max-w-2xl mx-auto',
        wide: 'max-w-4xl mx-auto',
        full: 'w-full'
    };

    return (
        <div className={cn('prose prose-lg dark:prose-invert leading-relaxed', widthClasses[width])}>
            <PortableText
                value={content}
                // @ts-ignore
                components={textComponents} />
        </div>
    );
};

export { TextBlock };