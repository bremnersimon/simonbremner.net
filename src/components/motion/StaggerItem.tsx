import React, { type ReactNode } from 'react';
import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    staggerDelay?: number;
    threshold?: number; // We'll use this differently in the component
}

const StaggerContainer: React.FC<StaggerContainerProps> = ({
    children,
    className = "",
    delay = 0.1,
    staggerDelay = 0.1,
    threshold = 0.1
}) => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: delay,
                staggerChildren: staggerDelay
            }
        }
    };

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            // The correct way to use threshold in viewport options
            viewport={{
                once: true,
                amount: threshold // Use 'amount' instead of 'threshold'
            }}
            variants={containerVariants}
        >
            {children}
        </motion.div>
    );
};

export default StaggerContainer;