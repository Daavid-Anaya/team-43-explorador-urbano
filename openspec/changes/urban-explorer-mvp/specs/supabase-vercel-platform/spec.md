# Supabase Vercel Platform Specification

## Purpose

Define the minimal Supabase-backed runtime and Vercel hosting expectations for the MVP. This spec supersedes the previous AWS/Amplify platform direction.

## Requirements

### Requirement: Supabase and Vercel Deployable Backend

The system MUST be deployable with Vercel for the web client and Supabase for authenticated data operations, RLS-protected persistence, private evidence storage, seed data, and completion validation.

#### Scenario: MVP environment is deployed

- GIVEN the team provisions the MVP environment
- WHEN the application is deployed
- THEN the frontend is reachable through Vercel
- AND Supabase Auth, Postgres/RLS, Storage, and completion validation support login, discovery, completion, and progress retrieval

#### Scenario: Seed dataset is loaded

- GIVEN the team provisions the MVP environment
- WHEN the curated challenge seed process runs
- THEN the active city has 8-12 challenges with the accepted challenge fields
- AND seeded challenge categories are limited to Art, History, Nature, Landmark, and Hidden Gem

#### Scenario: Seed data is missing or unavailable

- GIVEN the runtime is reachable but curated challenge seed data was not loaded correctly
- WHEN a user opens the discovery experience
- THEN the system returns an empty or unavailable challenge state without corrupting user progress
- AND the issue can be corrected by restoring the curated dataset

### Requirement: Non-Forgeable Completion and Rewards

The system MUST derive completion progress, points, and badges from server/DB-validated state. The client MUST NOT be trusted to submit points, badges, or reward progress.

#### Scenario: Client submits forged reward data

- GIVEN an authenticated user submits completion data with client-provided points or badges
- WHEN the completion boundary processes the request
- THEN the submitted reward fields are ignored or rejected
- AND awarded progress is derived from the accepted challenge and persisted completion history

#### Scenario: Supabase RLS protects user-owned data

- GIVEN an authenticated user attempts to read or write another user's profile, completion, or evidence metadata
- WHEN Supabase policies evaluate the request
- THEN the operation is denied unless an explicit read-safe policy allows it

#### Scenario: Service role is kept out of the browser

- GIVEN the frontend is built for Vercel
- WHEN environment variables are exposed to the browser bundle
- THEN only public Supabase URL and anon key values are available
- AND `SUPABASE_SERVICE_ROLE_KEY` is never exposed through `VITE_*`, client code, logs, or checked-in files

### Requirement: MVP Production Visibility

The MVP MUST define minimal production visibility for deploy, smoke, and backend failure diagnosis without requiring a full observability platform.

#### Scenario: Deployment evidence is captured

- GIVEN the team deploys the MVP through Vercel
- WHEN the deploy finishes
- THEN the team records the deploy result and relevant Vercel build/deploy logs
- AND the team captures manual smoke evidence including browser/device, expected path, result, and browser console errors if present

#### Scenario: Completion backend emits error evidence

- GIVEN the completion validation boundary is implemented in Supabase
- WHEN validation or runtime processing fails unexpectedly
- THEN Supabase logs or database-visible diagnostics provide enough evidence to diagnose validation, duplicate, storage, or persistence failures without exposing secrets

#### Scenario: Demo smoke checklist covers expected failures

- GIVEN the team prepares a demo-time health checklist
- WHEN the checklist is run
- THEN it covers login, discovery, successful completion, progression retrieval, share fallback, and expected failure capture
- AND expected failures include denied geolocation, inaccurate GPS, outside-radius attempts, duplicate completion, missing evidence, forged reward fields, and missing seed data

### Requirement: Post-Deploy Recovery

The MVP MUST document non-destructive recovery paths for frontend deploy, Supabase validation/policy, data seed, and production data safety issues.

#### Scenario: Frontend deploy is bad

- GIVEN the deployed frontend is broken after release
- WHEN a previous known-good Vercel deployment is available
- THEN the team redeploys that known-good version or reverts through a small PR before redeploying

#### Scenario: Seed data is bad

- GIVEN bad challenge seed data is active
- WHEN the issue affects discovery or demo correctness
- THEN the team disables or removes the bad seed records through a seed rollback task
- AND restores the known-good seed file before rerunning seed validation

#### Scenario: Supabase policy or validation boundary is bad

- GIVEN an RLS, storage policy, RPC, Edge Function, or Postgres function issue appears after deploy
- WHEN the issue cannot be safely handled through frontend rollback
- THEN the team fixes forward through a small PR and captures deploy plus smoke evidence after redeploy

#### Scenario: Destructive migration is proposed

- GIVEN a production data change could destroy or rewrite user, challenge, completion, reward, or evidence metadata
- WHEN the team proposes the change during the MVP
- THEN the change is blocked unless an explicit migration, recovery, and approval plan exists first
