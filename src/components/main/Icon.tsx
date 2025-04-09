import { Camera, Code, Dot, ExternalLink, Hammer, Link, Pencil, User, Home } from "lucide-react";

const Icon = ({ name, className, size }: { name: string, className?: string, size?: number }) => {
    return <div className={className}>{handleIcon(name, size)}</div>;
};


const handleIcon = (icon: string, size?: number) => {
    switch (icon) {
        case "camera":
            return <Camera size={size} />;
        case "code":
            return <Code size={size} />;
        case "pencil":
            return <Pencil size={size} />;
        case "hammer":
            return <Hammer size={size} />;
        case "external":
            return <ExternalLink size={size} />;
        case "dot":
            return <Dot size={size} />;
        case "link":
            return <Link size={size} />;
        case "user":
            return <User size={size} />;
        case "home":
            return <Home size={size} />;
        default:
            return null;
    }
}

export { Icon };