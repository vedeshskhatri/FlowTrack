# FlowTrack

A beautiful, minimalist workout planner and live tracker built with Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

---

## Features

- **Weekly Planner** — plan and review workouts week by week
- **Live Tracking** — real-time set/rep tracking with voice logging (Space bar shortcut)
- **Progress Charts** — volume trends, estimated 1RM, 35-day streak heatmap
- **AI Coach** — GPT-4o mini with full workout history context
- **CSV Import** — auto-applies progressive overload suggestions after parsing
- **Export** — download history as CSV or PDF
- **Dark mode** (default, togglable)
- **PWA** — installable on mobile from the browser
- **Progressive Overload Engine** — Epley formula, detects plateau after 2 perfect sessions
- **Cycle-aware planning** — reduces load during luteal phase

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Optional: OpenAI API key for the AI Coach

### 1. Clone and install

```bash
git clone <your-repo-url>
cd flowtrack
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run the contents of `supabase/schema.sql`
3. Optionally enable **Google OAuth** in Authentication → Providers

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase project under **Settings → API**.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Tables

All tables are in `supabase/schema.sql` with Row-Level Security enabled:

| Table | Purpose |
|---|---|
| `workouts` | Planned and completed workout records |
| `exercise_history` | Individual set logs from live sessions |
| `ai_chat_history` | AI Coach conversation history |
| `user_preferences` | Units, goal, cycle phase, OpenAI key, etc. |

---

## AI Coach

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Go to **Settings** in the app
3. Paste the key in the **AI Coach** section

Without a key, the app falls back to pattern-matched demo responses.

---

## CSV Import Format

```csv
Exercise,Sets,Reps,Weight,Notes
Squat,3,5,100,felt strong
Bench Press,4,8,80,
Deadlift,1,5,140,
```

After uploading, FlowTrack parses exercises, looks up previous performance, and applies the progressive overload engine to suggest weights.

---

## Tech Stack

- **Framework**: Next.js 16 App Router + TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **Database**: Supabase — PostgreSQL, Auth, Realtime, RLS
- **Charts**: Recharts
- **Animation**: Framer Motion + canvas-confetti
- **AI**: OpenAI GPT-4o mini
- **File handling**: react-dropzone, papaparse, jsPDF
- **Theme**: next-themes (dark default)
- **Voice**: Browser Web Speech API

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Add environment variables in the Vercel dashboard.

In Supabase **Authentication → URL Configuration → Redirect URLs** add:

```
https://your-domain.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

---

## License

MIT
