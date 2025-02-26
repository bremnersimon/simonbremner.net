import React, { useEffect, useRef, type ReactNode, type ElementType } from 'react';
import { motion, useAnimation, useInView, type Variants, type HTMLMotionProps } from 'framer-motion';

interface AnimateOnScrollProps {
    children: ReactNode;
    threshold?: number;
    variants?: Variants;
    className?: string;
    tag?: ElementType;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
    children,
    threshold = 0.1,
    variants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    },
    className = "",
    tag = "div"
}) => {
    const controls = useAnimation();
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: threshold }); // Using amount instead of threshold

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [controls, isInView]);

    // Type assertion for the motion component
    const MotionTag = motion[tag as keyof typeof motion] as typeof motion.div;

    return (
        <MotionTag
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={variants}
            className={className}
        >
            {children}
        </MotionTag>
    );
};