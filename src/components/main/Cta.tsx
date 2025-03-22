import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const Cta = () => {
    return (
        <div className="w-full py-20 md:py-40 flex flex-col items-center justify-center text-center gap-10 max-w-lg mx-auto">
            <Separator className="my-8" />
            <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-2xl mx-auto">Go Create!</h2>
                <p className="text-muted-foreground text-lg mt-4">This site is here to inspire you through your journey. I'd love to chat with you, but I'm not really active in communities right now. I'd suggest getting involved in a free Discord server, Slack channel, or local meetup that aligns with your creative interests!</p>
            </div>
            <div className="flex flex-row gap-4">
                <Button variant="default" asChild>
                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
                </Button>
                <Button variant="default" asChild>
                    <a href="https://slack.com" target="_blank" rel="noopener noreferrer">Slack</a>
                </Button>
            </div>
            <Separator className="my-8" />
        </div>
    );
};

export { Cta };