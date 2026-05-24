export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}
