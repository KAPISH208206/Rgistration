import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EventCard({ event }) {
  const isPast = new Date(event.date) < new Date();
  return (
    <Link to={`/events/${event._id}`} style={s.card}>
      <div style={s.cardHead}>
        <div>
          <div style={s.cardDate}>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <h3 style={s.cardTitle}>{event.title}</h3>
        </div>
        {isPast && <span style={s.pastBadge}>Past</span>}
      </div>
      <p style={s.cardMeta}>{event.location}</p>
      <p style={s.cardDesc}>
        {event.description.length > 110 ? event.description.slice(0, 110) + '…' : event.description}
      </p>
      <div style={s.cardFoot}>
        <span style={s.cardCapacity}>Capacity {event.capacity}</span>
        <span style={s.cardArrow}>View details →</span>
      </div>
    </Link>
  );
}

function EventList() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/events`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(({ data }) => { setEvents(data); setFiltered(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(events.filter(e =>
      e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
    ));
  }, [search, events]);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Events</h1>
          <p style={s.subtitle}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}{search ? ' matching your search' : " you've created or joined"}
          </p>
        </div>
        <Link to="/create-event" style={s.createBtn}>Create event</Link>
      </div>

      <input
        placeholder="Search by name or location"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={s.search}
      />

      {loading ? (
        <div style={s.center}><p style={{ color: 'var(--text-faint)' }}>Loading…</p></div>
      ) : filtered.length === 0 ? (
        <div style={s.center}>
          <p style={{ color: 'var(--text-faint)' }}>
            {search ? 'No events match that search.' : "Nothing here yet. Events you create or register for will show up on this page — they're private to you unless you share the link."}
          </p>
          {!search && <Link to="/create-event" style={{ ...s.createBtn, marginTop: '14px' }}>Create your first event</Link>}
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map(ev => <EventCard key={ev._id} event={ev} />)}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '40px 24px 60px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' },
  title: { fontFamily: "'Source Serif 4', serif", fontSize: '1.7rem', color: 'var(--text)' },
  subtitle: { color: 'var(--text-faint)', marginTop: '4px', fontSize: '0.9rem' },
  createBtn: { background: 'var(--primary)', color: 'var(--primary-text-on)', padding: '9px 18px', borderRadius: '7px', fontWeight: 600, fontSize: '0.87rem' },
  search: { width: '100%', padding: '11px 15px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', marginBottom: '26px' },
  center: { textAlign: 'center', padding: '60px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: '16px' },
  card: { display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', transition: 'border-color 0.15s' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' },
  cardDate: { fontSize: '0.76rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' },
  cardTitle: { fontSize: '1.02rem', fontWeight: 700, color: 'var(--text)', lineHeight: '1.35' },
  pastBadge: { background: 'var(--surface-raised)', color: 'var(--text-faint)', padding: '2px 9px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 600, whiteSpace: 'nowrap' },
  cardMeta: { fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '8px' },
  cardDesc: { fontSize: '0.86rem', color: 'var(--text-faint)', lineHeight: '1.55', marginBottom: '14px' },
  cardFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' },
  cardCapacity: { fontSize: '0.8rem', color: 'var(--text-faint)' },
  cardArrow: { fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 },
};

export default EventList;
