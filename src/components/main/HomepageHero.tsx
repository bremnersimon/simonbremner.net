import { Button } from "@/components/ui/button"
import { Container } from "./Container";
import { handleIcon } from "@/lib/handleIconLookup";

interface HomepageHeroProps {
    title: string[]
    primaryCta: {
        text: string
        href: string
        icon?: string
    }
    secondaryCta?: {
        text: string
        href: string
        icon?: string
    }
}

export default function HomepageHero({
    title,
    primaryCta = {
        text: "Meet Me",
        href: "/about",
        icon: "user",
    },
    secondaryCta
}: HomepageHeroProps) {
    const categoryLinks = [
        { href: "/projects/photography", icon: "camera" },
        { href: "/projects/development", icon: "code" },
        { href: "/projects/design", icon: "pencil" },
        { href: "/projects/handcrafted", icon: "hammer" },
    ]
    return (
        <Container className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center text-center w-full h-full">
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full border mb-8">
                    {categoryLinks.map((link, index) => (
                        <div key={link.href} className="inline-flex items-center">
                            <a className="hover:text-primary transition-colors" href={link.href}>
                                {handleIcon(link.icon)}
                            </a>
                            {index !== categoryLinks.length - 1 && handleIcon("dot")}
                        </div>
                    ))}
                </div>
                {title.map((line) => (
                    <h1 key={line} className="text-2xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-4">{line}</h1>
                ))}
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    {primaryCta && (
                        <Button asChild variant="default" size="lg">
                            <a href={primaryCta.href} data-astro-reload>{primaryCta.text}{primaryCta?.icon ? handleIcon(primaryCta.icon) : null}</a>
                        </Button>
                    )}
                    {secondaryCta && (
                        <Button asChild variant="outline" size="lg">
                            <a href={secondaryCta.href} data-astro-reload>{secondaryCta.text}{secondaryCta?.icon ? handleIcon(secondaryCta.icon) : null}</a>
                        </Button>
                    )}
                </div>
            </div>
        </Container>
    )
}
