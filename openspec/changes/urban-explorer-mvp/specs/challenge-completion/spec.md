# Challenge Completion Specification

## Purpose

Define proof of visit through proximity checks and photo evidence.

## Requirements

### Requirement: Proximity-Gated Photo Submission

The system MUST require an authenticated user, geolocation-based proximity validation, acceptable GPS accuracy, uploaded photo evidence, and no prior completion of the same challenge before marking a challenge complete.

Unless a challenge overrides `radiusMeters`, MVP completion MUST use `radiusMeters = 80`. The system MUST reject completion when `accuracyMeters` is missing or greater than `maxGpsAccuracyMeters = 100`.

#### Scenario: User completes challenge inside allowed radius

- GIVEN an authenticated user is within the configured challenge radius, has GPS accuracy of 100 meters or better, and has uploaded photo evidence
- WHEN the user submits completion evidence
- THEN the system stores the evidence submission and marks the challenge complete for that user
- AND the completion result returns updated progress data

#### Scenario: Location is outside radius or too inaccurate

- GIVEN an authenticated user attempting completion with location outside the allowed radius or GPS accuracy greater than 100 meters
- WHEN the user submits completion evidence
- THEN the system rejects the completion attempt
- AND the user is told to move closer or retry when GPS accuracy improves

#### Scenario: User is unauthenticated

- GIVEN a visitor without an authenticated session
- WHEN the visitor attempts to submit challenge completion evidence
- THEN the system rejects the completion attempt
- AND the visitor is told to sign in before completing challenges

#### Scenario: Photo evidence is missing

- GIVEN an authenticated user inside the allowed radius with acceptable GPS accuracy
- WHEN the user submits completion without uploaded photo evidence
- THEN the system rejects the completion attempt
- AND the challenge remains incomplete for that user

#### Scenario: Geolocation permission is denied for completion

- GIVEN an authenticated user denied geolocation permission on a device needed for completion proof
- WHEN the user attempts to submit a challenge completion
- THEN the system does not accept the completion
- AND the user is told that location permission is required for MVP proof validation

#### Scenario: Photo upload or connection fails

- GIVEN an authenticated user passed proximity validation
- WHEN photo capture, upload, or submission fails because of device or network error
- THEN the system does not mark the challenge complete
- AND the user sees a retry path without creating a duplicate completion

#### Scenario: User attempts duplicate completion

- GIVEN an authenticated user already completed a specific challenge
- WHEN the user resubmits evidence for the same challenge
- THEN the system rejects the duplicate completion
- AND the user's existing points and rewards remain unchanged
