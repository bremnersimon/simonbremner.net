import { Button } from "@/components/ui/button"
import { Container } from "./Container";
import { handleIcon } from "@/lib/handleIconLookup";

interface HomepageHeroProps {
    children: React.ReactNode
    title: string
    subtitle: string
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
    children,
    title = "Brands. Sites. Products.",
    subtitle = "Designed and Developed in-house.",
    primaryCta = {
        text: "View Plans & Pricing",
        href: "/pricing",
    },
    secondaryCta
}: HomepageHeroProps) {
    return (
        <Container className="h-full flex flex-col items-center justify-center py-20 md:py-60">
            <div className="flex flex-col items-center text-center mb-12 w-full h-full">
                <div className="inline-flex items-center px-4 py-2 rounded-full border mb-8">
                    {/* <span className="text-sm">Now Booking</span> */}
                    {handleIcon("camera")}
                    {handleIcon("dot")}
                    {handleIcon("code")}
                    {handleIcon("dot")}
                    {handleIcon("pencil")}
                    {handleIcon("dot")}
                    {handleIcon("hammer")}
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">{title}</h1>
                <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground mb-8">{subtitle}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    {primaryCta && (
                        <Button asChild variant="default" size="lg">
                            <a href={primaryCta.href}>{primaryCta.text}{primaryCta?.icon ? handleIcon(primaryCta.icon) : null}</a>
                        </Button>
                    )}
                    {secondaryCta && (
                        <Button asChild variant="outline" size="lg">
                            <a href={secondaryCta.href}>{secondaryCta.text}{secondaryCta?.icon ? handleIcon(secondaryCta.icon) : null}</a>
                        </Button>
                    )}
                </div>
            </div>
            <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden bg-muted">
                {children}
            </div>
        </Container>
    )
}

