# AWS Platform Specification

## Purpose

Define the minimal AWS-backed runtime and persistence expectations for the MVP.

## Requirements

### Requirement: AWS-First Deployable Backend

The system MUST be deployable on AWS using managed hosting for the web client, authenticated data/function operations for challenge and progress workflows, protected storage for uploaded photo evidence, and persistent storage for users, curated challenges, completions, rewards, and evidence metadata.

#### Scenario: MVP environment is deployed

- GIVEN the team provisions the MVP environment
- WHEN the application is deployed
- THEN the frontend, API, and persistence layers are reachable through AWS-managed services
- AND the deployed system supports end-to-end login, discovery, completion, and progress retrieval

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

### Requirement: MVP Production Visibility

The MVP MUST define minimal production visibility for deploy, smoke, and backend failure diagnosis without requiring a full observability platform.

#### Scenario: Deployment evidence is captured

- GIVEN the team deploys the MVP through Amplify Hosting or an equivalent Amplify deploy path
- WHEN the deploy finishes
- THEN the team records the deploy result and relevant Amplify Hosting build/deploy logs
- AND the team captures manual smoke evidence including browser/device, expected path, result, and browser console errors if present

#### Scenario: Completion backend emits error evidence

- GIVEN the `submitCompletion` function is implemented
- WHEN completion validation or runtime processing fails unexpectedly
- THEN the backend function writes error details to AWS-managed function logs, conceptually CloudWatch
- AND the logged evidence is sufficient to diagnose validation, duplicate, storage, or persistence failures without exposing secrets

#### Scenario: Demo smoke checklist covers expected failures

- GIVEN the team prepares a demo-time health checklist
- WHEN the checklist is run
- THEN it covers login, discovery, successful completion, progression retrieval, share fallback, and expected failure capture
- AND expected failures include denied geolocation, inaccurate GPS, outside-radius attempts, duplicate completion, missing evidence, and missing seed data

### Requirement: Post-Deploy Recovery

The MVP MUST document non-destructive recovery paths for frontend deploy, backend/function, data seed, and production data safety issues.

#### Scenario: Frontend deploy is bad

- GIVEN the deployed frontend is broken after release
- WHEN a previous known-good commit/build is available in Amplify Hosting
- THEN the team redeploys that known-good frontend version or reverts through a small PR before redeploying

#### Scenario: Seed data is bad

- GIVEN bad challenge seed data is active
- WHEN the issue affects discovery or demo correctness
- THEN the team disables or removes the bad seed records through a seed rollback task
- AND restores the known-good seed file before rerunning seed validation

#### Scenario: Backend resource or function is bad

- GIVEN an Amplify resource or `submitCompletion` issue appears after deploy
- WHEN the issue cannot be safely handled through frontend rollback
- THEN the team fixes forward through a small PR and captures deploy plus smoke evidence after redeploy

#### Scenario: Destructive migration is proposed

- GIVEN a production data change could destroy or rewrite user, challenge, completion, reward, or evidence metadata
- WHEN the team proposes the change during the MVP
- THEN the change is blocked unless an explicit migration, recovery, and approval plan exists first
