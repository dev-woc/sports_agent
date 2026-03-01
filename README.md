# Athlete OS

The unified athlete career platform — NIL matchmaking, AI-powered contract review, recruiting intelligence, and a parent dashboard. Built with Next.js 15, React 19, and Neon Postgres.

## Modules

- **Contract Guard** — AI-powered NIL contract review with clause flagging (predatory terms, perpetuity clauses, buyout penalties, exclusivity traps)
- **NIL Matchmaker** — Brand-athlete matching based on sport, geography, audience demographics, and compliance status
- **Parent Dashboard** — Unified recruiting timeline, NIL opportunities, and eligibility tracking
- **Athlete Profile** — Public profile with stats, social links, and highlight reel

## Tech Stack

- **Framework:** Next.js 15 (App Router, `src/` directory)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui, Lucide icons
- **Database:** Neon Postgres + Drizzle ORM
- **Auth:** Neon Auth (`@neondatabase/auth`)
- **AI:** Anthropic Claude (`claude-sonnet-4-6`) via Anthropic SDK
- **Drag-and-Drop:** dnd-kit
- **Validation:** Zod
- **Testing:** Vitest (unit), agent-browser (E2E)
- **Linting/Formatting:** Biome

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) project with Auth enabled
- An [Anthropic](https://console.anthropic.com) API key

### Setup

1. **Install dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Neon database URL, auth base URL, cookie secret, and Anthropic API key.

3. **Push the database schema:**

   ```bash
   npm run db:push
   ```

4. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Do not use `--turbopack` — middleware does not execute with Turbopack in Next.js 15.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Signup + Login pages
│   ├── (dashboard)/     # Editor page
│   └── api/             # Profile, links, links/reorder, slug/check routes
├── components/
│   ├── auth/            # Signup/login forms, slug input
│   ├── editor/          # Link list, link item, add button, profile form, toolbar
│   ├── preview/         # Phone-frame preview panel
│   ├── themes/          # Minimal theme (reusable for public pages)
│   └── ui/              # shadcn/ui primitives
├── db/                  # Drizzle schema + connection
├── hooks/               # useProfile data fetching hook
├── lib/                 # Validations, rate limiter, utils
└── types/               # Shared TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint with Biome |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format with Biome |
| `npm run test` | Run unit tests (watch mode) |
| `npm run test:run` | Run unit tests once |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio |
