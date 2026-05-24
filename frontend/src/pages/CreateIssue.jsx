import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueServiceAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload } from 'react-icons/hi';

const CATEGORIES = [
  'wifi', 'internet', 'software', 'projector', 'website',
  'electricity', 'power', 'light', 'fan',
  'plumbing', 'furniture', 'classroom', 'washroom',
  'hostel', 'mess', 'room',
  'book', 'library',
  'bus', 'transport',
  'parking', 'gate',
  'id_card', 'fee', 'scholarship',
  'exam', 'timetable', 'faculty',
];

export default function CreateIssue() {
  const [form, setForm] = useState({
    title: '', description: '', category: 'wifi', location: '', priority: 'medium',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) {
        return toast.error('Image must be under 5MB');
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('location', form.location);
      formData.append('priority', form.priority);
      if (file) formData.append('image', file);

      await issueServiceAPI.create(formData);
      toast.success('Issue reported successfully!');
      navigate('/issues');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Report an Issue</h1>
        <p>Describe the campus problem you've encountered</p>
      </div>

      <div className="glass-card" style={{ padding: '28px 32px', maxWidth: 680 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="issue-title">Title *</label>
            <input
              id="issue-title"
              name="title"
              className="form-input"
              placeholder="Brief summary of the issue"
              value={form.title}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="issue-description">Description *</label>
            <textarea
              id="issue-description"
              name="description"
              className="form-textarea"
              placeholder="Provide detailed information about the issue..."
              value={form.description}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={2000}
              rows={4}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="issue-category">Category *</label>
              <select
                id="issue-category"
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="issue-priority">Priority</label>
              <select
                id="issue-priority"
                name="priority"
                className="form-select"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="issue-location">Location *</label>
            <input
              id="issue-location"
              name="location"
              className="form-input"
              placeholder="e.g. Block A, Room 204"
              value={form.location}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attachment (optional)</label>
            <div
              className={`file-upload-area ${file ? 'has-file' : ''}`}
              onClick={() => fileRef.current?.click()}
            >
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={handleFile}
                style={{ display: 'none' }}
                id="issue-file"
              />
              {preview ? (
                <div>
                  <img src={preview} alt="Preview" className="file-preview" />
                  <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{file.name}</p>
                </div>
              ) : (
                <div>
                  <HiOutlineUpload style={{ fontSize: '1.6rem', marginBottom: 8 }} />
                  <p style={{ fontSize: '0.88rem' }}>Click to upload an image (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="submit-issue" style={{ marginTop: 4 }}>
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
}
