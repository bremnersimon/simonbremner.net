import { Card, CardContent, CardHeader, CardTitle } from "@/components/shad-ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shad-ui/table";
// src/components/blocks/TechSpecsBlock.tsx
import type React from "react";

interface Spec {
	label?: string;
	value?: string;
	_key: string;
}

interface TechSpecsBlockProps {
	title?: string;
	specs?: Spec[];
	layout?: "table" | "list";
}

const TechSpecsBlock: React.FC<TechSpecsBlockProps> = ({
	title = "Technical Specifications",
	specs = [],
	layout = "table",
}) => {
	if (!specs.length) return null;

	return (
		<Card className="max-w-3xl mx-auto my-8">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{layout === "table" ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1/3">Specification</TableHead>
								<TableHead>Value</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{specs.map((spec) => (
								<TableRow key={spec._key}>
									<TableCell className="font-medium">{spec.label}</TableCell>
									<TableCell>{spec.value}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
						{specs.map((spec) => (
							<div
								key={spec._key}
								className="border-b border-gray-200 dark:border-gray-800 pb-3"
							>
								<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
									{spec.label}
								</dt>
								<dd className="mt-1 text-muted dark:text-gray-100">
									{spec.value}
								</dd>
							</div>
						))}
					</dl>
				)}
			</CardContent>
		</Card>
	);
};

export { TechSpecsBlock };
