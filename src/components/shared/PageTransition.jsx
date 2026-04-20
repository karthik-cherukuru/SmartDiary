/**
 * PageTransition — wraps each page with a Framer Motion fade + slide.
 *
 * Used inside <AnimatePresence> in App.jsx to animate between routes.
 * The key prop on the route element drives the transition.
 */
import { motion } from 'framer-motion'

const variants = {
    initial: {
        opacity: 0,
        y: 12,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1], // spring-like ease-out
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.18,
            ease: 'easeIn',
        },
    },
}

export default function PageTransition({ children }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%', minHeight: '100vh' }}
        >
            {children}
        </motion.div>
    )
}
