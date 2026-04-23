# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chat Application -- Real-time chat with persistent messaging, Supabase auth, and WebSocket rooms.

Built with Vite, React 19, TypeScript 5.9, Tailwind CSS, Supabase (PostgreSQL + Auth), and Socket.io.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build (tsc + vite build)
npm run preview          # Preview production build
npm run server           # Start Socket.io server (port 3001)
npx tsc --noEmit         # Type check
npm run lint             # ESLint

# Unit tests (vitest + jsdom)
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With v8 coverage report

# E2E tests (Playwright -- starts dev server automatically)
npm run test:e2e         # Headless
npm run test:e2e:ui      # Interactive UI mode
npx playwright install   # Install browsers (first time only)

# Supabase (local development)
npx supabase start       # Start local Supabase (DB, Auth, Studio)
npx supabase db reset    # Apply migrations + seed data
npx supabase stop        # Stop local Supabase
```

## Architecture

- `src/` -- Application source code
- `src/components/` -- Reusable React components (`MessageBubble`, `RoomList`)
- `src/pages/` -- Page components (`ChatRoom`, `Login`, `Signup`)
- `src/lib/` -- Utilities and helpers (`supabase.ts`, `socket.ts`, `AuthProvider.tsx`, `i18n.ts`)
- `src/types/` -- TypeScript type definitions (`database.ts`)
- `src/test/` -- Unit test files + setup (`setup.ts`)
- `e2e/` -- Playwright end-to-end specs
- `server/` -- Socket.io backend server (`tsx server/index.ts` on port 3001)
- `supabase/migrations/` -- Database migrations (initial schema with rooms, messages, profiles)
- `supabase/seed.sql` -- Seed data (3 default rooms)
- `public/` -- Static assets

### Auth Flow

1. User visits app -- `AuthProvider` checks Supabase session
2. No session -- redirect to `/login`
3. Login/signup via Supabase Auth (`signInWithPassword` / `signUp`)
4. On auth success -- `onAuthStateChange` fires, socket connects with JWT
5. Protected routes (`/`, `/room/:roomId`) require authenticated user
6. Profile auto-created on signup via database trigger

### Data Flow

1. Rooms loaded from `public.rooms` table via Supabase client
2. Messages loaded from `public.messages` (joined with `profiles`) on room entry
3. New message: INSERT into Supabase, then broadcast via Socket.io to room
4. Other clients receive via socket `message` event (real-time, no polling)
5. Server validates JWT on socket handshake, can also persist server-side

### Database Schema

- `profiles` -- extends `auth.users` with username + avatar (auto-created via trigger)
- `rooms` -- chat rooms with name, description, creator
- `messages` -- messages with room FK, user FK, text, timestamp
- All tables have RLS policies: authenticated users can read all, insert own

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (client-side) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (client-side) |
| `SUPABASE_URL` | Supabase project URL (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side, bypasses RLS) |
| `VITE_WS_URL` | WebSocket server URL (default: `http://localhost:3001`) |

## Testing Strategy

- **Unit tests** (`src/test/*.test.tsx`) -- vitest + jsdom + React Testing Library
  - `socket` and `supabase` are auto-mocked in `src/test/setup.ts`
  - `AuthProvider` is mocked to provide a test user by default
  - Coverage target: 80%+ on new components
- **E2E tests** (`e2e/*.spec.ts`) -- Playwright against `http://localhost:5173`
  - `playwright.config.ts` starts `npm run dev` automatically via `webServer`
  - Socket.io server must be running separately for full E2E: `npm run server`
  - Supabase must be running for auth/data E2E tests

## Rules

- TypeScript strict mode -- no `any` types
- Tailwind CSS utility classes for styling -- no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Always mock `socket` and `supabase` in unit tests (never open real connections)
- Prefer `@testing-library/user-event` over `fireEvent` for realistic interaction tests
- All database tables use `public.` schema (Supabase default)
- RLS policies on every table -- never expose data without auth checks
- Use parameterized queries when writing raw SQL
