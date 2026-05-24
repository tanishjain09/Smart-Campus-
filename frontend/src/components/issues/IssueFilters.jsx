export default function IssueFilters({ filters, onChange }) {
  const statuses = ['', 'reported', 'assigned', 'in_progress', 'resolved'];
  const priorities = ['', 'low', 'medium', 'high', 'critical'];
  const departments = [
    '', 'administration', 'electrical', 'it', 'hostel',
    'maintenance', 'library', 'transport', 'security', 'academics',
  ];

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="filters-bar glass-card">
      <input
        type="text"
        className="form-input"
        placeholder="Search issues..."
        value={filters.search || ''}
        onChange={(e) => handleChange('search', e.target.value)}
        id="filter-search"
      />
      <select
        className="form-select"
        value={filters.status || ''}
        onChange={(e) => handleChange('status', e.target.value)}
        id="filter-status"
      >
        <option value="">All Status</option>
        {statuses.filter(Boolean).map((s) => (
          <option key={s} value={s}>
            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <select
        className="form-select"
        value={filters.priority || ''}
        onChange={(e) => handleChange('priority', e.target.value)}
        id="filter-priority"
      >
        <option value="">All Priority</option>
        {priorities.filter(Boolean).map((p) => (
          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
        ))}
      </select>
      <select
        className="form-select"
        value={filters.department || ''}
        onChange={(e) => handleChange('department', e.target.value)}
        id="filter-department"
      >
        <option value="">All Departments</option>
        {departments.filter(Boolean).map((d) => (
          <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}
