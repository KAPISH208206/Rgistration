import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const THEME_META = {
  light:   { icon: '☀', label: 'Light' },
  evening: { icon: '◐', label: 'Evening' },
  dark:    { icon: '☾', label: 'Dark' },
};

function ThemeSwitch() {
  const { theme, setTheme, THEMES } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={s.themeWrap}>
      <button onClick={() => setOpen(!open)} style={s.themeBtn} aria-label="Change theme" title="Change theme">
        <span style={{ fontSize: '0.95rem' }}>{THEME_META[theme].icon}</span>
      </button>
      {open && (
        <div style={s.themeMenu}>
          {THEMES.map(t => (
            <div
              key={t}
              onClick={() => { setTheme(t); setOpen(false); }}
              style={{ ...s.themeOption, ...(t === theme ? s.themeOptionActive : {}) }}
            >
              <span style={{ width: '16px', display: 'inline-block' }}>{THEME_META[t].icon}</span>
              {THEME_META[t].label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  // Public auth pages get a minimal navbar
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav style={s.nav}>
      <Link to={user ? '/dashboard' : '/login'} style={s.brand}>
        Roundtable
      </Link>

      {!isAuthPage && user && (
        <div style={s.links}>
          <Link to="/events" style={{ ...s.link, ...(isActive('/events') ? s.activeLink : {}) }}>Events</Link>
          <Link to="/dashboard" style={{ ...s.link, ...(isActive('/dashboard') ? s.activeLink : {}) }}>Dashboard</Link>
        </div>
      )}

      <div style={s.right}>
        <ThemeSwitch />

        {!isAuthPage && user && (
          <>
            <Link to="/create-event" style={s.createBtn}>New event</Link>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <div style={s.avatar} onClick={() => setMenuOpen(!menuOpen)}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {menuOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropName}>{user.name}</div>
                  <div style={s.dropEmail}>{user.email}</div>
                  <div style={s.dropDivider} />
                  <Link to="/dashboard" style={s.dropItem} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <div style={{ ...s.dropItem, color: 'var(--danger)' }} onClick={handleLogout}>
                    Log out
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!isAuthPage && !user && (
          <>
            <Link to="/login" style={s.loginBtn}>Log in</Link>
            <Link to="/register" style={s.registerBtn}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '56px', background: 'var(--nav-bg)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  brand: { color: 'var(--nav-text)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em', fontFamily: "'Source Serif 4', serif" },
  links: { display: 'flex', gap: '2px' },
  link: { color: 'var(--nav-text-dim)', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, fontSize: '0.88rem' },
  activeLink: { color: 'var(--nav-text)', background: 'rgba(255,255,255,0.08)' },
  right: { display: 'flex', alignItems: 'center', gap: '10px' },
  createBtn: { background: 'var(--primary)', color: 'var(--primary-text-on)', padding: '7px 14px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' },
  loginBtn: { color: 'var(--nav-text-dim)', padding: '6px 12px', borderRadius: '6px', fontWeight: 500, fontSize: '0.85rem' },
  registerBtn: { background: 'var(--primary)', color: 'var(--primary-text-on)', padding: '7px 14px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-text-on)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' },
  dropdown: { position: 'absolute', top: '40px', right: 0, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow-raised)', padding: '10px', minWidth: '190px', zIndex: 200 },
  dropName: { fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', padding: '2px 8px' },
  dropEmail: { fontSize: '0.78rem', color: 'var(--text-faint)', padding: '0 8px 6px' },
  dropDivider: { height: '1px', background: 'var(--border)', margin: '4px 0' },
  dropItem: { display: 'block', padding: '7px 8px', fontSize: '0.86rem', color: 'var(--text-soft)', borderRadius: '6px', cursor: 'pointer' },
  themeWrap: { position: 'relative' },
  themeBtn: { width: '30px', height: '30px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  themeMenu: { position: 'absolute', top: '38px', right: 0, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow-raised)', padding: '6px', minWidth: '130px', zIndex: 200 },
  themeOption: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', fontSize: '0.85rem', color: 'var(--text-soft)', borderRadius: '6px', cursor: 'pointer' },
  themeOptionActive: { background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 600 },
};

export default Navbar;
