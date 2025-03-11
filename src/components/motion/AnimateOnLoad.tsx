import React, { type ReactNode, type ElementType } from 'react';
import { motion, type Variants, type HTMLMotionProps } from 'motion/react';

interface AnimateOnLoadProps {
    children: ReactNode;
    variants?: Variants;
    className?: string;
    delay?: number;
    tag?: ElementType;
}

const AnimateOnLoad: React.FC<AnimateOnLoadProps> = ({
    children,
    variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5 }
        }
    },
    className = "",
    delay = 0,
    tag = "div"
}) => {
    // Add type assertion
    const MotionTag = motion[tag as keyof typeof motion] as typeof motion.div;

    return (
        <MotionTag
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ delay }}
            className={className}
        >
            {children}
        </MotionTag>
    );
};

export default AnimateOnLoad;