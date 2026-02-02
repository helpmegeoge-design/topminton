"use client";

import { motion } from "framer-motion";

export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function AnimatedList({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedItem({ children, className, onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) {
    return (
        <motion.div
            variants={itemVariants}
            className={className}
            whileTap={{ scale: 0.97 }} // Instagram touch feel
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}
