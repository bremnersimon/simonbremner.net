import { motion, useSpring, useScroll } from "motion/react"

type ScrollIndicatorProps = {
    children: React.ReactNode;
}

export default function ScrollIndicator({ children }: ScrollIndicatorProps) {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    return (
        <>
            <motion.div
                id="scroll-indicator"
                style={{
                    scaleX,
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 10,
                    originX: 0,
                    backgroundColor: "#EF4425",
                    zIndex: 9999,
                }}
            />
            {children}
        </>
    )
}