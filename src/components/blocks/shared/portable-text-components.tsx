import React from 'react';

// Components for rendering different Portable Text node types
export const textComponents = {
    block: {
        normal: ({ children }: { children: React.ReactNode }) => <p className="mb-4">{children}</p>,
        h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>,
        h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
        h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>,
        h4: ({ children }: { children: React.ReactNode }) => <h4 className="text-xl font-bold mt-6 mb-3">{children}</h4>,
        h5: ({ children }: { children: React.ReactNode }) => <h5 className="text-lg font-bold mt-4 mb-2">{children}</h5>,
        h6: ({ children }: { children: React.ReactNode }) => <h6 className="text-base font-bold mt-4 mb-2">{children}</h6>,
        blockquote: ({ children }: { children: React.ReactNode }) => (
            <blockquote className="pl-4 border-l-4 border-gray-300 italic my-6">{children}</blockquote>
        ),
    },
    list: {
        bullet: ({ children }: { children: React.ReactNode }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
        number: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
    },
    listItem: {
        bullet: ({ children }: { children: React.ReactNode }) => <li className="mb-1">{children}</li>,
        number: ({ children }: { children: React.ReactNode }) => <li className="mb-1">{children}</li>,
    },
    marks: {
        link: ({ children, value }: { children: React.ReactNode; value: { href: string } }) => (
            <a href={value.href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
        strong: ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>,
        em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
        code: ({ children }: { children: React.ReactNode }) => (
            <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm">{children}</code>
        ),
    },
};