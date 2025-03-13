import { Camera, Code, Dot, ExternalLink, Hammer, Link, Pencil, User } from "lucide-react";
const handleIcon = (icon: string) => {
    switch (icon) {
        case "camera":
            return <Camera />;
        case "code":
            return <Code />;
        case "pencil":
            return <Pencil />;
        case "hammer":
            return <Hammer />;
        case "external":
            return <ExternalLink />;
        case "dot":
            return <Dot />;
        case "link":
            return <Link />;
        case "user":
            return <User />;
        default:
            return null;
    }
}

export { handleIcon }