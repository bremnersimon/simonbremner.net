import { useState } from "react";
import { Button } from "@/components/shad-ui/button";
import { LogoTransition } from "@/components/globals/LogoTransition";

/**
 * Testing-page demo for LogoTransition. Each (re)play remounts the
 * transition via a changing React key so the play-once sequence restarts.
 */
export const LogoTransitionDemo = () => {
	const [playCount, setPlayCount] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	const play = () => {
		setPlayCount((count) => count + 1);
		setIsPlaying(true);
	};

	return (
		<div className="flex flex-col items-start gap-4">
			<Button onClick={play} disabled={isPlaying}>
				{playCount === 0 ? "Play animation" : "Replay animation"}
			</Button>
			{playCount > 0 && (
				<LogoTransition
					key={playCount}
					onComplete={() => setIsPlaying(false)}
				/>
			)}
		</div>
	);
};
