import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  loading = false,
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { y: -1 }}
      className={`button button-${loading ? 'loading' : variant} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle size={16} strokeWidth={2} className="spin" /> : Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </motion.button>
  );
}

export default Button;
