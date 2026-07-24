# Tasks: Urban Explorer MVP

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1,200-1,800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 bootstrap+Supabase base -> PR2 completion flow -> PR3 progression+Vercel deploy+demo |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |
| CI status | Pending until PR1 creates real `package.json` scripts; do not invent placeholders. |

Decision needed before apply: Yes - choose the exact city and commit the initial 8-12 challenge seed dataset before starting PR1 task 1.3.
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Bootstrap app + Supabase auth/data/storage seed path | PR1 base=feature branch | `npm run test -- app-shell supabase seed` | `npm run dev` + Supabase local/project login/list smoke | `package.json`, `src/app`, `src/lib/supabase`, `supabase/{migrations,seed}` |
| 2 | Completion validation + evidence upload flow | PR2 base=PR1 | `npm run test -- completion submit-completion` | mocked geolocation + file upload completion smoke | `src/features/completion`, `src/shared/browser`, `supabase/migrations` validation boundary |
| 3 | Progression, sharing, Vercel deploy, demo polish | PR3 base=PR2 | `npm run test -- progression e2e` | `npm run build` + Vercel hosted demo checklist | `src/features/progression`, `playwright`, deploy docs/config |

## Ownership Lanes

- Dev A: frontend shell, Supabase Auth session boundary, discovery.
- Dev B: Supabase schema, RLS, storage, seed, completion validation, Vercel env/deploy.
- Dev C: completion UX, progression display, tests, demo.

## Phase 1: Foundation / Bootstrap

- [ ] 1.1 [A] Create `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/app/App.tsx`; AC: app boots and real scripts exist for available gates; Verify: `npm install && npm run dev`.
- [ ] 1.2 [B] Create `src/lib/supabase/*`, `.env.example`, and `supabase/migrations/*` for Auth profiles, challenges, completions, private evidence storage, and RLS; AC: browser client uses anon key only and service role is absent from client env; Verify: Supabase local/project smoke when configured.
- [ ] 1.3 [B] Add `supabase/seed/challenges.json` plus validation path; Dependency: exact city and seed dataset approved; AC: 8-12 one-city challenges use accepted fields/categories and seed rollback guidance exists; Verify: `npm run seed:check`.
- [ ] 1.4 [B+C] Add derived progression rules without client-writable rewards; AC: points/badges derive from accepted completions; Verify: `npm run test -- progressionRules`.
- [ ] 1.5 [A+B+C] Add `.github/workflows/*` CI once npm scripts exist; AC: workflow runs real build/test/lint/typecheck gates and documents omitted gates; Verify: inspect workflow plus first PR check run.

## Phase 2: Feature Lanes

- [ ] 2.1 [A] Add `src/features/discovery/*` and `src/shared/browser/locationService.ts`; AC: sorted list, denied-permission browse fallback, detail view; Verify: `npm run test -- discovery location`.
- [ ] 2.2 [B] Add RED contract tests for unauthenticated, outside-80m-radius, GPS accuracy over 100m, duplicate, missing evidence, forged rewards, and RLS denial cases; Verify: `npm run test -- submit-completion` fails first.
- [ ] 2.3 [B] Implement Supabase completion validation via RPC/Edge Function or Postgres function plus RLS/storage policies; AC: validates auth, radius, GPS accuracy, evidence, duplicate prevention, and derived rewards; Verify: `npm run test -- submit-completion` passes.
- [ ] 2.4 [C] Add `src/shared/browser/photoEvidenceService.ts` and `src/features/completion/*`; AC: private evidence upload, permission-denied block, retry without duplicate completion; Verify: `npm run test -- completion photo`.
- [ ] 2.5 [C] Add `src/features/progression/*` and `src/shared/browser/shareService.ts`; AC: derived points/badges/history restore and native-share fallback work; Verify: `npm run test -- progression share`.

## Phase 3: Integration / Verification / Demo

- [ ] 3.1 [A+C] Wire Supabase session state, auth guards, and profile refresh in `src/app/App.tsx`; AC: persisted flows require login and browse fallbacks match specs; Verify: `npm run test -- auth app`.
- [ ] 3.2 [C] Add Playwright flows in `playwright/e2e/urban-explorer.spec.ts`; AC: login, browse without location, evidence upload/completion, share fallback; Verify: `npm run test:e2e`.
- [ ] 3.3 [B] Add Vercel/Supabase deployment scripts/docs in `package.json`, `vercel.json`, `.env.example`, `README.md`; AC: build/deploy steps, Vercel logs, Supabase logs, env safety, and rollback are documented; Verify: `npm run build` plus deploy dry run when configured.
- [ ] 3.4 [A+B+C] Create `docs/demo-checklist.md`; AC: seed city, smoke path, expected failures, service-role safety check, rollback notes, and policy/function fix-forward guidance are documented; Verify: manual demo runbook review.
