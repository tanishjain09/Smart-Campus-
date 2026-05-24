export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title || 'Nothing here yet'}</h3>
      <p>{message || 'No data to display.'}</p>
    </div>
  );
}
