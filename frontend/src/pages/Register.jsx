import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'administration', 'electrical', 'it', 'hostel',
  'maintenance', 'library', 'transport', 'security', 'academics',
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', department: 'administration', registrationKey: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Please fill in all required fields');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if ((form.role === 'staff' || form.role === 'admin') && !form.registrationKey.trim()) {
      return toast.error('Secret registration code is required');
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="brand-icon">🏫</div>
          <h2>Join Smart Campus</h2>
          <p>
            Create your account to start reporting campus issues, 
            track resolutions and help maintain a better campus 
            environment for everyone.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create account</h1>
            <p>Get started with the campus platform</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">I am a...</label>
              <select
                id="reg-role"
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="staff">Staff Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            {form.role === 'staff' && (
              <div className="form-group">
                <label className="form-label" htmlFor="reg-department">Department</label>
                <select
                  id="reg-department"
                  name="department"
                  className="form-select"
                  value={form.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {(form.role === 'staff' || form.role === 'admin') && (
              <div className="form-group">
                <label className="form-label" htmlFor="reg-key">
                  {form.role === 'admin' ? 'Admin' : 'Staff'} Registration Code
                </label>
                <input
                  id="reg-key"
                  name="registrationKey"
                  type="password"
                  className="form-input"
                  placeholder="Enter secret registration key"
                  value={form.registrationKey}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit" style={{ marginTop: 4 }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
