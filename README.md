# CR42 — AI Code Review Tool

> Your senior developer on-call 24/7. Instant bug detection, security analysis, quality scores, and auto-generated documentation.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS v3 + Framer Motion |
| Syntax Highlighting | react-syntax-highlighter (Prism VSC theme) |
| Backend | Node.js + Express |
| Database | PostgreSQL via Prisma ORM |
| Auth | Google OAuth 2.0 (Passport.js) + JWT |
| AI | OpenRouter → Gemini 2.0 Flash (JSON mode) |

## Quick Start

### 1. Clone and setup environment

```bash
# Server env
cp server/.env.example server/.env
# Edit server/.env with your values
```

### 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 3. Setup database

```bash
cd server
npx prisma db push     # dev: push schema directly
# OR
npx prisma migrate dev --name init  # production-safe migrations
```

### 4. Run dev servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Environment Variables (server/.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI (include in Google Console) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key ([openrouter.ai](https://openrouter.ai)) |
| `OPENROUTER_MODEL` | Default: `google/gemini-2.0-flash-001` |
| `FRONTEND_URL` | Frontend origin for CORS |

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client (Web application)
4. Add Authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (dev)
   - `https://your-backend.render.com/auth/google/callback` (prod)

## Deployment

- **Frontend**: Deploy `client/` to Vercel (`vercel.json` is pre-configured)
- **Backend**: Deploy `server/` to Render or Railway
- **Database**: Use Neon, Supabase, or Railway Postgres

## Features

- 🔍 **Bug Detection** — Line-level bug identification with severity ratings and fix suggestions
- 🛡️ **Security Scan** — 30+ vulnerability type detection (SQLi, XSS, IDOR, etc.)
- 📊 **Quality Scores** — Readability / Maintainability / Performance scores (0-100)
- 📝 **Auto Documentation** — JSDoc & Markdown docs generated instantly
- ✨ **Code Refactoring** — Full refactored version with all issues fixed
- 🔗 **GitHub URL Support** — Paste a GitHub file URL for instant review
- 📚 **Review History** — Full history with search, filter, and delete
