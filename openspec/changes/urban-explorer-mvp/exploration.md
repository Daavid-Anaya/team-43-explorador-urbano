## Exploration: urban-explorer-mvp

> Later SDD phases narrowed the accepted scope. Use `proposal.md`, `design.md`,
> `specs/*/spec.md`, and `tasks.md` as the current source of truth.

### Current State
The repository was in bootstrap state during exploration: only `.atl/` metadata and
initialized `openspec/` artifacts, with no application source, deployment code, package
manifest, or test runner yet.

The product goal is a hackathon-ready web app that feels original, is usable by real end
users, and can be published quickly without overengineering. The best MVP target is a
city exploration loop: discover nearby places, complete a walking challenge, prove
arrival, earn progression, and share the result.

### Approaches
1. **Browser-heavy static MVP** — Static frontend with local-only state, browser APIs, and minimal or no backend.
   - Pros: Fastest to demo, cheapest to host, strong hackathon novelty through device capabilities.
   - Cons: Weak persistence, limited anti-cheat controls, poor multi-device continuity.
   - Effort: Low

2. **Lightweight managed-platform MVP** — Web frontend plus small managed backend for challenge state, evidence, progress, and identity.
   - Pros: Best balance for a publishable product, supports persistence and progression, fast enough for a 3-person team.
   - Cons: Adds API/data modeling work, proof validation stays trust-based unless kept simple, auth can consume time if included too early.
   - Effort: Medium

3. **Full social platform MVP** — Real-time competition, complex personalization, social feeds, moderation, and rich media evidence.
   - Pros: Highest long-term product upside.
   - Cons: Too large for hackathon scope, high review-budget risk, dilutes the core walking challenge loop.
   - Effort: High

### Recommendation
Choose **Lightweight managed-platform MVP** with a ruthless boundary around the core loop:
geolocation + photo evidence, a one-city curated catalog, Supabase for Auth/Postgres/RLS/
Storage and the completion validation boundary, and Vercel for hosting.

### Risks
- Browser permission denial or poor GPS accuracy can break the completion loop without a graceful fallback.
- Trying to ship auth, social graph, offline sync, and dual proof modes together will blow up hackathon scope.
- Map/geocoding providers can introduce quota or pricing surprises if chosen late.

### Ready for Proposal
Yes — provided the next phase locks the exact city, seed dataset, and Supabase/Vercel
environment ownership before implementation.
