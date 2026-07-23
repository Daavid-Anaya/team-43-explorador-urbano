# Design: Urban Explorer MVP

## Technical Approach

Bootstrap an empty repo as a TypeScript React SPA on Vite, backed by AWS Amplify Gen 2. Amplify owns auth, data, protected photo storage, functions, local sandbox, and hosting outputs; React owns discovery, completion, and progress UX. This maps to the five MVP specs while minimizing custom infrastructure for a one-city hackathon MVP.

## Architecture Decisions

| Topic | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Web stack | Vite + React + TypeScript | Next.js, plain HTML | Fastest SPA bootstrap, simple browser API access, no SSR needed for one-city MVP. |
| AWS backend | Amplify Gen 2 `defineAuth`, `defineData`, `defineStorage`, `defineFunction` | Hand-written API Gateway/Lambda/DynamoDB CDK | Code-first AWS resources with `npx ampx sandbox`, generated client config, and less IaC overhead. |
| Auth UI | Amplify UI `Authenticator` | Custom Cognito UI | Simple login satisfies MVP and avoids auth UX drift. |
| Completion API | Custom Amplify function invoked by a data mutation/action | Client-only writes | Server validates radius, duplicate completion, metadata, points, badges in one boundary. |
| Evidence storage | Protected/private S3 object per authenticated user | Public bucket, metadata-only | Photo evidence is sensitive and must not be public by default. |
| Challenge catalog | 8-12 manually curated one-city seed records | Dynamic catalog/admin UI, multi-city catalog | Accepted MVP scope needs predictable demo data and avoids backoffice work. |
| Completion thresholds | `radiusMeters = 80`, `maxGpsAccuracyMeters = 100` | Per-city tuning, advanced anti-cheat | Simple constants are testable and enough for MVP trust-based validation. |
| Progression rules | Fixed level thresholds and six MVP badges | Dynamic progression engine | Hard-coded seedable rules reduce backend surface while preserving game feel. |
| MVP observability | Amplify deploy logs, browser console/manual smoke evidence, and backend function error logs | Full APM stack | Hackathon MVP needs enough production visibility to diagnose deploy, UI smoke, and completion-function failures without expanding scope. |

## Data Flow

```text
React screens -> Amplify client -> Auth/Data/Storage
Challenge list -> Geolocation adapter -> local distance sort
Complete -> camera/file picker -> protected upload -> submitCompletion function
submitCompletion -> validate auth/radius/accuracy/evidence/duplicate -> create Completion -> update Profile rewards
```

Browser APIs stay behind adapters: `locationService` wraps Geolocation permission/accuracy states; `photoEvidenceService` wraps camera/file input; `shareService` wraps Web Share with copy fallback. Permission denial must allow browsing but block completion where required.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | React/Vite/TypeScript/Amplify scripts: dev, test, build, sandbox. |
| `src/main.tsx`, `src/app/App.tsx` | Create | App shell, Authenticator, routes. |
| `src/features/discovery/*` | Create | list, detail, distance formatting, permission states. |
| `src/features/completion/*` | Create | proximity check UX, photo selection/upload, submit flow. |
| `src/features/progression/*` | Create | profile, points, badges, history, sharing. |
| `src/shared/browser/*` | Create | geolocation, photo, share adapters. |
| `amplify/auth/resource.ts` | Create | Cognito user-pool auth for simple login. |
| `amplify/data/resource.ts` | Create | Models and custom completion action/function binding. |
| `amplify/storage/resource.ts` | Create | Protected/private evidence photo prefixes. |
| `amplify/functions/submit-completion/*` | Create | Server-side completion validation/reward update. |
| `amplify/seed/challenges.json` | Create | 8-12 one-city curated challenges using accepted fields and categories. |
| `src/features/progression/progressionRules.ts` | Create | Fixed level thresholds and MVP badge rules. |

## Interfaces / Contracts

Data models: `Profile(userId, displayName, points, level, earnedBadgeIds, lastCompletionDate)`, `Challenge(cityId, title, description, category, latitude, longitude, radiusMeters, points, photoPrompt, difficulty, estimatedMinutes)`, `Completion(userId, challengeId, completedAt, latitude, longitude, accuracyMeters, evidenceKey, pointsAwarded)`, `Badge(id, name, description, ruleType, ruleValue)`. Unique completion key: `userId#challengeId`.

`submitCompletion` input: `{ challengeId, latitude, longitude, accuracyMeters, evidenceKey }`. It rejects unauthenticated users, denied/missing location, inaccurate GPS, outside-radius attempts, duplicate completions, or missing/private-inaccessible evidence. It returns updated profile, completion, and earned badges.

MVP constants: `DEFAULT_RADIUS_METERS = 80`, `MAX_GPS_ACCURACY_METERS = 100`.

Level thresholds: Explorer I = 0, Explorer II = 300, Explorer III = 700, City Ranger = 1200, Urban Legend = 2000.

Badge rules: First Steps = 1 completion, Weekend Walker = 3 completions, Art Hunter = 2 Art completions, History Seeker = 2 History completions, Route Finisher = 5 completions, Early Explorer = first challenge completed on a calendar day.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | distance math, level/badge calculation, challenge seed validation, permission state mapping | Vitest with pure functions and mocked browser adapters. |
| Integration | completion function duplicate/radius/reward behavior | Amplify sandbox or function tests with seeded challenge fixtures. |
| E2E | login, browse without location, complete with mocked location/photo, share fallback | Playwright after app bootstrap; mock geolocation and file upload. |

CI is intentionally pending until PR1 creates `package.json` and the real npm scripts. PR1 must add the GitHub Actions workflow once the available scripts are known, using build, test, lint, and typecheck commands as they exist rather than inventing placeholders.

## MVP Observability

- Amplify Hosting build/deploy logs are the first source of truth for frontend deploy failures.
- Manual smoke evidence must include the hosted URL or local runtime, browser/device, expected path, result, and any browser console errors.
- The `submitCompletion` function must log validation/runtime errors through AWS-managed function logs, conceptually CloudWatch, when implemented.
- Demo verification must capture expected failures: unauthenticated completion, denied geolocation, inaccurate GPS, outside-radius attempts, duplicate completion, missing evidence, and missing seed data.

## Threat Matrix

N/A — no shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. App routing is client-side screen navigation only; no route execution boundary is introduced.

## Migration / Rollout

No destructive production data migrations are allowed in the MVP without an explicit plan. Bootstrap resources in sandbox first, seed one-city challenges from a known-good seed file, then deploy through Amplify Hosting or `npx ampx pipeline-deploy`.

Post-deploy recovery guidance:

- Frontend failures: redeploy the previous known-good commit/build from Amplify Hosting when available, or revert with a small docs/code PR before redeploying.
- Seed failures: disable or remove bad seed records through a seed rollback task and restore the known-good seed file.
- Backend/function/resource failures: prefer a small fix-forward PR that updates the deployed Amplify resource or `submitCompletion` function, with smoke evidence after deploy.
- Data safety: do not run destructive production data migrations for the MVP unless the team first documents impact, backup/restore path, and owner approval.

## Work Boundaries

- Collaborator A: React shell, auth, discovery, browser location adapter.
- Collaborator B: Amplify backend, data/storage/auth, seed data, completion function.
- Collaborator C: completion UX, progression, sharing, tests.

## Open Questions

- [ ] Exact city and initial 8-12 challenge seed dataset values.
