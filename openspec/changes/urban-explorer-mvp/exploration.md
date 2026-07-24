## Exploration: urban-explorer-mvp

### Current State
The repository is still in bootstrap state. Today it contains only `.atl/` metadata and initialized `openspec/` artifacts; no application source, deployment code, package manifest, or test runner exists yet.

For this change, the product goal is a hackathon-ready web app that feels original, is usable by real end users, and can be published quickly without overengineering. The best MVP target is a city exploration loop: discover nearby places, complete a walking challenge, prove arrival, earn progression, and share the result.

### Affected Areas
- `openspec/config.yaml` — constrains this phase to English artifacts, 3-developer delegation, and a ~400-line review mindset.
- `openspec/changes/urban-explorer-mvp/exploration.md` — exploration artifact for downstream proposal/spec/design/tasks phases.
- App bootstrap paths are not created yet — frontend, API, persistence, and infra folders remain TBD because no stack has been chosen in-repo.

### Approaches
1. **Browser-heavy static MVP** — Static frontend with local-only state, browser APIs, and minimal or no backend.
   - Pros: Fastest to demo, cheapest to host, strong hackathon novelty through device capabilities.
   - Cons: Weak persistence, limited anti-cheat controls, poor multi-device continuity, route personalization becomes shallow.
   - Effort: Low

2. **Lightweight managed-platform MVP** — Web frontend plus small managed backend for challenge state, evidence, progress, and identity.
   - Pros: Best balance for a publishable product, supports persistence and progression, and remains fast enough for a 3-person team.
   - Cons: Adds API/data modeling work, proof validation remains trust-based unless kept simple, auth can consume time if included too early.
   - Effort: Medium

3. **Full social platform MVP** — Real-time competition, complex personalization, social feeds, moderation, and rich media evidence.
   - Pros: Highest long-term product upside.
   - Cons: Too large for hackathon scope, high review-budget risk, likely to dilute the core walking challenge loop.
   - Effort: High

### Recommendation
Choose **Lightweight managed-platform MVP** with a ruthless boundary around the core loop.

> Historical note: later SDD phases narrowed the accepted MVP to geolocation + photo evidence, a one-city curated catalog, no route personalization in the first release, and Supabase + Vercel instead of AWS/Amplify. Use `proposal.md`, `design.md`, `specs/*/spec.md`, and `tasks.md` as the current source of truth.

**Historical MVP scope considered during exploration**
- Target users: curious city walkers, tourists, students, and friend groups who want a playful reason to explore nearby places.
- Core product problem: city discovery is usually passive and unstructured; users need a lightweight challenge loop that turns walking into a rewarding game.
- MVP loop: open app → see nearby curated challenges → navigate to a place → confirm completion → earn points/badge progress → share achievement.

**MVP features that SHOULD be in scope**
- Nearby challenge list based on curated points of interest.
- Arrival confirmation with **Geolocation API** using radius-based proximity checks.
- Superseded recommendation: one primary proof mode for MVP was originally framed as **QR scan** OR **photo capture**. Later SDD phases selected geolocation + photo evidence and moved QR scanning out of active MVP guidance.
- Points, badges, and basic level progression.
- Superseded recommendation: simple personalized route suggestions from a small curated dataset were considered during exploration. Later SDD phases removed route personalization from the first release.
- Achievement sharing with **Web Share API** when supported.

**Browser APIs that fit well**
- **Geolocation API** — essential for nearby challenges and arrival confirmation.
- **MediaDevices/getUserMedia** — camera access for QR scanning or photo evidence capture.
- **BarcodeDetector API** — attractive native QR option, but MDN marks it experimental and not baseline across major browsers, so a fallback scanner library is required.
- **Web Share API** — strong mobile-friendly finishing move for challenge completion.
- **Service Worker + IndexedDB** — reasonable only for lightweight caching of challenge data, last route, and queued completion attempts; full offline-first sync should be a stretch goal.

**External services / deployment options**
- **Accepted platform**: Supabase for Auth, Postgres/RLS, private Storage, and the completion validation boundary.
- **Accepted hosting**: Vercel for the web frontend, environment management, preview deployments, and production deploy logs.
- **Superseded AWS plan**: Amplify Hosting, API Gateway/Lambda, DynamoDB, and S3 were considered earlier but are no longer the active implementation direction because team speed matters more than AWS alignment.
- **Map/place data**: Mapbox, MapTiler, or OpenStreetMap-based options are viable; final choice should depend on free-tier limits and hackathon presentation needs.

**Realistic first slice for 3 collaborators**
- **Developer 1 — Discovery UX**: challenge list, map/list browsing, challenge detail, route preview, share UI.
- **Developer 2 — Proof mechanics**: geolocation arrival check, photo evidence capture flow, client-side completion states, permission/error handling.
- **Developer 3 — Platform**: deployment bootstrap, small API, persistence model, seed dataset, scoring/badge rules.

**Assumptions**
- Initial launch focuses on one city or one curated district, not global coverage.
- Challenge content is curated by the team, not user-generated.
- Anti-cheat is “good enough for MVP,” not production-grade fraud prevention.

**Open product questions**
- Is the first release anonymous/nickname-based, or does it require authentication?
- Historical question resolved by later SDD phases: proof mode is geolocation + photo evidence.
- Is route personalization rules-based from curated POIs, or does it need preference onboarding?
- Must social sharing generate public profile pages, or is native device sharing enough?
- Which city/dataset is the demo anchor for the hackathon?

**Non-goals for MVP**
- Real-time multiplayer competition.
- User-generated places/challenges.
- Advanced computer vision validation.
- Complex moderation/backoffice systems.
- Deep offline-first synchronization.

### Risks
- Browser permission denial or poor GPS accuracy can break the completion loop if no graceful fallback exists.
- Historical QR risk is superseded for the active MVP because QR scanning is not the primary proof path; geolocation accuracy and photo permission failures remain the active proof risks.
- Trying to ship auth, social graph, offline sync, and dual proof modes together will blow up hackathon scope.
- Map/geocoding providers can introduce quota or pricing surprises if chosen late.
- With the platform decision now updated, implementation must follow Supabase + Vercel artifacts rather than the superseded AWS/Amplify plan.

### Ready for Proposal
Yes - provided the next phase locks the exact city, seed dataset, and Supabase/Vercel environment ownership before implementation.
