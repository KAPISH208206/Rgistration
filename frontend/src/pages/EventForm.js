import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EventForm() {
  const { id } = useParams(); // present when editing
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', capacity: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL}/events/${id}`, authHeader)
        .then(({ data }) => {
          setForm({
            title: data.title,
            description: data.description,
            date: data.date.split('T')[0],
            location: data.location,
            capacity: data.capacity,
          });
          setFetching(false);
        })
        .catch(() => { setError('Could not load that event.'); setFetching(false); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (id) {
        await axios.put(`${process.env.REACT_APP_API_URL}/events/${id}`, form, authHeader);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/events`, form, authHeader);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this event.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={s.center}><p style={{ color: 'var(--text-faint)' }}>Loading…</p></div>;

  return (
    <div style={s.page}>
      <Link to="/dashboard" style={s.backLink}>← Back to dashboard</Link>

      <h1 style={s.title}>{id ? 'Edit event' : 'Create an event'}</h1>
      <p style={s.subtitle}>{id ? 'Update the details below.' : 'Fill in the details and publish when ready.'}</p>

      {error && <div style={s.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Event title</label>
          <input name="title" placeholder="e.g. Quarterly team offsite" value={form.title} onChange={handleChange} style={s.input} required />
        </div>

        <div style={s.field}>
          <label style={s.label}>Description</label>
          <textarea name="description" placeholder="What should people know before they sign up?" value={form.description} onChange={handleChange} style={s.textarea} required />
        </div>

        <div style={s.row}>
          <div style={s.field}>
            <label style={s.label}>Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} style={s.input} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Capacity</label>
            <input name="capacity" type="number" min="1" placeholder="50" value={form.capacity} onChange={handleChange} style={s.input} required />
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Location</label>
          <input name="location" placeholder="e.g. Chandigarh" value={form.location} onChange={handleChange} style={s.input} required />
        </div>

        <div style={s.actions}>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Saving…' : id ? 'Save changes' : 'Create event'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} style={s.cancelBtn}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const s = {
  page: { maxWidth: '560px', margin: '0 auto', padding: '32px 24px 60px' },
  center: { textAlign: 'center', padding: '60px 0' },
  backLink: { color: 'var(--text-faint)', fontSize: '0.86rem', display: 'inline-block', marginBottom: '20px' },
  title: { fontFamily: "'Source Serif 4', serif", fontSize: '1.6rem', color: 'var(--text)' },
  subtitle: { color: 'var(--text-faint)', marginTop: '4px', marginBottom: '26px', fontSize: '0.9rem' },
  error: { background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.88rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  row: { display: 'flex', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-soft)' },
  input: { padding: '10px 13px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', fontSize: '0.92rem', outline: 'none' },
  textarea: { padding: '10px 13px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', fontSize: '0.92rem', minHeight: '110px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' },
  actions: { display: 'flex', gap: '10px', marginTop: '6px' },
  btn: { flex: 1, padding: '11px', background: 'var(--primary)', color: 'var(--primary-text-on)', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700 },
  cancelBtn: { padding: '11px 18px', background: 'transparent', color: 'var(--text-soft)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 600 },
};

export default EventForm;
