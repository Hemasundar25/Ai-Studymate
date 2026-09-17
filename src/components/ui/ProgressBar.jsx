import { motion } from 'framer-motion';

export function ProgressBar({ value = 0, color = 'indigo', className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className={`progress-track ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`progress-fill ${color}`}
      />
    </div>
  );
}

export default ProgressBar;
