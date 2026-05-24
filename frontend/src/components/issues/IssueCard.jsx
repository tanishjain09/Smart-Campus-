import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineTag } from 'react-icons/hi';

export default function IssueCard({ issue }) {
  const navigate = useNavigate();
  const date = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="issue-card"
      onClick={() => navigate(`/issues/${issue.ticketId}`)}
      id={`issue-${issue.ticketId}`}
    >
      <div className="issue-card-body">
        <div className="issue-card-title">{issue.title}</div>
        <div className="issue-card-meta">
          <span><HiOutlineTag /> {issue.ticketId}</span>
          <span><HiOutlineLocationMarker /> {issue.location}</span>
          <span><HiOutlineClock /> {date}</span>
          <span style={{ textTransform: 'capitalize' }}>{issue.department}</span>
        </div>
      </div>
      <div className="issue-card-badges">
        <StatusBadge status={issue.status} />
        <PriorityBadge priority={issue.priority} />
      </div>
    </div>
  );
}
