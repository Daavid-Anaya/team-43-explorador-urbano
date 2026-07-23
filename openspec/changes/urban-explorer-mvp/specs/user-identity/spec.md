# User Identity Specification

## Purpose

Define lightweight sign-in and user-owned progress for the MVP.

## Requirements

### Requirement: Simple Authenticated Identity

The system MUST let a person create or resume a lightweight authenticated identity before storing progress, and MUST associate profile, points, badges, and completions with that identity.

#### Scenario: First login creates profile

- GIVEN a visitor without an existing session
- WHEN the visitor completes the MVP login flow
- THEN the system creates or retrieves a user profile and starts an authenticated session
- AND subsequent progress is owned by that user identity

#### Scenario: Anonymous user tries to persist progress

- GIVEN a visitor who is not authenticated
- WHEN the visitor attempts to submit challenge completion or open saved progress
- THEN the system blocks persistence until login is completed
- AND the visitor is shown a clear sign-in requirement
