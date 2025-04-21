import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/shad-ui/accordion";
import { Badge } from "@/components/shad-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shad-ui/card";
import { PortableText } from "@portabletext/react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface Challenge {
	problem?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	solution?: any[];
	_key: string;
}

interface ChallengeBlockProps {
	type?: string;
	heading?: string;
	challenges?: Challenge[];
}

const CustomAccordionTrigger = ({
	children,
	className = "",
	index,
	...props
}: {
	children: React.ReactNode;
	className?: string;
	index: number;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[key: string]: any;
}) => (
	<AccordionTrigger
		className={`text-left font-semibold text-lg justify-start ${className}`}
		{...props}
	>
		<span className="mr-2 text-primary">{index + 1}.</span> {children}
	</AccordionTrigger>
);

const CustomAccordionContent = ({
	children,
	className = "",
	...props
}: {
	children: React.ReactNode;
	className?: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[key: string]: any;
}) => {
	return (
		<AccordionContent className={className} {...props}>
			<div className="pt-2">{children}</div>
		</AccordionContent>
	);
};

const ChallengeBlock: React.FC<ChallengeBlockProps> = ({
	type = "Challenges",
	heading = "Project Challenges",
	challenges = [],
}) => {
	if (!challenges.length) return null;

	const [activeItem, setActiveItem] = React.useState<string | null>(null);

	const handleValueChange = (value: string) => {
		setActiveItem(value === activeItem ? null : value);
	};

	return (
		<Card className="max-w-3xl mx-auto my-8">
			<CardHeader>
				<Badge variant="outline" className="w-fit mb-2">
					{type}
				</Badge>
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
														// @ts-ignore
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

export { ChallengeBlock };
