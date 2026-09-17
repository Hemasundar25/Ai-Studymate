import { Sparkles } from 'lucide-react';

export function EmptyState({ icon: Icon = Sparkles, title, text, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <Icon size={28} />
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
