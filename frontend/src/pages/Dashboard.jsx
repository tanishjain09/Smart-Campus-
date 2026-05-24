import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardServiceAPI } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import IssueCard from '../components/issues/IssueCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  reported: '#d97b2a',
  assigned: '#3a7bd5',
  in_progress: '#7c5cbf',
  resolved: '#2d9d78',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardServiceAPI.getSummary();
      setData(res.data.data);

      if (user.role === 'staff' || user.role === 'admin') {
        const analyticsRes = await dashboardServiceAPI.getAnalytics({ days: 30 });
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!data) return <EmptyState title="Error" message="Could not load dashboard data" />;

  const { issueSummary, recentIssues } = data;
  const statusData = Object.entries(issueSummary.byStatus).map(([name, value]) => ({
    name: name === 'in_progress' ? 'In Progress' : name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name],
  }));

  const deptData = analytics?.breakdowns?.department?.map((d) => ({
    name: d._id?.charAt(0).toUpperCase() + d._id?.slice(1),
    count: d.count,
  })) || [];

  const tooltipStyle = {
    background: '#1b1d21',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#f5f3ef',
    fontSize: '0.82rem',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1>Welcome back, {user.name}</h1>
            <p>Here's what's happening on campus today</p>
          </div>
          {user.role === 'student' && (
            <button className="btn btn-primary" onClick={() => navigate('/issues/new')} id="btn-new-issue">
              + Report Issue
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Issues"
          value={issueSummary.total}
          icon="📋"
          color="#3a7bd5"
          subtitle="All time"
        />
        <StatCard
          label="Reported"
          value={issueSummary.byStatus.reported || 0}
          icon="📝"
          color="#d97b2a"
          subtitle="Awaiting action"
        />
        <StatCard
          label="In Progress"
          value={issueSummary.byStatus.in_progress || 0}
          icon="⚙️"
          color="#7c5cbf"
          subtitle="Being worked on"
        />
        <StatCard
          label="Resolved"
          value={issueSummary.byStatus.resolved || 0}
          icon="✓"
          color="#2d9d78"
          subtitle="Completed"
        />
      </div>

      {(user.role === 'staff' || user.role === 'admin') && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <StatCard
            label="Overdue"
            value={analytics?.overdueCount || 0}
            icon="⏰"
            color="#d94f4f"
            subtitle="Needs attention"
          />
          <StatCard
            label="Escalated"
            value={analytics?.escalatedCount || 0}
            icon="▲"
            color="#e06930"
            subtitle="Priority bumped"
          />
          <StatCard
            label="Avg Resolution"
            value={`${(analytics?.averageResolutionHours || 0).toFixed(1)}h`}
            icon="⏱"
            color="#3a7bd5"
            subtitle="Resolution time"
          />
        </div>
      )}

      {(user.role === 'staff' || user.role === 'admin') && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Issues by Status</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={58}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {deptData.length > 0 && (
            <div className="chart-card">
              <h3>Issues by Department</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#5c5c5c', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#5c5c5c', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e8a748" />
                      <stop offset="100%" stopColor="#d97b2a" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14, letterSpacing: '-0.01em' }}>Recent Issues</h2>
        {recentIssues?.length > 0 ? (
          <div className="issues-grid">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.ticketId || issue._id} issue={issue} />
            ))}
          </div>
        ) : (
          <EmptyState title="No issues yet" message="No issues have been reported." />
        )}
      </div>
    </div>
  );
}
