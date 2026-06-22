import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/dashboard';

  React.useEffect(() => {
    if (user) navigate(destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, form);
      login(data);
      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong logging you in.');
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
              ? "Someone sent you a link to an event. Log in to see it."
              : "Put together events. Keep track of who's coming. Nothing fancier than it needs to be."}
          </p>
        </div>
      </div>

      <div style={s.formSide}>
        <div style={s.card}>
          <h2 style={s.title}>Log in</h2>
          <p style={s.subtitle}>Welcome back — enter your details below.</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={s.input} required autoFocus />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} style={s.input} required />
            </div>
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p style={s.footer}>
            New here? <Link to="/register" state={location.state} style={s.link}>Create an account</Link>
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

export default Login;
