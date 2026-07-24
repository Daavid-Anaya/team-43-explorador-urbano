# Proposal: Urban Explorer MVP

## Intent

Build a hackathon-ready web app for urban explorers. Users discover 8-12 curated one-city challenges, prove visits with geolocation plus photo evidence, see derived progress, and share achievements. The accepted platform is Supabase for auth/data/storage and Vercel for hosting to reduce setup time versus the superseded AWS/Amplify plan.

## Scope

### In Scope
- One-city curated challenge catalog sorted by distance when location is available.
- Supabase Auth identity, user profile, completion history, and visual derived points/badges.
- Completion submission using proximity checks plus uploaded photo evidence.
- Fixed MVP challenge contract: `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, `estimatedMinutes`.
- Minimal server/DB-derived completion validation; clients must never submit rewards, points, or badges.
- Vercel-hosted web app with Supabase environment setup.
- Native sharing of completed achievements when supported.
- Installable PWA shell with read-only offline access to the cached challenge catalog (manifest, service worker, precached app shell, update prompt); challenge completion always requires network access.

### Out of Scope
- Multi-city support, map-first discovery, global city coverage, and user-generated challenges.
- Dynamic challenge catalog management.
- Real-time multiplayer, social feeds, leaderboards beyond basic progress.
- Complex anti-cheat, advanced fraud detection, photo moderation, and full offline-first sync.
- Full offline-first sync: no Background Sync queuing of offline challenge completions, and no offline writes of any kind. Completion validation stays 100% server-side (`submit_completion`) and therefore always requires connectivity.
- AWS/Amplify implementation work; that direction is superseded.

## Capabilities

### New Capabilities
- `user-identity`: simple login, user profile, and authenticated progress ownership.
- `challenge-discovery`: curated one-city challenge list with distance display and detail view.
- `challenge-completion`: geolocation proximity validation plus photo evidence capture/submission.
- `progression-sharing`: derived points, badges, completion history, and achievement sharing.
- `supabase-vercel-platform`: Supabase Auth/Postgres/RLS/Storage, safe server/DB validation, Vercel hosting, seed data, and environment setup.
- `pwa-shell`: installable Web App Manifest, service worker with precached app shell, stale-while-revalidate read-only catalog caching, offline state indication, update prompt, and optional Share Target; no offline write/completion queuing.

### Modified Capabilities
- None.

## Approach

Use the lightweight managed-platform MVP: Vite React app on Vercel, Supabase Auth for identity, Postgres with RLS for challenges/profiles/completions, Supabase Storage for private evidence, and server/DB-side validation for completion and derived rewards. Keep proof validation minimal: authenticated user + `radiusMeters = 80` + `maxGpsAccuracyMeters = 100` + required uploaded photo evidence + duplicate-completion rejection.

Accepted baseline decisions:
- MVP persona: urban explorer.
- First functional slice: auth + challenges + evidence upload.
- City scope: one-city MVP with 8-12 manually curated challenges.
- Challenge categories: Art, History, Nature, Landmark, Hidden Gem.
- Progression: visual/derived only for MVP; client-submitted points/badges are invalid.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app` | New | Discovery, auth, completion, progression UI |
| `src/lib/supabase`, `supabase/*` | New | Supabase client boundary, schema, RLS, seed, storage, and server/DB validation contracts |
| `vercel.json`, `.env.example`, `README.md` | New/Modified | Vercel deployment and environment guidance |
| PWA shell (manifest, service worker, icons) | New | Installable app shell and read-only offline catalog caching |
| `openspec/changes/urban-explorer-mvp` | Modified | Proposal/spec/design/tasks artifacts |

## Assumptions and Open Decisions

- Assumption: challenge content is curated and seeded by the team.
- Assumption: MVP anti-cheat is good enough, not production-grade.
- Open: exact city and initial POI dataset values.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| GPS/photo permissions break completion | Med | clear error states and retry paths |
| Supabase policies accidentally trust client input | High | RLS and server/DB validation; no client-submitted rewards/progress |
| Service role leaks to client | High | service role only in server-side/private environment; never expose `SUPABASE_SERVICE_ROLE_KEY` to Vite |
| Scope expands across 3 developers | High | split by capabilities and protect 400-line reviews |

## Rollback Plan

Before merge, remove the change artifacts and any generated app/platform slice from the feature branch if the MVP direction is abandoned.

After deployment, use the smallest safe recovery path:
- Frontend deploy failure: redeploy the previous known-good Vercel deployment when available, or revert with a small PR and redeploy.
- Seed data failure: disable/remove bad seed records through a seed rollback task and restore the known-good seed file.
- Supabase policy/function failure: fix forward with a small PR, reapply migrations/config, and capture smoke evidence.
- Production data safety: no destructive production data migrations are allowed without an explicit migration and recovery plan.

## Dependencies

- Supabase project access for Auth, Postgres, RLS, Storage, and server-side environment variables.
- Vercel project access and deploy environment configuration.
- Browser Geolocation and camera/file permissions.
- Curated one-city POI/challenge seed dataset.

## Success Criteria

- [ ] A logged-in user can see nearby challenges as a distance-sorted list.
- [ ] A user can upload photo evidence and complete a challenge after server/DB validation.
- [ ] Progress displays derived points/badges/history and ignores client-submitted reward data.
- [ ] The MVP is deployable on Vercel with Supabase-backed auth/data/storage and taskable across 3 developers.
