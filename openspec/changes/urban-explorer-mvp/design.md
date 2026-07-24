# Design: Urban Explorer MVP

## Technical Approach

Bootstrap a TypeScript React SPA on Vite, hosted on Vercel and backed by Supabase. Supabase owns auth, Postgres tables, RLS, private evidence storage, and the server/DB validation boundary for completions; React owns discovery, evidence UX, derived progression display, and sharing. This replaces the superseded AWS/Amplify direction to reduce hackathon setup time.

## Architecture Decisions

| Topic | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Web stack | Vite + React + TypeScript | Next.js, plain HTML | Fast SPA bootstrap, simple browser API access, no SSR required. |
| Platform | Supabase + Vercel | AWS Amplify Gen 2, custom AWS stack | Faster auth/data/storage/deploy setup for the remaining hackathon window. |
| Auth | Supabase Auth | Custom auth, Cognito | Managed identity with simple session integration and RLS support. |
| Completion boundary | Supabase RPC/Edge Function or Postgres function guarded by RLS | Client-only writes | Server/DB validates radius, duplicate completion, evidence, and derived rewards. |
| Evidence storage | Private Supabase Storage bucket keyed by authenticated user | Public bucket, metadata-only | Photo evidence is sensitive and must not be public by default. |
| Reward state | Derived from accepted completions and seed rules | Client-submitted points/badges | Prevents forged progress and keeps MVP rewards visual/minimal. |
| Challenge catalog | 8-12 one-city seed records | Dynamic admin UI, multi-city catalog | Predictable demo data without backoffice work. |
| PWA tooling | `vite-plugin-pwa` with Workbox `generateSW` | Workbox `injectManifest` with a hand-written custom service worker | `generateSW` auto-generates precache manifest/routing from the Vite build with minimal hand-written service worker code, which fits the hackathon timeline; `injectManifest` is reconsidered only if a custom fetch-handling need (beyond stale-while-revalidate catalog caching and strict auth/storage exclusions) emerges later. |

## Data Flow

```text
React screens -> Supabase client -> Auth/Postgres/RLS/Storage
Challenge list -> Geolocation adapter -> local distance sort
Complete -> camera/file picker -> private evidence upload -> submit_completion
submit_completion -> validate auth/radius/accuracy/evidence/duplicate -> insert Completion
Progress view -> read derived points/badges/history from DB view or server response
```

Browser APIs stay behind adapters: `locationService` wraps Geolocation states, `photoEvidenceService` wraps camera/file input, and `shareService` wraps Web Share with copy fallback. Permission denial allows browsing but blocks completion where required.

The PWA shell adds a service worker layer in front of the Supabase client boundary: the app shell (HTML/JS/CSS/icons) is precached at build time, and read-only challenge catalog responses are cached with a stale-while-revalidate strategy. This layer is strictly read-only. Security note: the service worker MUST NOT cache Supabase Auth endpoints, any private Storage evidence URL, or any authenticated write response; those requests always bypass the cache and go to the network. Completion writes stay online-only by architecture, not just by convention: `submit_completion` is a server/DB-validated boundary (see Interfaces / Contracts below), so there is nothing safe to serve from cache for a write, and the service worker does not register Background Sync to queue offline completion attempts.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create/Modify | React/Vite/TypeScript scripts plus Supabase/Vercel verification scripts when available. |
| `src/main.tsx`, `src/app/App.tsx` | Create | App shell, auth session boundary, routes. |
| `src/lib/supabase/*` | Create | Browser-safe Supabase client using anon key only. |
| `src/features/discovery/*` | Create | list, detail, distance formatting, permission states. |
| `src/features/completion/*` | Create | proximity UX, photo upload, submit flow. |
| `src/features/progression/*` | Create | derived profile, points, badges, history, sharing. |
| `src/shared/browser/*` | Create | geolocation, photo, share adapters. |
| `supabase/migrations/*` | Create | Tables, RLS policies, storage bucket/policies, completion validation boundary. |
| `supabase/seed/challenges.json` | Create | 8-12 one-city curated challenges. |
| `.env.example`, `README.md`, `vercel.json` | Create/Modify | Public anon env, private server env guidance, Vercel deploy docs. |
| `vite.config.ts` (PWA plugin config), manifest, icons, splash assets, service worker registration/update UI | Create | Installable manifest, precached app shell, read-only catalog runtime caching, offline indicator, update prompt, optional Share Target. |

