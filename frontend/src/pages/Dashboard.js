import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function StatCard({ label, value, hint }) {
  return (
    <div style={s.statCard}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
      {hint && <div style={s.statHint}>{hint}</div>}
    </div>
  );
}

function timeOfDayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('events');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch(() => { setError('Could not load your dashboard. Try refreshing.'); setLoading(false); });
  }, [user]);

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(prev => ({
        ...prev,
        myEvents: prev.myEvents.filter(e => e._id !== id),
        totalEventsCreated: prev.totalEventsCreated - 1,
      }));
    } catch { alert('Could not delete the event. Try again.'); }
  };

  const handleCancelReg = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/registrations/${regId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(prev => ({
        ...prev,
        myRegistrations: prev.myRegistrations.filter(r => r._id !== regId),
        totalRegistrations: prev.totalRegistrations - 1,
      }));
    } catch { alert('Could not cancel the registration. Try again.'); }
  };

  if (loading) return <div style={s.center}><p style={{ color: 'var(--text-faint)' }}>Loading your dashboard…</p></div>;
  if (error) return <div style={s.center}><p style={{ color: 'var(--danger)' }}>{error}</p></div>;

  const isEmpty = data.totalEventsCreated === 0 && data.totalRegistrations === 0;
  const firstName = user.name.split(' ')[0];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>{timeOfDayGreeting()}, {firstName}.</h1>
        <p style={s.subtitle}>Here's what's happening with your events.</p>
      </div>

      <div style={s.statsGrid}>
        <StatCard label="Events you've created" value={data.totalEventsCreated} />
        <StatCard label="Events you're attending" value={data.totalRegistrations} />
        <StatCard label="Total people registered" value={data.totalAttendees} hint="across your events" />
      </div>

      {isEmpty ? (
        <div style={s.emptyState}>
          <h3 style={s.emptyTitle}>Nothing here yet</h3>
          <p style={s.emptyText}>Create an event to get started. If someone sends you a link to their event, open it and you'll see it here too.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <Link to="/create-event" style={s.createBtn}>Create an event</Link>
          </div>
        </div>
      ) : (
        <>
          <div style={s.tabs}>
            <button style={{ ...s.tab, ...(tab === 'events' ? s.activeTab : {}) }} onClick={() => setTab('events')}>
              My events <span style={s.tabCount}>{data.myEvents.length}</span>
            </button>
            <button style={{ ...s.tab, ...(tab === 'registrations' ? s.activeTab : {}) }} onClick={() => setTab('registrations')}>
              My registrations <span style={s.tabCount}>{data.myRegistrations.length}</span>
            </button>
          </div>

          {tab === 'events' && (
            data.myEvents.length === 0 ? (
              <div style={s.emptyTab}>
                <p>You haven't created any events yet.</p>
                <Link to="/create-event" style={s.createBtn}>Create an event</Link>
              </div>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Event</th>
                      <th style={s.th}>Date</th>
                      <th style={s.th}>Location</th>
                      <th style={s.th}>Registered</th>
                      <th style={s.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.myEvents.map(ev => (
                      <tr key={ev._id} style={s.tr}>
                        <td style={s.td}>
                          <Link to={`/events/${ev._id}`} style={s.rowLink}>{ev.title}</Link>
                        </td>
                        <td style={s.td}>{new Date(ev.date).toLocaleDateString()}</td>
                        <td style={s.td}>{ev.location}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(ev.registeredCount >= ev.capacity ? s.badgeFull : s.badgeOpen) }}>
                            {ev.registeredCount} / {ev.capacity}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Link to={`/edit-event/${ev._id}`} style={s.editBtn}>Edit</Link>
                            <button onClick={() => handleDeleteEvent(ev._id)} style={s.deleteBtn}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === 'registrations' && (
            data.myRegistrations.length === 0 ? (
              <div style={s.emptyTab}>
                <p>You haven't registered for anything yet. Open a share link someone sends you to join their event.</p>
              </div>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Event</th>
                      <th style={s.th}>Date</th>
                      <th style={s.th}>Location</th>
                      <th style={s.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.myRegistrations.map(reg => (
                      <tr key={reg._id} style={s.tr}>
                        <td style={s.td}>
                          <Link to={`/events/${reg.event?._id}`} style={s.rowLink}>
                            {reg.event?.title || 'Event no longer exists'}
                          </Link>
                        </td>
                        <td style={s.td}>{reg.event ? new Date(reg.event.date).toLocaleDateString() : '—'}</td>
                        <td style={s.td}>{reg.event?.location || '—'}</td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleCancelReg(reg._id)} style={s.deleteBtn}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '40px 24px 60px' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' },
  header: { marginBottom: '28px' },
  title: { fontFamily: "'Source Serif 4', serif", fontSize: '1.7rem', color: 'var(--text)' },
  subtitle: { color: 'var(--text-faint)', marginTop: '4px', fontSize: '0.92rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '14px', marginBottom: '30px' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px' },
  statValue: { fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontSize: '0.84rem', color: 'var(--text-soft)', marginTop: '2px' },
  statHint: { fontSize: '0.76rem', color: 'var(--text-faint)', marginTop: '2px' },
  emptyState: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '56px 24px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Source Serif 4', serif", fontSize: '1.25rem', color: 'var(--text)' },
  emptyText: { color: 'var(--text-faint)', marginTop: '6px', fontSize: '0.92rem' },
  emptyTab: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '36px', textAlign: 'center', color: 'var(--text-faint)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '14px', borderBottom: '1px solid var(--border)' },
  tab: { padding: '9px 4px', marginRight: '20px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '6px' },
  activeTab: { color: 'var(--text)', borderBottom: '2px solid var(--primary)' },
  tabCount: { background: 'var(--surface-raised)', color: 'var(--text-faint)', borderRadius: '10px', padding: '1px 7px', fontSize: '0.74rem', fontWeight: 600 },
  tableWrap: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '13px 16px', fontSize: '0.88rem', color: 'var(--text-soft)' },
  rowLink: { color: 'var(--text)', fontWeight: 600 },
  badge: { padding: '2px 9px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 },
  badgeOpen: { background: 'var(--success-soft)', color: 'var(--success)' },
  badgeFull: { background: 'var(--danger-soft)', color: 'var(--danger)' },
  createBtn: { background: 'var(--primary)', color: 'var(--primary-text-on)', padding: '9px 18px', borderRadius: '7px', fontWeight: 600, fontSize: '0.87rem', border: 'none', cursor: 'pointer', display: 'inline-block' },
  editBtn: { background: 'transparent', color: 'var(--text-soft)', border: '1px solid var(--border)', padding: '5px 11px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem' },
  deleteBtn: { background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger-soft)', padding: '5px 11px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' },
};

export default Dashboard;
