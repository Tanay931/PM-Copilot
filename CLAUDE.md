# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type-check without building
```

## Architecture

Next.js 16 App Router app with TypeScript, Tailwind CSS v4, Supabase (auth + database), and Anthropic Claude API.

### Route groups
- `app/(auth)/` — unauthenticated pages: `/login`, `/signup`, `/verify`, `/reset-password`. Minimal layout (no sidebar).
- `app/(app)/` — authenticated pages: `/dashboard`, `/onboarding`, `/products/*`, `/prds/*`, `/prototypes`. Renders Sidebar + main area.
- `app/page.tsx` — server component that redirects to `/dashboard` (authenticated) or `/login` (guest).
- `proxy.ts` — Next.js 16 proxy (was middleware). Protects routes: unauthenticated → `/login`, authenticated on auth page → `/dashboard`.

### Supabase
- `lib/supabase/client.ts` — `createBrowserClient` for client components
- `lib/supabase/server.ts` — `createServerClient` for server components and API routes
- All API routes check `supabase.auth.getUser()` and return 401 if no session.
- RLS is enabled on all tables — never use the service role key in client code.

### LLM provider abstraction
- `lib/llm/types.ts` — `LLMProvider` interface
- `lib/llm/anthropic.ts` — Anthropic implementation
- `lib/llm/index.ts` — `getLLMProvider()` factory (driven by `LLM_PROVIDER` env var)

### Styling
- Tailwind CSS v4 with `@theme inline` in `globals.css`. Brand tokens: `bg-pine`, `text-pine`, `bg-mint`, `bg-space`, `bg-offwhite`, `bg-sky`. Also available as CSS vars: `var(--pine)`, `var(--mint)`, etc.
- Sidebar is always Pine Green (`var(--pine)`) using inline styles, never Tailwind dark-mode.
- All text must use British English (colour, behaviour, optimised).

### Products (Phase 1 — localStorage; Phase 2 — Supabase)
- `lib/products-store.tsx` still provides `ProductsProvider` / `useProducts` for the existing PRD form. Phase 2 will replace this with API calls.
- `(app)/layout.tsx` wraps children in `<ProductsProvider>` so `useProducts()` works inside the app route group.

### Key env vars
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server-only, never expose to client
ANTHROPIC_API_KEY
CLAUDE_MODEL                # default: claude-sonnet-4-20250514
LLM_PROVIDER                # default: anthropic
```

### Database schema (Supabase)
Tables: `users`, `products`, `knowledge_base_items`, `personas`, `prds`, `prd_attachments`. All have RLS enabled. See the full spec document for schema SQL.
