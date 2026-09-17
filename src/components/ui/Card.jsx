import { motion } from 'framer-motion';

export function Card({ children, className = '', ...props }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export default Card;
