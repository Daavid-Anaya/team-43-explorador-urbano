# PWA Shell Specification

## Purpose

Define an installable Progressive Web App shell with read-only offline support for the curated challenge catalog. This spec does not change the server-side completion boundary: challenge completion always requires network access.

## Requirements

### Requirement: Installable Web App Manifest

The system MUST ship a Web App Manifest declaring `name`, `short_name`, `start_url`, `display: standalone`, `orientation`, `theme_color`, `background_color`, and icons at 192x192 and 512x512 including a maskable icon variant.

#### Scenario: User installs the app

- GIVEN a user opens the deployed app in a supporting browser
- WHEN the browser evaluates installability criteria against the manifest and service worker
- THEN the app qualifies as installable
- AND the installed app launches standalone with the configured theme and icons

#### Scenario: iOS and Android splash screens render on launch

- GIVEN a user installed the app on iOS or Android
- WHEN the user launches the installed app
- THEN the platform shows a splash screen derived from the manifest/meta configuration for that platform
- AND the app shell loads without a blank-screen flash before the first paint

### Requirement: Custom Install Prompt

The system SHOULD present a custom install prompt using the `beforeinstallprompt` event on supporting browsers, and MUST NOT block core app usage when the native prompt is unavailable or dismissed.

#### Scenario: User accepts the custom install prompt

- GIVEN a supporting browser fires `beforeinstallprompt`
- WHEN the user accepts the app's custom install call-to-action
- THEN the system triggers the deferred native install flow
- AND the custom prompt does not reappear after installation

#### Scenario: Install prompt is unsupported

- GIVEN a browser that never fires `beforeinstallprompt`
- WHEN the user browses the app
- THEN the app remains fully usable online
- AND no install call-to-action blocks navigation or challenge discovery

### Requirement: Precached App Shell

The system MUST register a service worker that precaches the app shell (HTML entry, core JS/CSS bundles, and static icons) so the shell itself loads without network access after first successful load.

#### Scenario: App shell opens without network

- GIVEN a user previously loaded the app once with network access and the service worker activated
- WHEN the user opens the app with no network connection
- THEN the app shell renders from the precache
- AND core navigation (discovery list, detail view, progression view) is reachable

### Requirement: Read-Only Runtime Caching of the Challenge Catalog

The system MUST cache read-only challenge catalog responses (challenge list and challenge detail data) using a stale-while-revalidate strategy so previously viewed catalog data remains visible offline.

The system MUST NOT cache authenticated write endpoints, the completion submission boundary (`submit_completion`), or any private Supabase Storage evidence URL. The service worker MUST NOT use the Background Sync API to queue offline completion attempts.

#### Scenario: Catalog is visible offline after a prior visit

- GIVEN a user browsed the challenge catalog while online at least once
- WHEN the user reopens the challenge list without network access
- THEN the system shows the last cached catalog data
- AND the system indicates the data may be stale until connectivity returns

#### Scenario: Completing a challenge is blocked offline

- GIVEN a user without network access opens a challenge detail view
- WHEN the user attempts to submit completion evidence
- THEN the system blocks the submission before calling `submit_completion`
- AND the user sees a clear message that completing a challenge requires an internet connection
- AND the attempt is never queued or retried in the background

#### Scenario: Private evidence and auth routes are never cached

- GIVEN the service worker evaluates a fetch request
- WHEN the request targets an authenticated Supabase Auth endpoint or a private Storage evidence URL
- THEN the service worker does not serve or store a cached response for that request
- AND the request always goes to the network

### Requirement: Offline State Indication

The system MUST show a clear offline indicator or dedicated offline state when the user has no network connection, distinguishing browsable cached content from actions that require connectivity.

#### Scenario: User loses connectivity mid-session

- GIVEN a user is actively using the installed app
- WHEN the device loses network connectivity
- THEN the system shows an offline indicator
- AND read-only cached views remain reachable while write actions are visibly disabled or explained

### Requirement: Service Worker Update Flow

The system MUST detect a new service worker version and prompt the user to update rather than silently applying a new version that could serve mismatched app-shell assets.

#### Scenario: New version is available

- GIVEN a new service worker version has been deployed
- WHEN the installed app detects the waiting new version
- THEN the system shows an update-available prompt
- AND accepting the prompt activates the new service worker and reloads the app shell

### Requirement: Optional Share Target

The system MAY register a Web Share Target so supported platforms can share content into the app, scoped to sharing a completed achievement summary; this MUST NOT be used to submit challenge completions or evidence.

#### Scenario: User shares into the app via Share Target

- GIVEN the app declared a `share_target` in the manifest on a supporting platform
- WHEN the user shares text or a link into the installed app
- THEN the system opens the achievement-sharing context with the shared content
- AND the shared content never triggers a challenge completion submission

## Non-Goals

- No full offline-first write sync. Queuing challenge completions offline (via Background Sync API or otherwise) is explicitly out of scope and MUST NOT be implemented under this spec.
- No offline caching of authenticated or private data (Supabase Auth responses, private Storage evidence, user profile writes).
