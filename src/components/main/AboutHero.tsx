import { Container } from "./Container";
import AnimateOnLoad from "../motion/AnimateOnLoad";
import { Separator } from "../ui/separator";


type AboutHeroProps = {
    children: React.ReactNode
    content: {
        headline: string;
        paragraphs: string[];
    }
}



export default function AboutHero({ children, content }: AboutHeroProps) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center md:gap-8 md:py-40 min-h-screen">
                <AnimateOnLoad
                    variants={{
                        hidden: { opacity: 0, x: -30 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                    }}
                >
                    <div className="rounded-lg relative">
                        <div className="absolute bottom-[-30px] left-10 font-bold text-primary text-7xl">| Simon Bremner</div>
                        {children}
                    </div>
                </AnimateOnLoad>
                <AnimateOnLoad
                    variants={{
                        hidden: { opacity: 0, x: 30 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
                    }}
                >

                    <div className="text-left">
                        <h1 className="text-4xl md:text-6xl lg:text-[8rem] font-bold text-left md:leading-tight lg:leading-30 relative">
                            {content.headline}
                        </h1>
                        <Separator className="my-4" />
                        {content.paragraphs.map((paragraph, index) => (
                            <p key={index} className="text-muted-foreground text-lg md:text-lg lg:text-xl mt-4 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </AnimateOnLoad>
            </div>
        </>
    );
}