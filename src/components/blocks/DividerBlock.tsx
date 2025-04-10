import { Separator } from "@/components/ui/separator";
import type React from "react";

interface DividerBlockProps {
	style?: "line" | "dots" | "stars" | "space";
}

const DividerBlock: React.FC<DividerBlockProps> = ({ style = "line" }) => {
	const renderDivider = () => {
		switch (style) {
			case "dots":
				return (
					<div className="flex justify-center my-12">
						<div className="flex space-x-2">
							<div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
							<div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
							<div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
						</div>
					</div>
				);

			case "stars":
				return (
					<div className="flex justify-center my-12">
						<div className="flex space-x-3 text-gray-400 dark:text-gray-600">
							<span>✻</span>
							<span>✻</span>
							<span>✻</span>
						</div>
					</div>
				);

			case "space":
				return <div className="h-16" />;

			case "line":
				return (
					<div className="flex justify-center my-12">
						<Separator className="max-w-md mx-auto" />
					</div>
				);
			default:
				return (
					<div className="my-12">
						<Separator className="max-w-md mx-auto" />
					</div>
				);
		}
	};

	return renderDivider();
};

export { DividerBlock };
