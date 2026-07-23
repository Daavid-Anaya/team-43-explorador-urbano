# Challenge Discovery Specification

## Purpose

Define nearby challenge discovery for a single curated city with an initial manually curated catalog.

## Requirements

### Requirement: Distance-Sorted Nearby Challenges

The system MUST present curated challenges for the active city as a list sorted by nearest distance when usable location data is available, SHALL show each challenge's basic progress state, and MUST expose a challenge detail view before completion.

The initial MVP catalog MUST contain 8-12 manually curated challenges for one city. Each challenge MUST include `title`, `description`, `category`, `latitude`, `longitude`, `radiusMeters`, `points`, `photoPrompt`, `difficulty`, and `estimatedMinutes`. The supported MVP categories MUST be Art, History, Nature, Landmark, and Hidden Gem.

#### Scenario: Nearby list uses current location

- GIVEN an authenticated user who granted geolocation permission
- WHEN the user opens the challenge list
- THEN the system shows the one-city curated challenges ordered from smallest to largest distance
- AND each item shows distance and whether the challenge is not started, in progress, or completed

#### Scenario: Permission denied still allows browsing

- GIVEN an authenticated user who denied geolocation permission
- WHEN the user opens the challenge list
- THEN the system still shows the curated one-city challenge catalog
- AND the system explains that distance sorting and proximity validation are limited without location access

#### Scenario: User opens a challenge detail view

- GIVEN an authenticated user viewing the curated challenge list
- WHEN the user selects a challenge
- THEN the system shows challenge details needed to attempt completion
- AND the view includes current completion state for that user

#### Scenario: Challenge catalog uses the accepted MVP contract

- GIVEN the initial challenge dataset is loaded
- WHEN the system renders the discovery list or detail view
- THEN every challenge includes the required challenge fields
- AND every challenge category is one of Art, History, Nature, Landmark, or Hidden Gem
- AND the initial dataset contains no fewer than 8 and no more than 12 challenges
