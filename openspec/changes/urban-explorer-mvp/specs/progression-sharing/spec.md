# Progression Sharing Specification

## Purpose

Define MVP progression, route progress visibility, and achievement sharing.

## Requirements

### Requirement: Persisted Progression Rewards

The system MUST persist completed challenges, points, earned badges, current level, and challenge progress for each authenticated user.

The MVP level thresholds MUST be Explorer I at 0 points, Explorer II at 300 points, Explorer III at 700 points, City Ranger at 1200 points, and Urban Legend at 2000 points.

The MVP badge rules MUST include First Steps for completing 1 challenge, Weekend Walker for completing 3 challenges, Art Hunter for completing 2 Art challenges, History Seeker for completing 2 History challenges, Route Finisher for completing 5 challenges, and Early Explorer for completing the first challenge of the day.

#### Scenario: Completion updates progression

- GIVEN an authenticated user with an accepted challenge completion
- WHEN the completion is recorded
- THEN the system updates the user's points, badge eligibility, level, and progress history
- AND the user can later view the updated progression state

#### Scenario: User crosses a level threshold

- GIVEN an authenticated user has 290 points
- WHEN an accepted completion awards at least 10 points
- THEN the user's level becomes Explorer II
- AND the updated progression state includes the new total points and level

#### Scenario: User earns an MVP badge

- GIVEN an authenticated user has completed one Art challenge
- WHEN the user completes a second Art challenge
- THEN the system awards the Art Hunter badge
- AND the badge remains associated with that user profile

#### Scenario: User resumes an existing account

- GIVEN an authenticated user who previously completed one or more challenges
- WHEN the user reopens the application
- THEN the system restores prior completions and current progress state
- AND previously completed challenges are not offered as newly completable

### Requirement: Share Achievements

The system SHOULD let a user share a completed achievement using native browser or device sharing when supported, and MUST provide a fallback shareable summary when native sharing is unavailable.

#### Scenario: Native sharing is supported

- GIVEN a user viewing a completed achievement on a device with native sharing support
- WHEN the user chooses to share it
- THEN the system opens the native share flow with achievement details

#### Scenario: Native sharing is unavailable

- GIVEN a user viewing a completed achievement on a device without native sharing support
- WHEN the user chooses to share it
- THEN the system provides a fallback shareable summary or copyable content
