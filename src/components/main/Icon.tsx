import { handleIcon } from "@/lib/handleIconLookup";

const Icon = ({ name, className, size }: { name: string, className?: string, size?: number }) => {
    return <div className={className}>{handleIcon(name, size)}</div>;
};

export { Icon };