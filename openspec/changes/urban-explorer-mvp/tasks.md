# Tasks: Urban Explorer MVP

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1,200-1,800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 bootstrap+Amplify base -> PR2 completion flow -> PR3 progression+deploy+demo |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |
| CI status | Pending until PR1 creates `package.json` scripts; PR1 must add the workflow using real scripts only. |

Decision needed before apply: Yes — choose the exact city and commit the initial 8-12 challenge seed dataset before starting PR1 task 1.3.
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Bootstrap app + auth/data/storage seed path | PR1 base=feature branch | `npm run test -- app-shell amplify seed` | `npm run dev` + `npx ampx sandbox` login/list smoke | `package.json`, `src/app`, `amplify/{auth,data,storage,seed}` |
| 2 | Completion validation + evidence upload flow | PR2 base=PR1 | `npm run test -- completion` | mocked geolocation + file upload completion smoke | `src/features/completion`, `src/shared/browser`, `amplify/functions/submit-completion` |
| 3 | Progression, sharing, deploy, demo polish | PR3 base=PR2 | `npm run test -- progression e2e` | `npm run build` + hosted demo checklist | `src/features/progression`, `playwright`, deploy docs/config |

## Ownership Lanes

- Dev A: frontend shell, auth, discovery.
- Dev B: Amplify backend, function, seed, deploy.
- Dev C: completion UX, progression, tests, demo.

## Phase 1: Foundation / Bootstrap

- [ ] 1.1 [A] Create `package.json`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/app/App.tsx`; AC: app boots and package scripts exist for available build/test/lint/typecheck gates; Verify: `npm install && npm run dev`.
- [ ] 1.2 [B] Create `amplify/auth/resource.ts`, `amplify/data/resource.ts`, `amplify/storage/resource.ts`, `amplify/backend.ts`; AC: sandbox synthesizes auth/data/storage; Verify: `npx ampx sandbox`.
- [ ] 1.3 [B] Add `amplify/seed/challenges.json` plus seed loader path in `amplify/data/resource.ts`; Dependency: exact city and seed dataset approved by the team; AC: 8-12 one-city challenges use `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, `estimatedMinutes` and only Art/History/Nature/Landmark/Hidden Gem categories; include known-good seed file and seed rollback task guidance; Verify: `npm run seed:check`.
- [ ] 1.4 [B+C] Add `src/features/progression/progressionRules.ts` with accepted level thresholds and MVP badge rules; AC: Explorer I/II/III, City Ranger, Urban Legend and six badges are represented; Verify: `npm run test -- progressionRules`.
- [ ] 1.5 [A+B+C] Add `.github/workflows/*` CI once npm scripts exist; AC: workflow runs the available build/test/lint/typecheck gates and documents omitted gates with reasons; Verify: inspect workflow plus first PR check run.

## Phase 2: Feature Lanes

- [ ] 2.1 [A] Add `src/features/discovery/*` and `src/shared/browser/locationService.ts`; AC: sorted list, denied-permission browse fallback, detail view; Verify: `npm run test -- discovery location`.
- [ ] 2.2 [B] Add RED integration tests for unauthenticated, outside-80m-radius, GPS accuracy over 100m, duplicate, and missing-evidence cases in `amplify/functions/submit-completion/*.test.ts`; Verify: `npm run test -- submit-completion` fails first.
- [ ] 2.3 [B] Implement `amplify/functions/submit-completion/*` and action binding in `amplify/data/resource.ts`; AC: validates authenticated user, radius, GPS accuracy, uploaded evidence, duplicate prevention, points, levels, and badges; Verify: `npm run test -- submit-completion` passes.
- [ ] 2.4 [C] Add `src/shared/browser/photoEvidenceService.ts` and `src/features/completion/*`; AC: permission-denied blocks completion, upload retry avoids duplicates; Verify: `npm run test -- completion photo`.
- [ ] 2.5 [C] Add `src/features/progression/*` and `src/shared/browser/shareService.ts`; AC: points/badges/history restore and native-share fallback work; Verify: `npm run test -- progression share`.

## Phase 3: Integration / Verification / Demo

- [ ] 3.1 [A+C] Wire Amplify client config, Authenticator, route guards, and profile refresh in `src/app/App.tsx`; AC: simple login/authenticated user is required for persisted app flows and challenge completion, while non-completion browse fallback states match the specs; Verify: `npm run test -- auth app`.
- [ ] 3.2 [C] Add Playwright flows in `playwright/e2e/urban-explorer.spec.ts`; AC: login, browse without location, successful completion, share fallback; Verify: `npm run test:e2e`.
- [ ] 3.3 [B] Add deployment scripts/docs in `package.json`, `amplify.yml`, `README.md`; AC: sandbox/build/deploy steps, Amplify Hosting deploy-log inspection, and frontend rollback/redeploy guidance are documented; Verify: `npm run build && npx ampx pipeline-deploy --dry-run` when configured.
- [ ] 3.4 [A+B+C] Create `docs/demo-checklist.md`; AC: seed city, badge thresholds, smoke path, browser console capture, expected failure capture, rollback notes, seed rollback, and function fix-forward guidance are documented; Verify: manual demo runbook review.
