

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
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-center md:gap-8 pt-20 md:py-40 min-h-screen">

                <div className="relative pb-10 md:pb-0">
                    <div className="hidden lg:inline absolute bottom-[-30px] left-10 font-bold text-primary text-7xl">| Simon Bremner</div>
                    {children}
                </div>


                <div className="text-left">
                    <h1 className="text-4xl md:text-6xl lg:text-[8rem] font-bold text-left md:leading-tight lg:leading-30 relative">
                        {content.headline}
                    </h1>
                    {content.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-muted-foreground text-lg md:text-lg lg:text-xl mt-4 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>

            </div>
        </>
    );
}