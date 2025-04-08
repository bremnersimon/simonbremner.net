import { handleIcon } from "@/lib/handleIconLookup";

const CategoryLinks = () => {
    const categoryLinks = [
        { href: "/projects/photography", icon: "camera" },
        { href: "/projects/development", icon: "code" },
        { href: "/projects/design", icon: "pencil" },
        { href: "/projects/handcrafted", icon: "hammer" },
    ]
    return (
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
    )
}

export { CategoryLinks };