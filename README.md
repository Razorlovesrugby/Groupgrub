# GroupGrub

Real-time group food decisions. One person starts a session and shares a join code. Everyone adds ideas, votes anonymously, and the host reveals the winner. No accounts needed.

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Supabase (Postgres, Realtime) · Tailwind CSS

## How it works

1. The host creates a session and shares the join code.
2. **Brainstorm:** everyone adds ideas and sees them appear live.
3. **Vote:** votes are anonymous and results update in real time.
4. **Results:** the host reveals the winner.

Live updates use Supabase Realtime subscriptions on the session's tables. Participants join with a nickname only. Row level security is enabled on all four tables (`sessions`, `participants`, `ideas`, `votes`).

## Getting started

Requires Node 18.17+ and a Supabase project.

```bash
npm install
cp .env.example .env.local     # add your Supabase URL and anon key
```

Run `supabase/migrations/001_groupgrub_schema.sql` against your project, and enable Realtime for the four tables. Then:

```bash
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Project layout

```
src/app/          routes and error boundary
src/components/   phase screens (brainstorm, voting, results) and session shell
src/lib/          Supabase client and helpers
supabase/         database schema
```
