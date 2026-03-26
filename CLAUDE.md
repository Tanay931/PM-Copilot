# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

To run a type-check without building: `npx tsc --noEmit`

## Architecture

Next.js 16 App Router app with TypeScript and Tailwind CSS.

**Folder structure:**
- `app/` — pages and layouts (App Router). Each subfolder is a route (`app/new-prd/page.tsx` → `/new-prd`)
- `components/` — shared UI components (e.g. `Sidebar.tsx`)
- `lib/` — shared utilities (e.g. `utils.ts` with `cn()` helper)

**Layout:** `app/layout.tsx` renders a fixed `<Sidebar>` (240px, dark) on the left and a `<main>` content area offset by `ml-60` on the right. All pages live inside the main area.

**Styling:** Tailwind CSS with custom CSS variables defined in `globals.css` for sidebar colors (`--sidebar-bg`, `--sidebar-border`, `--sidebar-text`, `--sidebar-active`, etc.). The sidebar uses `var(--sidebar-*)` inline styles rather than Tailwind dark-mode classes to keep sidebar always dark regardless of system theme.

**Sidebar navigation:** Defined as a static array in `components/Sidebar.tsx`. Uses `usePathname()` for active state — mark the file `"use client"`. To add a new nav item, add an entry to the `navItems` array with `{ label, href, icon }`.
