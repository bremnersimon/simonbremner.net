import { Badge } from "@/components/shad-ui/badge";
import { Button } from "@/components/shad-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shad-ui/card";
import { Github, Globe } from "lucide-react";
// src/components/blocks/RepoLinkBlock.tsx
import type React from "react";

interface RepoLinkBlockProps {
	type?: string;
	heading?: string;
	repository?: string;
	liveUrl?: string;
}

const RepoLinkBlock: React.FC<RepoLinkBlockProps> = ({
	type = "Project Links",
	heading = "View the Project",
	repository,
	liveUrl,
}) => {
	if (!repository && !liveUrl) return null;

	// Helper function to extract repo info from a GitHub URL
	const getGitHubInfo = (url: string) => {
		try {
			const parsedUrl = new URL(url);
			if (parsedUrl.hostname === "github.com") {
				const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
				if (pathParts.length >= 2) {
					return {
						username: pathParts[0],
						repo: pathParts[1],
					};
				}
			}
		} catch (error) {
			// Invalid URL, just return null
		}
		return null;
	};

	const gitHubInfo = repository ? getGitHubInfo(repository) : null;

	return (
		<Card className="max-w-3xl mx-auto my-8">
			<CardHeader>
				<Badge variant="outline" className="w-fit mb-2">
					{type}
				</Badge>
				<CardTitle>{heading}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col sm:flex-row gap-4">
				{repository && (
					<Button className="flex items-center" asChild>
						<a href={repository} target="_blank" rel="noopener noreferrer">
							<Github className="mr-2 h-4 w-4" />
							{gitHubInfo
								? `${gitHubInfo.username}/${gitHubInfo.repo}`
								: "View Repository"}
						</a>
					</Button>
				)}

				{liveUrl && (
					<Button variant="outline" className="flex items-center" asChild>
						<a href={liveUrl} target="_blank" rel="noopener noreferrer">
							<Globe className="mr-2 h-4 w-4" />
							View Live Project
						</a>
					</Button>
				)}
			</CardContent>
		</Card>
	);
};

export { RepoLinkBlock };
