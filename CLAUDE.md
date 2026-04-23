# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chat Application — Real-time chat application with WebSocket rooms, messaging, and file sharing support.

Built with Vite, React 19, TypeScript 5.9, and Tailwind CSS.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build (tsc + vite build)
npm run preview          # Preview production build
npx tsc --noEmit         # Type check
npm run lint             # ESLint

# Unit tests (vitest + jsdom)
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With v8 coverage report

# E2E tests (Playwright — starts dev server automatically)
npm run test:e2e         # Headless
npm run test:e2e:ui      # Interactive UI mode
npx playwright install   # Install browsers (first time only)
```

## Architecture

- `src/` — Application source code
- `src/components/` — Reusable React components (`MessageBubble`, `RoomList`)
- `src/pages/` — Page components (`ChatRoom`)
- `src/lib/` — Utilities and helpers (`socket.ts`, `i18n.ts`)
- `src/test/` — Unit test files + setup (`setup.ts`)
- `e2e/` — Playwright end-to-end specs
- `server/` — Socket.io backend server (`tsx server/index.ts` on port 3001)
- `public/` — Static assets

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_WS_URL` | WebSocket server URL (default: `http://localhost:3001`) |

## Testing Strategy

- **Unit tests** (`src/test/*.test.tsx`) — vitest + jsdom + React Testing Library
  - `socket` is auto-mocked in `src/test/setup.ts` — no real WS connections in tests
  - Coverage target: 80%+ on new components
- **E2E tests** (`e2e/*.spec.ts`) — Playwright against `http://localhost:5173`
  - `playwright.config.ts` starts `npm run dev` automatically via `webServer`
  - Socket.io server must be running separately for full E2E: `npm run server`

## Rules

- TypeScript strict mode — no `any` types
- Tailwind CSS utility classes for styling — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Always mock `socket` in unit tests (never open real WebSocket connections)
- Prefer `@testing-library/user-event` over `fireEvent` for realistic interaction tests
