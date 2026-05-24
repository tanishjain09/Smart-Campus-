import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineTicket,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from 'react-icons/hi';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-overlay"
        />
      )}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏫</div>
          <h2>Smart Campus</h2>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section">Main</span>
          <NavLink to="/" className={linkClass} onClick={onClose} end>
            <span className="icon"><HiOutlineHome /></span>
            Dashboard
          </NavLink>

          {user?.role === 'student' && (
            <>
              <NavLink to="/issues/new" className={linkClass} onClick={onClose}>
                <span className="icon"><HiOutlinePlusCircle /></span>
                Report Issue
              </NavLink>
              <NavLink to="/issues" className={linkClass} onClick={onClose}>
                <span className="icon"><HiOutlineTicket /></span>
                My Issues
              </NavLink>
            </>
          )}

          {(user?.role === 'staff' || user?.role === 'admin') && (
            <>
              <span className="sidebar-section">Management</span>
              <NavLink to="/issues" className={linkClass} onClick={onClose}>
                <span className="icon"><HiOutlineClipboardList /></span>
                All Issues
              </NavLink>
              <NavLink to="/analytics" className={linkClass} onClick={onClose}>
                <span className="icon"><HiOutlineChartBar /></span>
                Analytics
              </NavLink>
            </>
          )}

          {user?.role === 'admin' && (
            <NavLink to="/users" className={linkClass} onClick={onClose}>
              <span className="icon"><HiOutlineUsers /></span>
              Users
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <HiOutlineLogout style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }} />
          </div>
        </div>
      </aside>
    </>
  );
}
