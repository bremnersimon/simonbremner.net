import { Button } from "@/components/ui/button"
import { Container } from "./Container";
import { Camera, Code, Dot, Hammer, Pencil } from "lucide-react";
interface HomepageHeroProps {
    title: string
    subtitle: string
    mediaUrl: { src: string; alt: string; video?: boolean }
    primaryCta: {
        text: string
        href: string
    }
    secondaryCta?: {
        text: string
        href: string
    }
}

export default function HomepageHero({
    title = "Brands. Sites. Products.",
    subtitle = "Designed and Developed in-house.",
    mediaUrl = { src: "/images.example.png", alt: "Placeholder" },
    primaryCta = {
        text: "View Plans & Pricing",
        href: "/pricing",
    },
    secondaryCta
}: HomepageHeroProps) {
    return (
        <section className="w-full gap-4 bg-background py-10 flex flex-col items-center justify-center">
            <Container className="h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center text-center mb-12 w-full h-full">
                    <div className="inline-flex items-center px-4 py-1 rounded-full border mb-8">
                        {/* <span className="text-sm">Now Booking</span> */}
                        <Camera size={20} />
                        <Dot size={20} />
                        <Code size={20} />
                        <Dot size={20} />
                        <Pencil size={20} />
                        <Dot size={20} />
                        <Hammer size={20} />
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">{title}</h1>
                    <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground mb-8">{subtitle}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {primaryCta && (
                            <Button asChild variant="default" size="lg">
                                <a href={primaryCta.href}>{primaryCta.text}</a>
                            </Button>
                        )}
                        {secondaryCta && (
                            <Button asChild variant="outline" size="lg">
                                <a href={secondaryCta.href}>{secondaryCta.text}</a>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden bg-muted">
                    {mediaUrl.video ? (<><video src={mediaUrl.src} className="object-cover" />
                        <button className="absolute inset-0 flex items-center justify-center bg-black/20 group">
                            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-background/90 group-hover:bg-background transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </button></>) :
                        <img src={mediaUrl.src || "/images/example.png"} alt={mediaUrl.alt} className="object-cover" />
                    }

                </div>
            </Container>
        </section>
    )
}

