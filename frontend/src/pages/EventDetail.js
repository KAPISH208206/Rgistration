import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [regCount, setRegCount] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/events/${id}`, authHeader)
      .then(({ data }) => { setEvent(data); setLoading(false); })
      .catch(() => { setError('That event could not be found.'); setLoading(false); });
    axios.get(`${process.env.REACT_APP_API_URL}/events/${id}/count`, authHeader)
      .then(({ data }) => setRegCount(data.count))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/shared/${event.shareToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegister = async () => {
    setMessage(''); setError(''); setRegLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/registrations`, { eventId: id }, authHeader);
      setMessage("You're registered.");
      setRegCount(c => c + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete registration.');
    } finally { setRegLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/events/${id}`, authHeader);
      navigate('/dashboard');
    } catch { setError('Could not delete the event.'); }
  };

  if (loading) return <div style={s.center}><p style={{ color: 'var(--text-faint)' }}>Loading…</p></div>;
  if (!event) return (
    <div style={s.center}>
      <p style={{ color: 'var(--danger)' }}>{error}</p>
      <Link to="/events" style={{ color: 'var(--primary)', marginTop: '10px', display: 'block' }}>← Back to events</Link>
    </div>
  );

  const isOwner = event.createdBy?._id === user._id;
  const isPast = new Date(event.date) < new Date();
  const isFull = regCount >= event.capacity;

  return (
    <div style={s.page}>
      <Link to="/events" style={s.backLink}>← Back to events</Link>

      <div style={s.headRow}>
        <div>
          <div style={s.dateLine}>
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {isPast && <span style={s.pastBadge}>Past event</span>}
          </div>
          <h1 style={s.eventTitle}>{event.title}</h1>
          <p style={s.organizer}>Hosted by {event.createdBy?.name}</p>
        </div>
      </div>

      <div style={s.metaRow}>
        <div style={s.metaItem}>
          <div style={s.metaLabel}>Location</div>
          <div style={s.metaVal}>{event.location}</div>
        </div>
        <div style={s.metaItem}>
          <div style={s.metaLabel}>Registered</div>
          <div style={s.metaVal}>{regCount} of {event.capacity}</div>
        </div>
      </div>

      <div style={s.barWrap}>
        <div style={{ ...s.barFill, width: `${Math.min((regCount / event.capacity) * 100, 100)}%`, background: isFull ? 'var(--danger)' : 'var(--primary)' }} />
      </div>

      <div style={s.section}>
        <h3 style={s.sectionTitle}>About this event</h3>
        <p style={s.desc}>{event.description}</p>
      </div>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.actions}>
        {!isOwner && !isPast && (
          <button onClick={handleRegister} disabled={isFull || regLoading} style={{ ...s.registerBtn, opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}>
            {regLoading ? 'Registering…' : isFull ? 'Event is full' : 'Register for this event'}
          </button>
        )}
        {isPast && !isOwner && <p style={s.pastNote}>This event has already taken place.</p>}
        {isOwner && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleCopyLink} style={s.shareBtn}>
              {copied ? 'Link copied' : 'Copy share link'}
            </button>
            <Link to={`/edit-event/${id}`} style={s.editBtn}>Edit event</Link>
            <button onClick={handleDelete} style={s.deleteBtn}>Delete event</button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: '700px', margin: '0 auto', padding: '32px 24px 60px' },
  center: { textAlign: 'center', padding: '60px 0' },
  backLink: { color: 'var(--text-faint)', fontSize: '0.86rem', display: 'inline-block', marginBottom: '20px' },
  headRow: { marginBottom: '20px' },
  dateLine: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '10px' },
  pastBadge: { background: 'var(--surface-raised)', color: 'var(--text-faint)', padding: '2px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  eventTitle: { fontFamily: "'Source Serif 4', serif", fontSize: '1.9rem', color: 'var(--text)', margin: '8px 0 6px' },
  organizer: { color: 'var(--text-faint)', fontSize: '0.9rem' },
  metaRow: { display: 'flex', gap: '32px', marginBottom: '14px', flexWrap: 'wrap' },
  metaItem: {},
  metaLabel: { fontSize: '0.74rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 },
  metaVal: { fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600, marginTop: '2px' },
  barWrap: { height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '28px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.4s' },
  section: { marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' },
  sectionTitle: { fontWeight: 700, color: 'var(--text)', marginBottom: '8px', fontSize: '0.95rem' },
  desc: { color: 'var(--text-soft)', lineHeight: '1.7', fontSize: '0.93rem' },
  success: { background: 'var(--success-soft)', color: 'var(--success)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, fontSize: '0.88rem' },
  errorBox: { background: 'var(--danger-soft)', color: 'var(--danger)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' },
  registerBtn: { padding: '11px 24px', background: 'var(--primary)', color: 'var(--primary-text-on)', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem' },
  shareBtn: { padding: '9px 16px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '7px', fontWeight: 600, border: '1px solid var(--primary-soft)', fontSize: '0.86rem', cursor: 'pointer' },
  editBtn: { padding: '9px 16px', background: 'transparent', color: 'var(--text-soft)', borderRadius: '7px', fontWeight: 600, border: '1px solid var(--border)', fontSize: '0.86rem' },
  deleteBtn: { padding: '9px 16px', background: 'transparent', color: 'var(--danger)', borderRadius: '7px', fontWeight: 600, border: '1px solid var(--danger-soft)', cursor: 'pointer', fontSize: '0.86rem' },
  pastNote: { color: 'var(--text-faint)', fontSize: '0.88rem', fontStyle: 'italic' },
};

export default EventDetail;
