// src/components/blocks/CodeBlock.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CodeBlockProps {
    code?: string;
    language?: 'javascript' | 'typescript' | 'html' | 'css' | 'python';
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript' }) => {

    if (!code) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        toast(
            'Code copied to clipboard',
        );
    };

    // Helper function to add syntax highlighting classes (you'll need to add appropriate CSS)
    const formatCode = (code: string, language: string) => {
        // For now, we'll just return the code as is
        // In a real implementation, you might use a library like Prism.js or highlight.js
        return code;
    };

    return (
        <div className="relative max-w-3xl mx-auto my-6">
            <div className="flex items-center justify-between bg-gray-800 rounded-t-md px-4 py-2">
                <span className="text-sm text-gray-300 font-mono">{language}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                    <Copy className="h-4 w-4 mr-2" />
                    <span className="text-xs">Copy</span>
                </Button>
            </div>

            <Card className="rounded-t-none border-gray-800 bg-gray-900 p-0 overflow-hidden">
                <pre className="p-4 overflow-x-auto">
                    <code className={`language-${language} text-sm text-white font-mono`}>
                        {formatCode(code, language)}
                    </code>
                </pre>
            </Card>
        </div>
    );
};

export default CodeBlock;