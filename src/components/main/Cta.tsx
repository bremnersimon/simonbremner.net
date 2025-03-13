import { Button } from "../ui/button";

const Cta = () => {
    return (
        <div className="w-full py-20 md:py-40 flex flex-col items-center justify-center text-center gap-10">
            <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-2xl mx-auto">Want to chat? Let's talk about being creative!</h2>
                <p className="text-muted-foreground text-lg mt-4">I'm here to share my journey and inspire others to continue their own journey.</p>
            </div>
            <Button variant="default" asChild>
                <a href="https://discord.gg/qdkKUeCS3J" target="_blank" rel="noopener noreferrer">Join my discord</a>
            </Button>
        </div>
    );
};

export { Cta };