## Interfaces / Contracts

Core records: `profiles(user_id, display_name)`, `challenges(...)`, `completions(user_id, challenge_id, completed_at, latitude, longitude, accuracy_meters, evidence_path, points_awarded)`, `badges(...)`. Unique completion key: `(user_id, challenge_id)`.

`submit_completion` input: `{ challengeId, latitude, longitude, accuracyMeters, evidencePath }`. It rejects unauthenticated users, denied/missing location, inaccurate GPS, outside-radius attempts, duplicate completions, missing/private-inaccessible evidence, and any client-submitted reward fields. It returns the accepted completion plus derived progress summary.

Security boundary: Vite only receives Supabase URL and anon key. `SUPABASE_SERVICE_ROLE_KEY` is allowed only in server-side/private tooling and must never be exposed through `VITE_*`, browser bundles, or checked-in docs with real values.

PWA boundary: `submit_completion` remains the only completion write path and stays server/DB-validated exactly as described above, so it is always called online; the service worker never intercepts, caches, or queues this call, and never caches Supabase Auth or private Storage responses.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | distance math, derived level/badge calculation, seed validation, permission states | Vitest with pure functions and mocked browser adapters. |
| Integration | RLS, storage policy, completion validation, no client reward writes | Supabase local test or SQL/RPC contract tests when tooling exists. |
| E2E | login, browse without location, upload evidence, complete, share fallback | Playwright after app bootstrap; mock geolocation and file upload. |
| PWA | manifest validity, service worker precache/update flow, offline catalog rendering, offline completion block, cache exclusions for auth/private storage | Lighthouse PWA audit plus a focused offline smoke check (e.g. DevTools offline mode) after `npm run build`. |

CI remains tied to real `package.json` scripts. Do not invent placeholder commands.

## MVP Observability

- Vercel build/deploy logs are the first source of truth for frontend deploy failures.
- Supabase Auth, database, storage, and function logs are the first source of truth for backend validation failures.
- Manual smoke evidence must include hosted URL/local runtime, browser/device, expected path, result, and console errors if present.
- Demo verification must capture expected failures: unauthenticated completion, denied geolocation, inaccurate GPS, outside-radius attempts, duplicate completion, missing evidence, forged reward fields, and missing seed data.

## Threat Matrix

N/A - no shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. App routing is client-side screen navigation only; no route execution boundary is introduced.

## Migration / Rollout

No destructive production data migrations are allowed in the MVP without an explicit plan. Bootstrap Supabase locally or in a disposable project first, seed one-city challenges from a known-good file, then deploy the SPA through Vercel.

Post-deploy recovery guidance:
- Frontend failures: redeploy the previous known-good Vercel deployment or revert with a small PR before redeploying.
- Seed failures: disable/remove bad seed records through a seed rollback task and restore the known-good seed file.
- Supabase validation/policy failures: prefer a small fix-forward PR and re-run migration/policy smoke evidence.
- Data safety: block destructive production changes unless impact, backup/restore path, and owner approval are documented first.

## Work Boundaries

- Collaborator A: React shell, Supabase Auth session boundary, discovery, location adapter.
- Collaborator B: Supabase schema, RLS, storage, seed data, completion validation.
- Collaborator C: completion UX, progression display, sharing, tests.

## Open Questions

- [ ] Exact city and initial 8-12 challenge seed dataset values.
