# Roundtable — Event Registration System (MERN)

An event registration system with authentication, a personal dashboard, three color themes, and **private-by-default events with shareable invite links**. Built with MongoDB, Express, React, and Node.js.

---

## What changed in this version

**Privacy fix:** previously, every logged-in user could see every event from every other user — a brand-new account would immediately see events it had nothing to do with. That's fixed:

- `GET /api/events` now returns only events the logged-in user **created** or is **registered for**. Nobody else's events appear, ever, by default.
- `GET /api/events/:id` and `GET /api/events/:id/count` return `403 Not authorized` if you try to view an event you have no relationship to — even with a valid login, even if you guess or enumerate an event ID.
- A brand-new account starts with a completely empty events list, exactly as expected from a private planner.

**Share links, so events aren't a dead end:** since hiding everything by default removes any way to discover or join someone else's event, each event now has a random, unguessable `shareToken`. The event's creator can copy a share link (`/shared/<token>`) from the event page and send it to anyone. Whoever opens that link — logged in, even a fresh account — can view the event and register, *without* it appearing in their general events list until they actually register. Once they register, it shows up in their dashboard/events list like any event they're part of.

- `GET /api/events/shared/:token` — works for any authenticated user with the right token, regardless of whether they created or joined the event yet.
- If someone opens a share link while logged out (or before they have an account), the app remembers where they were headed, sends them through Login/Register, and lands them back on the event afterward.

---

## Project Structure

```
event-registration/
├── backend/
│   ├── models/       # User, Event (now includes shareToken), Registration
│   ├── routes/       # auth, events, registrations, dashboard
│   ├── middleware/   # JWT auth guard (protect)
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── context/  # AuthContext (session), ThemeContext (light/evening/dark)
        ├── components/ # Navbar, RequireAuth (route guard)
        └── pages/    # Login, Register, EventList, EventDetail, EventForm, Dashboard, SharedEvent
```

---

## Prerequisites

- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

---

## Backend Setup

```bash
cd backend
npm install
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/event_registration
JWT_SECRET=change_this_to_something_secret
```

Start the server:
```bash
npm start
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Runs at `http://localhost:3000`, talks to the backend at `http://localhost:5000`.

---

## How it works

1. **Sign up or log in** at `/login` or `/register`. A JWT is stored in `localStorage` so you stay signed in across refreshes.
2. You land on **Dashboard** (`/dashboard`):
   - Three numbers: events you've created, events you're attending, total people registered across your events.
   - **My events** tab — table of events you created, with registered/capacity, Edit, and Delete.
   - **My registrations** tab — events you've signed up for, with Cancel.
   - First time with nothing yet, you get a plain message and a single "Create an event" button.
3. **Events** (`/events`) — your own events (created or joined), searchable by name or location. This is private to you.
4. **Event detail** (`/events/:id`) — date, location, live registered/capacity count with a progress bar, and a Register button (disabled once full). If you're the owner, you'll also see **Copy share link**.
5. **Sharing** — click "Copy share link" on an event you created, and send the link to whoever you want to invite. They open `/shared/<token>`, log in or sign up if needed, and can register from there. Once registered, the event appears in their own Dashboard/Events page too.
6. **Theme toggle** — the icon in the top right cycles Light → Evening → Dark and remembers your choice.

---

## API Endpoints

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |

### Events — all require a valid token; visibility is scoped per user
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | /api/events | Only events you created or are registered for |
| GET | /api/events/:id | 403 if you have no relationship to this event |
| GET | /api/events/:id/count | Same visibility rule as above |
| GET | /api/events/shared/:token | Works for anyone logged in who has the link |
| POST | /api/events | Create (generates a shareToken automatically) |
| PUT | /api/events/:id | Owner only |
| DELETE | /api/events/:id | Owner only |

### Registrations — all require a valid token
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | /api/registrations | Takes any valid eventId — having the ID (e.g. from a share link) is the authorization |
| GET | /api/registrations/my | |
| DELETE | /api/registrations/:id | |

### Dashboard
| Method | Endpoint |
|--------|----------|
| GET | /api/dashboard |

---

## Testing

`backend/test-server.js` is a self-contained script (mocked in-memory models, no real DB needed) that exercises every endpoint. It includes a dedicated regression test for the exact bug reported in this version: a brand-new user must see an empty events list even after another user has created events, and direct access to someone else's event by ID must return 403 unless they have the share link. Run it with:

```bash
cd backend
node test-server.js
```

It is excluded from the production zip — it's a dev tool, not part of the deployed app.

