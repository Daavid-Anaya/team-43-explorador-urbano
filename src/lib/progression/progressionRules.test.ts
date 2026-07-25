import { describe, expect, it } from "vitest";

import {
  BADGES,
  CHALLENGE_CATEGORIES,
  PROGRESSION_LEVELS,
  deriveEarnedBadges,
  deriveLevelProgress,
  deriveProgress,
  deriveTotalPoints,
  type AcceptedChallengeCompletion,
} from "./progressionRules";

const acceptedCompletions: AcceptedChallengeCompletion[] = [
  {
    challengeId: "art-mural-walk",
    category: CHALLENGE_CATEGORIES.ART,
    awardedPoints: 120,
    acceptedAt: "2026-07-24T09:00:00.000Z",
  },
  {
    challengeId: "history-plaza",
    category: CHALLENGE_CATEGORIES.HISTORY,
    awardedPoints: 130,
    acceptedAt: "2026-07-24T10:00:00.000Z",
  },
  {
    challengeId: "art-gallery-front",
    category: CHALLENGE_CATEGORIES.ART,
    awardedPoints: 150,
    acceptedAt: "2026-07-25T11:00:00.000Z",
  },
  {
    challengeId: "history-station",
    category: CHALLENGE_CATEGORIES.HISTORY,
    awardedPoints: 160,
    acceptedAt: "2026-07-25T12:00:00.000Z",
  },
  {
    challengeId: "hidden-courtyard",
    category: CHALLENGE_CATEGORIES.HIDDEN_GEM,
    awardedPoints: 180,
    acceptedAt: "2026-07-26T13:00:00.000Z",
  },
];

