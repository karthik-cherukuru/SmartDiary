# SmartDiary — Frontend

> **A mood-aware, AI-powered journaling web application** that classifies your emotions in real time and adapts its entire visual environment to match — or therapeutically counter — how you feel.

🌐 **Live App:** [smart-diary-sooty.vercel.app](https://smart-diary-sooty.vercel.app)
🔧 **Backend Repo:** [github.com/karthik-cherukuru/SmartDiaryBackend](https://github.com/karthik-cherukuru/SmartDiaryBackend)

---

## What is Smart Diary?

Smart Diary is a full-stack journaling platform where every entry you save is silently analysed by a locally-running AI (Gemma 2 2B via Ollama). The detected emotion then drives two things simultaneously: your **streak** gets updated, and the entire UI shifts into a new colour theme — either *Associative* (mirrors your emotion) or *Corrective* (a therapeutic counter-palette to gently shift your mood).

On top of that, a contextual AI chatbot (Groq × Llama 4 Scout) is always one tap away, pre-loaded with what you just wrote so it can respond with genuine empathy rather than generic replies.

---

## Features

| Feature | Description |
|---|---|
| 🔐 **Google OAuth** | One-click sign-in via Supabase Auth — no passwords |
| ✍️ **Distraction-free writing** | Fullscreen textarea, zero chrome, real-time word count |
| 🧠 **On-device emotion AI** | Gemma 2 2B classifies every entry into one of 7 emotion labels |
| 🎨 **Adaptive theming** | Associative Mode (reflects emotion) + Corrective Mode (counter-palette) |
| 🔥 **Streak tracking** | Consecutive-day streaks with freeze-token protection for missed days |
| 🤖 **AI chatbot companion** | Context-aware Groq chatbot pre-loaded with your journal entry |
| 📊 **Analytics dashboard** | Mood timeline, emotion frequency donut, balance chart, calendar heatmap |
| 👤 **Profile management** | Display name, avatar upload, lifetime stats, full account deletion |

**Emotion labels:** `joy` · `sadness` · `anger` · `fear` · `disgust` · `surprise` · `neutral`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Routing | React Router v6 |
| Auth / DB / Storage | Supabase JS Client |
| Confetti | canvas-confetti |
| AI Chatbot | Groq API (Llama 4 Scout) via Supabase Edge Function |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── config/
│   └── supabase.js          # Supabase client initialisation
├── context/
│   ├── AuthContext.jsx       # Session management via onAuthStateChange
│   └── ThemeContext.jsx      # CSS variable injection for adaptive theming
├── services/
│   ├── emotionService.js     # POST to /classify on the backend tunnel URL
│   ├── chatbotService.js     # Invokes Supabase chat-proxy Edge Function
│   ├── journalService.js     # Supabase CRUD for journal entries
│   └── streakService.js      # Streak logic + milestone detection
├── data/
│   ├── themes.js             # Emotion → Associative / Corrective CSS palettes
│   └── quotes.js             # Motivational quotes for empty states
├── components/               # Shared UI: layout, cards, chatbot drawer, etc.
└── pages/                    # Landing, Onboarding, Dashboard, Journal, Analytics, Profile
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A running instance of the [Smart Diary Backend](https://github.com/karthik-cherukuru/SmartDiaryBackend) (Express + Ollama + Cloudflare Tunnel)
- A Supabase project configured with the correct schema, RLS policies, storage bucket, and the `chat-proxy` Edge Function

### 1 — Clone and install

```bash
git clone https://github.com/karthik-cherukuru/SmartDiary.git
cd SmartDiary
npm install
```

### 2 — Configure environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_EMOTION_API_URL=https://your-cloudflare-tunnel-url.trycloudflare.com
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `VITE_EMOTION_API_URL` | Printed in the terminal when you start `cloudflared tunnel` |

> ⚠️ The tunnel URL changes every time `cloudflared` is restarted. Update this variable each time.

### 3 — Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4 — Make sure the backend is running

The emotion classifier won't work without the Express + Ollama backend running locally and exposed via Cloudflare Tunnel. See the [Backend README](https://github.com/karthik-cherukuru/SmartDiaryBackend) for full setup instructions.

---

## Supabase Setup

The app requires the following Supabase configuration before it will work correctly:

**Database tables** (with RLS enabled on all):
- `profiles` — auto-created via trigger on `auth.users` insert
- `journal_entries`
- `streaks`
- `chat_messages`

**Storage bucket:**
- `avatars` — with an INSERT policy scoped to `auth.uid() = owner`

**Edge Function:**
- `chat-proxy` — Deno function proxying requests to Groq; requires `GROQ_API_KEY` set as a Supabase secret

---

## Deploying to Vercel

```bash
npm run build
```

Or connect the GitHub repo to Vercel for automatic deployments. Add all three environment variables in the Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EMOTION_API_URL`

Also add your Vercel production URL (`https://your-app.vercel.app`) as an **authorised redirect URI** in the Google Cloud Console OAuth client.

---

## How the Theming Works

Every time a journal entry is saved, the detected emotion triggers a theme switch via `ThemeContext`. Two modes are available:

- **Associative Mode** — the palette mirrors the detected emotion (e.g. warm gold for `joy`, deep red for `anger`)
- **Corrective Mode** — a therapeutic counter-palette is applied (e.g. cool teal to calm `anger`, warm peach to lift `sadness`)

Themes are fully data-driven — all palettes live in `src/data/themes.js` as CSS variable maps applied to `:root`.

---

## Related

- 🔧 [SmartDiaryBackend](https://github.com/karthik-cherukuru/SmartDiaryBackend) — Express + Ollama emotion classification service

---

*SRM University-AP · B.Tech Computing Technologies · 2025–2026*
