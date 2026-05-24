export default function StatusBadge({ status }) {
  const label = status === 'in_progress' ? 'In Progress' : status;
  return <span className={`badge badge-${status}`}>{label}</span>;
}
