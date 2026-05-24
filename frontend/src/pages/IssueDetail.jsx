import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueServiceAPI, userServiceAPI } from '../services/api';
import StatusBadge from '../components/issues/StatusBadge';
import PriorityBadge from '../components/issues/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const STATUS_TRANSITIONS = {
  reported: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['resolved'],
  resolved: [],
};

export default function IssueDetail() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffUsers, setStaffUsers] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [updating, setUpdating] = useState(false);

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  useEffect(() => {
    fetchIssue();
    if (isStaffOrAdmin) fetchStaffUsers();
  }, [ticketId]);

  const fetchIssue = async () => {
    try {
      const res = await issueServiceAPI.getByTicketId(ticketId);
      setIssue(res.data.data.issue);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Issue not found');
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffUsers = async () => {
    try {
      const res = await userServiceAPI.list({ role: 'staff' });
      setStaffUsers(res.data.data.users || []);
    } catch {
      // admin-only; fail silently for staff
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return toast.error('Select a status');
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      if (assignTo) payload.assignedTo = assignTo;
      const res = await issueServiceAPI.updateStatus(ticketId, payload);
      setIssue(res.data.data.issue);
      setNewStatus('');
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTo) return toast.error('Select a user');
    setUpdating(true);
    try {
      const res = await issueServiceAPI.assign(ticketId, assignTo);
      setIssue(res.data.data.issue);
      setAssignTo('');
      toast.success('Issue assigned!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading issue..." />;
  if (!issue) return null;

  const allowedTransitions = STATUS_TRANSITIONS[issue.status] || [];
  const createdDate = new Date(issue.createdAt).toLocaleString('en-IN');
  const updatedDate = new Date(issue.updatedAt).toLocaleString('en-IN');

  return (
    <div className="page-container issue-detail">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <HiOutlineArrowLeft /> Back
      </button>

      <div className="issue-detail-header">
        <div className="issue-detail-ticket">{issue.ticketId}</div>
        <h1>{issue.title}</h1>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
          {issue.escalationLevel > 0 && (
            <span className="badge badge-critical">Escalated (L{issue.escalationLevel})</span>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <div className="detail-item-label">Category</div>
          <div className="detail-item-value" style={{ textTransform: 'capitalize' }}>
            {issue.category?.replace(/_/g, ' ')}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Department</div>
          <div className="detail-item-value" style={{ textTransform: 'capitalize' }}>
            {issue.department}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Location</div>
          <div className="detail-item-value">{issue.location}</div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Reported By</div>
          <div className="detail-item-value">
            {issue.createdBy?.name || 'Unknown'}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Assigned To</div>
          <div className="detail-item-value">
            {issue.assignedTo?.name || 'Unassigned'}
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Created</div>
          <div className="detail-item-value">{createdDate}</div>
        </div>
        <div className="detail-item">
          <div className="detail-item-label">Last Updated</div>
          <div className="detail-item-value">{updatedDate}</div>
        </div>
        {issue.resolvedAt && (
          <div className="detail-item">
            <div className="detail-item-label">Resolved At</div>
            <div className="detail-item-value">
              {new Date(issue.resolvedAt).toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>

      <div className="issue-description glass-card">
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{issue.description}</p>
      </div>

      {issue.attachments?.length > 0 && (
        <div className="issue-attachments">
          <h3>Attachments</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {issue.attachments.map((att, i) => (
              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                <img src={att.url} alt={att.originalName || 'Attachment'} className="attachment-img" />
              </a>
            ))}
          </div>
        </div>
      )}

      {isStaffOrAdmin && issue.status !== 'resolved' && (
        <div className="action-panel glass-card">
          <h3>Actions</h3>

          {!issue.assignedTo && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 10 }}>Assign this issue to a staff member:</p>
              <div className="action-panel-row">
                <div className="form-group">
                  <select
                    className="form-select"
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    id="assign-select"
                  >
                    <option value="">Select staff...</option>
                    {staffUsers.map((u) => (
                      <option key={u.id || u._id} value={u.id || u._id}>
                        {u.name} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleAssign} disabled={updating}>
                  {updating ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          )}

          {allowedTransitions.length > 0 && (
            <div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 10 }}>Update issue status:</p>
              <div className="action-panel-row">
                <div className="form-group">
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    id="status-select"
                  >
                    <option value="">Select status...</option>
                    {allowedTransitions.map((s) => (
                      <option key={s} value={s}>
                        {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {newStatus === 'assigned' && !issue.assignedTo && (
                  <div className="form-group">
                    <select
                      className="form-select"
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                    >
                      <option value="">Select assignee...</option>
                      {staffUsers.map((u) => (
                        <option key={u.id || u._id} value={u.id || u._id}>
                          {u.name} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button className="btn btn-primary btn-sm" onClick={handleStatusUpdate} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
