# Proposal: Urban Explorer MVP

## Intent

Build a hackathon-ready web app that turns one-city exploration into a game. Users should discover a manually curated initial set of 8-12 challenges, prove they visited the place with geolocation plus photo evidence, earn progress, and share the result. The first release must be small enough for 3 collaborators to split safely.

## Scope

### In Scope
- One-city curated challenge catalog with 8-12 manually curated initial challenges sorted by distance when location is available.
- Simple login, user profile, points, badges, and completion history.
- Challenge completion using location radius checks plus photo evidence.
- Fixed MVP challenge contract: `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, `estimatedMinutes`.
- Fixed MVP progression thresholds and badges for the accepted one-city launch scope.
- AWS-first deployable web/API/data foundation.
- Native sharing of completed achievements when supported.

### Out of Scope
- Multi-city support, map-first discovery, global city coverage, and user-generated challenges.
- Dynamic challenge catalog management.
- Real-time multiplayer, social feeds, leaderboards beyond basic progress.
- Complex anti-cheat, advanced fraud detection, photo moderation, and full offline-first sync.

## Capabilities

### New Capabilities
- `user-identity`: simple login, user profile, and authenticated progress ownership.
- `challenge-discovery`: curated one-city challenge list with distance display and detail view.
- `challenge-completion`: geolocation proximity validation plus photo evidence capture/submission.
- `progression-sharing`: points, badges, completion history, and achievement sharing.
- `aws-platform`: AWS-first hosting, API, persistence, seed data, and environment setup.

### Modified Capabilities
- None.

## Approach

Use the exploration-recommended lightweight serverless MVP: web frontend hosted on AWS Amplify with a small AWS-backed data/function layer for users, challenges, completions, badges, and evidence metadata. Keep proof validation trust-based for MVP: authenticated user + `radiusMeters = 80` + `maxGpsAccuracyMeters = 100` + required uploaded photo evidence + duplicate-completion rejection, with no computer vision.

Accepted baseline decisions:
- City scope: one-city MVP.
- Initial catalog: 8-12 manually curated challenges.
- Challenge categories: Art, History, Nature, Landmark, Hidden Gem.
- Level thresholds: Explorer I at 0 points, Explorer II at 300, Explorer III at 700, City Ranger at 1200, Urban Legend at 2000.
- MVP badges: First Steps, Weekend Walker, Art Hunter, History Seeker, Route Finisher, Early Explorer.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app` | New | Discovery, auth, completion, progression UI |
| `amplify/data`, `amplify/functions`, `amplify/storage` | New | Challenge, completion, profile, rewards, and evidence backend contracts |
| `amplify/auth`, `amplify/backend.ts`, `amplify.yml` | New | AWS auth, backend composition, and hosting/deploy setup |
| `openspec/changes/urban-explorer-mvp` | Modified | Proposal/spec/design/tasks artifacts |

## Assumptions and Open Decisions

- Assumption: challenge content is curated and seeded by the team.
- Assumption: MVP anti-cheat is “good enough,” not production-grade.
- Open: exact city and initial POI dataset values.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| GPS/photo permissions break completion | Med | clear error states and retry paths |
| AWS setup consumes hackathon time | Med | keep services minimal; defer complex IaC |
| Scope expands across 3 developers | High | split by capabilities and protect 400-line reviews |

## Rollback Plan

Before merge, remove the change artifacts and any generated app/API/infra slice from the feature branch if the MVP direction is abandoned.

After deployment, use the smallest safe recovery path:

- Frontend deploy failure: redeploy the previous known-good Amplify commit/build when available, or revert with a small PR and redeploy.
- Seed data failure: disable/remove the bad seed records through a seed rollback task and restore the known-good seed file.
- Backend/function/resource failure: fix forward with a small PR for the Amplify resource or `submitCompletion` function, then capture deploy and smoke evidence.
- Production data safety: no destructive production data migrations are allowed in the MVP without an explicit migration and recovery plan.

## Dependencies

- AWS account access for Amplify, Lambda/API Gateway, and DynamoDB.
- Browser Geolocation and camera permissions.
- Curated one-city POI/challenge seed dataset.

## Success Criteria

- [ ] A logged-in user can see nearby challenges as a distance-sorted list.
- [ ] A user can complete a challenge with geolocation plus photo evidence.
- [ ] Progress persists and displays points/badges/history.
- [ ] The MVP is deployable on AWS and taskable across 3 developers.
