# Deployment Guide

Your code was already written correctly — it uses `process.env.REACT_APP_API_URL`
everywhere instead of a hardcoded `localhost:5000`. The "localhost:5000 error" you
saw on Vercel happened because that environment variable was never set there, so
every API call was going to nowhere. This guide fixes that, in the right order.

**Deploy in this order: Atlas → Render (backend) → Vercel (frontend) → back to Render.**

---

## 1. MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas if you haven't.
2. Database Access → add a database user (username + password).
3. Network Access → add IP `0.0.0.0/0` (allow access from anywhere) — required
   since Render's IPs aren't static.
4. Get your connection string (Connect → Drivers): it looks like
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/event_registration?retryWrites=true&w=majority`

## 2. Backend on Render

1. Push this project to a GitHub repo.
2. On Render: New → Web Service → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment → add these variables:
   - `MONGO_URI` = your Atlas connection string from step 1
   - `JWT_SECRET` = any long random string
   - `FRONTEND_URL` = leave blank for now, you'll fill this in after step 3
   - (Don't set `PORT` — Render provides it automatically.)
5. Deploy. Once live, copy your backend URL, e.g. `https://your-backend.onrender.com`.
6. Sanity check: visit `https://your-backend.onrender.com/` — you should see
   `{"message":"Event Registration API"}`.

> Render free-tier services sleep after inactivity — the first request after
> a while can take ~30-60s to wake up. That's normal, not a bug.

## 3. Frontend on Vercel

1. On Vercel: Add New → Project → import the same repo.
2. **Root Directory:** `frontend`
3. Framework Preset: Create React App (should auto-detect).
4. Settings → Environment Variables → add:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
     (use your real Render URL from step 2, include `/api`, no trailing slash)
5. Deploy. Copy your frontend URL, e.g. `https://your-app.vercel.app`.

**Important:** `REACT_APP_*` variables are baked in at build time. If you ever
change `REACT_APP_API_URL` later, you must trigger a new deploy (redeploy) —
just saving the env var isn't enough.

## 4. Connect them: update CORS on Render

1. Go back to your Render backend → Environment.
2. Set `FRONTEND_URL` = `https://your-app.vercel.app` (your real Vercel URL,
   no trailing slash).
3. Save — Render will redeploy automatically.

This step matters: without it, the backend's CORS check will reject requests
from your Vercel domain and you'll see "Network Error" or CORS errors in the
browser console even though the URL itself is correct.

---

## Local development (unaffected by the above)

Backend:
```bash
cd backend
cp .env.example .env
# edit .env if needed (e.g. point MONGO_URI at Atlas or local Mongo)
npm install
npm run dev
```

Frontend:
```bash
cd frontend
cp .env.example .env.local
npm install
npm start
```

## Troubleshooting checklist

- **Still seeing localhost:5000 in production?** You forgot to redeploy after
  setting `REACT_APP_API_URL` on Vercel, or it's set on the wrong environment
  (Production vs Preview) — set it for both.
- **CORS error in browser console?** `FRONTEND_URL` on Render doesn't exactly
  match your Vercel URL (check for trailing slash, http vs https, www vs no-www).
- **Network error / can't reach backend at all?** Render free tier may just be
  waking up from sleep — wait ~30s and retry. Also confirm the Render URL
  itself loads in a browser.
- **401/auth errors only:** check `JWT_SECRET` is set on Render.
- **Mongo connection errors on Render logs:** check Atlas Network Access allows
  `0.0.0.0/0`, and that `MONGO_URI` has the right username/password (and that
  the password is URL-encoded if it contains special characters).
