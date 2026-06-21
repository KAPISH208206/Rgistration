import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Landing page for anyone who opens an event's share link.
// Works for the event's own creator, someone already registered,
// or a complete stranger who was just sent the link — that's the point.
function SharedEvent() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/events/shared/${token}`, authHeader)
      .then(({ data }) => { setEvent(data); setLoading(false); })
      .catch((err) => {
        setError(err.response?.data?.message || 'This link is invalid or the event was deleted.');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRegister = async () => {
    setMessage(''); setError(''); setRegLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/registrations`, { eventId: event._id }, authHeader);
      setMessage("You're registered. You'll find this event in your dashboard from now on.");
      setEvent(e => ({ ...e, registeredCount: e.registeredCount + 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete registration.');
    } finally { setRegLoading(false); }
  };

  if (loading) return <div style={s.center}><p style={{ color: 'var(--text-faint)' }}>Loading…</p></div>;
  if (!event) return (
    <div style={s.center}>
      <p style={{ color: 'var(--danger)' }}>{error}</p>
      <Link to="/dashboard" style={{ color: 'var(--primary)', marginTop: '10px', display: 'block' }}>← Go to dashboard</Link>
    </div>
  );

  const isOwner = event.createdBy?._id === user._id;
  const isPast = new Date(event.date) < new Date();
  const isFull = event.registeredCount >= event.capacity;

  return (
    <div style={s.page}>
      <div style={s.inviteNote}>You were sent a link to this event.</div>

      <div style={s.dateLine}>
        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        {isPast && <span style={s.pastBadge}>Past event</span>}
      </div>
      <h1 style={s.eventTitle}>{event.title}</h1>
      <p style={s.organizer}>Hosted by {event.createdBy?.name}</p>

      <div style={s.metaRow}>
        <div>
          <div style={s.metaLabel}>Location</div>
          <div style={s.metaVal}>{event.location}</div>
        </div>
        <div>
          <div style={s.metaLabel}>Registered</div>
          <div style={s.metaVal}>{event.registeredCount} of {event.capacity}</div>
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.sectionTitle}>About this event</h3>
        <p style={s.desc}>{event.description}</p>
      </div>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.actions}>
        {isOwner ? (
          <Link to={`/events/${event._id}`} style={s.registerBtn}>Go to your event</Link>
        ) : isPast ? (
          <p style={s.pastNote}>This event has already taken place.</p>
        ) : (
          <button onClick={handleRegister} disabled={isFull || regLoading} style={{ ...s.registerBtn, opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}>
            {regLoading ? 'Registering…' : isFull ? 'Event is full' : 'Register for this event'}
          </button>
        )}
        <button onClick={() => navigate('/dashboard')} style={s.dashLink}>Go to dashboard</button>
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px 60px' },
  center: { textAlign: 'center', padding: '60px 0' },
  inviteNote: { display: 'inline-block', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '18px' },
  dateLine: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '10px' },
  pastBadge: { background: 'var(--surface-raised)', color: 'var(--text-faint)', padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  eventTitle: { fontFamily: "'Source Serif 4', serif", fontSize: '1.9rem', color: 'var(--text)', margin: '8px 0 6px' },
  organizer: { color: 'var(--text-faint)', fontSize: '0.9rem', marginBottom: '20px' },
  metaRow: { display: 'flex', gap: '32px', marginBottom: '14px', flexWrap: 'wrap' },
  metaLabel: { fontSize: '0.74rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 },
  metaVal: { fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600, marginTop: '2px' },
  section: { marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' },
  sectionTitle: { fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontSize: '0.95rem' },
  desc: { color: 'var(--text-soft)', lineHeight: '1.7', fontSize: '0.93rem' },
  success: { background: 'var(--success-soft)', color: 'var(--success)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, fontSize: '0.88rem' },
  errorBox: { background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' },
  registerBtn: { padding: '11px 24px', background: 'var(--primary)', color: 'var(--primary-text-on)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem' },
  dashLink: { padding: '11px 16px', background: 'transparent', color: 'var(--text-soft)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' },
  pastNote: { color: 'var(--text-faint)', fontSize: '0.88rem', fontStyle: 'italic' },
};

export default SharedEvent;
