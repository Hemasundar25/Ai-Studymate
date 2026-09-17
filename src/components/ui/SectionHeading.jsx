export function SectionHeading({ eyebrow, title, action, className = '' }) {
  return (
    <div className={`section-heading ${className}`}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default SectionHeading;
