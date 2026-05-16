import React from 'react';
import { motion } from 'motion/react';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

interface ExecutiveDashboardWrapperProps {
  children: React.ReactNode;
}

const ExecutiveDashboardWrapper: React.FC<ExecutiveDashboardWrapperProps> = ({ children }) => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={fadeUpItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ExecutiveDashboardWrapper;
export { fadeUpItem, staggerContainer };
