import Card from './Card';

export function StatCard({ label, value, meta, icon: Icon, tone = 'indigo', className = '' }) {
  return (
    <Card className={`stat-card ${className}`}>
      <div className={`stat-icon ${tone}`}>
        {Icon && <Icon size={19} />}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{meta}</small>
      </div>
    </Card>
  );
}

export default StatCard;
