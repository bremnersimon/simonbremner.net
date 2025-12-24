import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import { useState, useRef, useCallback, type ReactNode } from "react";

interface HoverImageLinkProps {
    href: string;
    imageSrc: string;
    imageAlt: string;
    children: ReactNode;
    className?: string;
}

export default function HoverImageLink({
    href,
    imageSrc,
    imageAlt,
    children,
    className = "",
}: HoverImageLinkProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 150, height: 200 });
    const linkRef = useRef<HTMLAnchorElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Motion values for smooth cursor tracking
    const x: MotionValue<number> = useMotionValue(0);
    const y: MotionValue<number> = useMotionValue(0);

    // Spring configuration for buttery smooth animation
    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const smoothX = useSpring(x, springConfig);
    const smoothY = useSpring(y, springConfig);

    // Transform for centering the image on cursor using actual image dimensions
    const imageX = useTransform(smoothX, (value: number) => value - imageSize.width / 2);
    const imageY = useTransform(smoothY, (value: number) => value - imageSize.height / 2);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!linkRef.current) return;

        const rect = linkRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        x.set(relativeX);
        y.set(relativeY);
    }, [x, y]);

    const handleImageLoad = useCallback(() => {
        if (imageRef.current) {
            // Use a small delay to ensure the image is fully rendered
            setTimeout(() => {
                if (imageRef.current) {
                    setImageSize({
                        width: imageRef.current.offsetWidth,
                        height: imageRef.current.offsetHeight,
                    });
                }
            }, 10);
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
        // Recalculate size on hover in case it wasn't set properly on load
        if (imageRef.current) {
            setImageSize({
                width: imageRef.current.offsetWidth,
                height: imageRef.current.offsetHeight,
            });
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <a
            ref={linkRef}
            href={href}
            className={`relative ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children}

            <motion.div
                className="absolute pointer-events-none z-10"
                style={{
                    x: imageX,
                    y: imageY,
                }}
                initial={{ opacity: 0, scale: 0.8, rotateX: -10 }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.8,
                    rotateX: isHovered ? 0 : -10,
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
            >
                <motion.img
                    ref={imageRef}
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-[150px] h-[200px] object-cover rounded-lg shadow-2xl border border-white/10"
                    style={{
                        filter: "saturate(1.1) contrast(1.05) brightness(1.05)",
                        transformStyle: "preserve-3d",
                    }}
                    onLoad={handleImageLoad}
                    whileHover={{
                        scale: 1.02,
                        rotateY: 2,
                    }}
                    transition={{
                        duration: 0.15,
                        ease: "easeOut",
                    }}
                />
            </motion.div>
        </a>
    );
}