describe("progression rules", () => {
  it("represents the MVP level thresholds", () => {
    expect(PROGRESSION_LEVELS).toEqual([
      { name: "Explorer I", minimumPoints: 0 },
      { name: "Explorer II", minimumPoints: 300 },
      { name: "Explorer III", minimumPoints: 700 },
      { name: "City Ranger", minimumPoints: 1_200 },
      { name: "Urban Legend", minimumPoints: 2_000 },
    ]);
  });

  it("represents the six MVP badges", () => {
    expect(Object.values(BADGES)).toEqual([
      "First Steps",
      "Weekend Walker",
      "Art Hunter",
      "History Seeker",
      "Route Finisher",
      "Early Explorer",
    ]);
  });

  it("derives total points only from accepted completions", () => {
    expect(deriveTotalPoints(acceptedCompletions)).toBe(740);
  });

  it("deduplicates accepted completions by challenge id using the earliest accepted timestamp", () => {
    const duplicateCompletions: AcceptedChallengeCompletion[] = [
      {
        challengeId: "art-mural-walk",
        category: CHALLENGE_CATEGORIES.HISTORY,
        awardedPoints: 1_000,
        acceptedAt: "2026-07-25T09:00:00.000Z",
      },
      {
        challengeId: "art-mural-walk",
        category: CHALLENGE_CATEGORIES.ART,
        awardedPoints: 120,
        acceptedAt: "2026-07-24T09:00:00.000Z",
      },
      {
        challengeId: "history-plaza",
        category: CHALLENGE_CATEGORIES.HISTORY,
        awardedPoints: 130,
        acceptedAt: "2026-07-24T10:00:00.000Z",
      },
      {
        challengeId: "history-station",
        category: CHALLENGE_CATEGORIES.HISTORY,
        awardedPoints: 160,
        acceptedAt: "2026-07-25T12:00:00.000Z",
      },
    ];

    expect(deriveProgress(duplicateCompletions)).toMatchObject({
      totalPoints: 410,
      completedChallengeCount: 3,
      earnedBadges: [
        BADGES.FIRST_STEPS,
        BADGES.WEEKEND_WALKER,
        BADGES.HISTORY_SEEKER,
        BADGES.EARLY_EXPLORER,
      ],
    });
  });

  it("ignores invalid awarded points for totals while keeping valid completions for counts and badges", () => {
    const completionsWithInvalidPoints: AcceptedChallengeCompletion[] = [
      {
        challengeId: "art-mural-walk",
        category: CHALLENGE_CATEGORIES.ART,
        awardedPoints: Number.NaN,
        acceptedAt: "2026-07-24T09:00:00.000Z",
      },
      {
        challengeId: "art-gallery-front",
        category: CHALLENGE_CATEGORIES.ART,
        awardedPoints: Number.POSITIVE_INFINITY,
        acceptedAt: "2026-07-24T10:00:00.000Z",
      },
      {
        challengeId: "history-plaza",
        category: CHALLENGE_CATEGORIES.HISTORY,
        awardedPoints: -50,
        acceptedAt: "2026-07-24T11:00:00.000Z",
      },
    ];

    expect(deriveProgress(completionsWithInvalidPoints)).toMatchObject({
      totalPoints: 0,
      completedChallengeCount: 3,
      earnedBadges: [
        BADGES.FIRST_STEPS,
        BADGES.WEEKEND_WALKER,
        BADGES.ART_HUNTER,
        BADGES.EARLY_EXPLORER,
      ],
    });
  });

  it("derives current level and progress toward the next level", () => {
    expect(deriveLevelProgress(740)).toEqual({
      currentLevel: "Explorer III",
      nextLevel: "City Ranger",
      currentLevelMinimumPoints: 700,
      nextLevelMinimumPoints: 1_200,
      pointsIntoCurrentLevel: 40,
      pointsToNextLevel: 460,
      percentToNextLevel: 8,
    });
  });

  it("derives max-level progress without a next threshold", () => {
    expect(deriveLevelProgress(2_050)).toEqual({
      currentLevel: "Urban Legend",
      nextLevel: null,
      currentLevelMinimumPoints: 2_000,
      nextLevelMinimumPoints: null,
      pointsIntoCurrentLevel: 50,
      pointsToNextLevel: null,
      percentToNextLevel: 100,
    });
  });

  it("derives all MVP badges from accepted completions", () => {
    expect(deriveEarnedBadges(acceptedCompletions)).toEqual([
      BADGES.FIRST_STEPS,
      BADGES.WEEKEND_WALKER,
      BADGES.ART_HUNTER,
      BADGES.HISTORY_SEEKER,
      BADGES.ROUTE_FINISHER,
      BADGES.EARLY_EXPLORER,
    ]);
  });

  it("does not award date-based badges for invalid accepted timestamps", () => {
    expect(
      deriveEarnedBadges([
        {
          challengeId: "art-mural-walk",
          category: CHALLENGE_CATEGORIES.ART,
          awardedPoints: 120,
          acceptedAt: "not-a-date",
        },
      ]),
    ).toEqual([BADGES.FIRST_STEPS]);
  });

  it("normalizes accepted timestamps to UTC dates for date-based badges", () => {
    expect(
      deriveEarnedBadges([
        {
          challengeId: "art-mural-walk",
          category: CHALLENGE_CATEGORIES.ART,
          awardedPoints: 120,
          acceptedAt: "2026-07-24T23:30:00-02:00",
        },
      ]),
    ).toEqual([BADGES.FIRST_STEPS, BADGES.EARLY_EXPLORER]);
  });

  it("derives a complete progress summary without client-supplied rewards", () => {
    expect(deriveProgress(acceptedCompletions)).toEqual({
      totalPoints: 740,
      completedChallengeCount: 5,
      level: {
        currentLevel: "Explorer III",
        nextLevel: "City Ranger",
        currentLevelMinimumPoints: 700,
        nextLevelMinimumPoints: 1_200,
        pointsIntoCurrentLevel: 40,
        pointsToNextLevel: 460,
        percentToNextLevel: 8,
      },
      earnedBadges: [
        BADGES.FIRST_STEPS,
        BADGES.WEEKEND_WALKER,
        BADGES.ART_HUNTER,
        BADGES.HISTORY_SEEKER,
        BADGES.ROUTE_FINISHER,
        BADGES.EARLY_EXPLORER,
      ],
    });
  });
});
