import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Container } from "../main/Container"

interface FooterLink {
    title: string
    href: string
}

interface FooterSection {
    title: string
    links: FooterLink[]
}

interface FooterProps {
    title: string
    sections: FooterSection[]
}

export default function Footer({
    title = "Simon Bremner",
    sections
}: FooterProps) {
    return (
        <footer className="w-full py-24 relative overflow-hidden border-t">
            <Container>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <h2 className="text-[10rem] md:text-[16rem] font-bold tracking-tighter text-muted-foreground/10 whitespace-nowrap">
                        {title}
                    </h2>
                </div>

                <div className="container px-4 relative z-10">
                    <div className="flex flex-col gap-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {sections.map((section) => (
                                <div key={section.title}>
                                    <h3 className="text-lg font-medium mb-4">{section.title}</h3>
                                    <ul className="space-y-2">
                                        {section.links.map((link) => (
                                            <li key={link.title}>
                                                <Button variant="link" asChild className="p-0 h-auto text-foreground">
                                                    <a href={link.href}>{link.title}</a>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-8">
                            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} simonbremner.net. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </Container >
        </footer>
    )
}