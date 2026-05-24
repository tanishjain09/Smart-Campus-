import { useState, useEffect } from 'react';
import { dashboardServiceAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Area, AreaChart,
} from 'recharts';

const STATUS_COLORS = {
  reported: '#d97b2a', assigned: '#3a7bd5',
  in_progress: '#7c5cbf', resolved: '#2d9d78',
};

const PRIORITY_COLORS = {
  low: '#2d9d78', medium: '#d97b2a', high: '#e06930', critical: '#d94f4f',
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await dashboardServiceAPI.getAnalytics({ days });
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (!data) return null;

  const statusData = data.breakdowns.status.map((d) => ({
    name: d._id === 'in_progress' ? 'In Progress' : (d._id?.charAt(0).toUpperCase() + d._id?.slice(1)),
    value: d.count,
    color: STATUS_COLORS[d._id] || '#8c8c8c',
  }));

  const priorityData = data.breakdowns.priority.map((d) => ({
    name: d._id?.charAt(0).toUpperCase() + d._id?.slice(1),
    value: d.count,
    color: PRIORITY_COLORS[d._id] || '#8c8c8c',
  }));

  const deptData = data.breakdowns.department.map((d) => ({
    name: d._id?.charAt(0).toUpperCase() + d._id?.slice(1),
    count: d.count,
  }));

  const trendData = data.trend.map((d) => ({
    date: `${d._id.day}/${d._id.month}`,
    count: d.count,
  }));

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
            <h1>Analytics</h1>
            <p>Campus issue insights and trends</p>
          </div>
          <select
            className="form-select"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ width: 'auto' }}
            id="analytics-days"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Overdue" value={data.overdueCount} icon="⏰" color="#d94f4f" />
        <StatCard label="Escalated" value={data.escalatedCount} icon="▲" color="#e06930" />
        <StatCard
          label="Avg Resolution"
          value={`${(data.averageResolutionHours || 0).toFixed(1)}h`}
          icon="⏱"
          color="#3a7bd5"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} innerRadius={58} paddingAngle={3} strokeWidth={0}>
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={100} innerRadius={58} paddingAngle={3} strokeWidth={0}>
                {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Issues by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#5c5c5c', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#5c5c5c', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="url(#deptGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="deptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8a748" />
                  <stop offset="100%" stopColor="#d97b2a" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Daily Trend ({days} days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#5c5c5c', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5c5c5c', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8a748" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#e8a748" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="count" stroke="#e8a748" fill="url(#trendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
