import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/dashboard';

  useEffect(() => {
    if (user) navigate(destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Use at least 6 characters for your password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, form);
      login(data);
      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong creating your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.panel} className="login-panel">
        <div style={s.panelText}>
          <h1 style={s.panelTitle}>Roundtable</h1>
          <p style={s.panelSub}>
            {destination.startsWith('/shared/')
              ? "Someone sent you a link to an event. Create an account to see it and register."
              : "Create an account to start running events and tracking who's registered."}
          </p>
        </div>
      </div>

      <div style={s.formSide}>
        <div style={s.card}>
          <h2 style={s.title}>Create your account</h2>
          <p style={s.subtitle}>Takes less than a minute.</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Full name</label>
              <input name="name" placeholder="Jordan Patel" value={form.name} onChange={handleChange} style={s.input} required autoFocus />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} style={s.input} required />
            </div>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account? <Link to="/login" state={location.state} style={s.link}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 56px)', display: 'flex' },
  panel: { flex: '1 1 45%', background: 'var(--nav-bg)', alignItems: 'center', padding: '60px' },
  panelText: { maxWidth: '420px' },
  panelTitle: { fontFamily: "'Source Serif 4', serif", fontSize: '2.4rem', color: 'var(--nav-text)', marginBottom: '14px' },
  panelSub: { color: 'var(--nav-text-dim)', fontSize: '1.05rem', lineHeight: '1.6' },
  formSide: { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card: { width: '100%', maxWidth: '380px' },
  title: { fontFamily: "'Source Serif 4', serif", fontSize: '1.7rem', color: 'var(--text)', marginBottom: '6px' },
  subtitle: { color: 'var(--text-faint)', fontSize: '0.92rem', marginBottom: '26px' },
  error: { background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 13px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.87rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-soft)' },
  input: { padding: '10px 13px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: '8px', fontSize: '0.92rem', outline: 'none' },
  btn: { padding: '11px', background: 'var(--primary)', color: 'var(--primary-text-on)', border: 'none', borderRadius: '8px', fontSize: '0.94rem', fontWeight: 600, marginTop: '4px' },
  footer: { textAlign: 'center', marginTop: '22px', color: 'var(--text-faint)', fontSize: '0.88rem' },
  link: { color: 'var(--primary)', fontWeight: 600 },
};

export default Register;
