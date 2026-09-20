# Kollab

Kollab is a React + TypeScript + Tailwind influencer collaboration application backed entirely by Supabase.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in the Supabase project values.
3. Start development: `npm run dev`
4. Validate before release: `npm run typecheck && npm run lint && npm run build`

If the database was seeded with explicit numeric IDs, run
`supabase/fix_sequences.sql` once in the Supabase SQL Editor. The frontend also
contains a safe-ID fallback, but resetting the PostgreSQL sequences is the
recommended permanent database fix.

## Environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Implemented workflows

- Role-based login and local session for `ADMIN`, `BRAND`, `KOL`, and `KOC`.
- Brand product and campaign CRUD.
- Brand task assignment to KOL/KOC.
- KOL/KOC draft, published-post, and metrics submission.
- Brand draft approval/revision flow.
- Brand metrics verification and automatic pending-payment creation.
- Brand payment status management and KOL/KOC payment history.
- Admin summaries built from live Supabase records.

All business data is loaded through the files in `src/services`. The former mock dataset has been removed.

## Authentication note

This project follows the requested simple login model and compares the entered password with `users.password_hash`, then stores only the safe user profile in `localStorage`. For a public production deployment, migrate login to Supabase Auth and enable role-aware Row Level Security policies.
