# ReplyPilot Website — Full-Stack (Next.js)

Corporate-style website for ReplyPilot (AI automation studio) with:

- **Frontend** — AKI-style corporate design (Next.js + React), fully responsive
  (desktop / tablet / mobile)
- **Contact form** — one-tap submit, saves to the database (no email app needed)
- **Database** — Supabase Postgres, free tier (`leads` table + Row Level Security)
- **Admin login** — `/admin/login` → `/admin` leads dashboard
- **AI agent** — floating chat widget that answers *as ReplyPilot*
  (Google Gemini free tier)

## What you need (all free, ~20 minutes)

### 1. Supabase — database + login (free)

1. Go to https://supabase.com and create a free account + new project.
2. In the project: **SQL Editor → New query** — paste the whole contents of
   `supabase/schema.sql` and press **Run**. (Creates the `leads` table + security rules.)
3. **Authentication → Users → Add user → Create new user** — enter your email
   and a password. This is your **admin login** for `/admin`.
4. **Project Settings → API** — copy the **Project URL** and the
   **anon public** key.

### 2. Gemini — AI agent key (free)

1. Go to https://aistudio.google.com/apikey and create a free API key.
2. (Optional — the site works without it; the chat shows a polite fallback.)

### 3. Run locally (optional)

```bash
cp .env.example .env.local
# fill in the three values in .env.local
npm install
npm run dev
# open http://localhost:3000
```

### 4. Go live on Vercel (free)

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com → **Add New → Project** → import the repo.
3. In **Environment Variables** add the same three values from `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.
4. **Deploy.** Done — your site is live.

## Key pages & routes

| Route            | What it is                                    |
| ---------------- | --------------------------------------------- |
| `/`              | The corporate website + contact form + AI chat |
| `/admin/login`   | Admin sign-in (email + password)               |
| `/admin`         | Leads dashboard (newest enquiries first)       |
| `/api/leads`     | POST — validates + saves a contact enquiry     |
| `/api/chat`      | POST — ReplyPilot AI agent replies             |

## Security notes

- The contact form has a honeypot field + server-side validation.
- Rate limiting on the API routes (5 form submits/min, 30 chat messages/min per IP).
- Security headers on every response (nosniff, DENY framing, strict referrer).
- Database Row Level Security: the public site key can only **insert** leads;
  only the logged-in admin can **read** them.
- `/admin` is protected by `proxy.ts` (redirects to login when signed out).
- Never expose the Supabase **service_role** key — this project doesn't need it.
