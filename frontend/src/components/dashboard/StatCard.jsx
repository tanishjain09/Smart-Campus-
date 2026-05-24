export default function StatCard({ label, value, icon, color, subtitle }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <style>{`
        .stat-card[style*="--stat-color"]::after {
          background: var(--stat-color);
        }
      `}</style>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div
          className="stat-card-icon"
          style={{ background: `${color}12`, color: color }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-card-value" style={{ color }}>{value}</div>
      {subtitle && <div className="stat-card-change">{subtitle}</div>}
    </div>
  );
}
