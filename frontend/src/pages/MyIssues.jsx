import { useState, useEffect } from 'react';
import { issueServiceAPI } from '../services/api';
import IssueCard from '../components/issues/IssueCard';
import IssueFilters from '../components/issues/IssueFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const res = await issueServiceAPI.list(params);
      setIssues(res.data.data.issues);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Issues</h1>
        <p>Browse and filter all campus issues</p>
      </div>

      <IssueFilters filters={filters} onChange={setFilters} />

      {loading ? (
        <LoadingSpinner />
      ) : issues.length > 0 ? (
        <>
          <div className="issues-grid">
            {issues.map((issue) => (
              <IssueCard key={issue.ticketId || issue._id} issue={issue} />
            ))}
          </div>
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      ) : (
        <EmptyState title="No issues found" message="Try adjusting your filters or report a new issue." />
      )}
    </div>
  );
}
