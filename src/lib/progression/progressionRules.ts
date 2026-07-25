export const CHALLENGE_CATEGORIES = {
  ART: "Art",
  HISTORY: "History",
  NATURE: "Nature",
  LANDMARK: "Landmark",
  HIDDEN_GEM: "Hidden Gem",
} as const;

export type ChallengeCategory =
  (typeof CHALLENGE_CATEGORIES)[keyof typeof CHALLENGE_CATEGORIES];

export const PROGRESSION_LEVELS = [
  { name: "Explorer I", minimumPoints: 0 },
  { name: "Explorer II", minimumPoints: 300 },
  { name: "Explorer III", minimumPoints: 700 },
  { name: "City Ranger", minimumPoints: 1_200 },
  { name: "Urban Legend", minimumPoints: 2_000 },
] as const;

export type ProgressionLevelName = (typeof PROGRESSION_LEVELS)[number]["name"];

export const BADGES = {
  FIRST_STEPS: "First Steps",
  WEEKEND_WALKER: "Weekend Walker",
  ART_HUNTER: "Art Hunter",
  HISTORY_SEEKER: "History Seeker",
  ROUTE_FINISHER: "Route Finisher",
  EARLY_EXPLORER: "Early Explorer",
} as const;

export type BadgeName = (typeof BADGES)[keyof typeof BADGES];

export interface AcceptedChallengeCompletion {
  challengeId: string;
  category: ChallengeCategory;
  awardedPoints: number;
  acceptedAt: string;
}

export interface LevelProgress {
  currentLevel: ProgressionLevelName;
  nextLevel: ProgressionLevelName | null;
  currentLevelMinimumPoints: number;
  nextLevelMinimumPoints: number | null;
  pointsIntoCurrentLevel: number;
  pointsToNextLevel: number | null;
  percentToNextLevel: number;
}

export interface DerivedProgress {
  totalPoints: number;
  completedChallengeCount: number;
  level: LevelProgress;
  earnedBadges: BadgeName[];
}

export function deriveTotalPoints(
  completions: readonly AcceptedChallengeCompletion[],
): number {
  return deduplicateAcceptedCompletions(completions).reduce(
    (totalPoints, completion) =>
      totalPoints + getValidAwardedPoints(completion.awardedPoints),
    0,
  );
}

export function deriveLevelProgress(totalPoints: number): LevelProgress {
  const currentLevelIndex = findCurrentLevelIndex(totalPoints);
  const currentLevel = PROGRESSION_LEVELS[currentLevelIndex] ?? PROGRESSION_LEVELS[0];
  const nextLevel = PROGRESSION_LEVELS[currentLevelIndex + 1] ?? null;
  const pointsIntoCurrentLevel = totalPoints - currentLevel.minimumPoints;

  if (nextLevel === null) {
    return {
      currentLevel: currentLevel.name,
      nextLevel: null,
      currentLevelMinimumPoints: currentLevel.minimumPoints,
      nextLevelMinimumPoints: null,
      pointsIntoCurrentLevel,
      pointsToNextLevel: null,
      percentToNextLevel: 100,
    };
  }

  const pointsToNextLevel = nextLevel.minimumPoints - totalPoints;
  const currentLevelRange = nextLevel.minimumPoints - currentLevel.minimumPoints;

  return {
    currentLevel: currentLevel.name,
    nextLevel: nextLevel.name,
    currentLevelMinimumPoints: currentLevel.minimumPoints,
    nextLevelMinimumPoints: nextLevel.minimumPoints,
    pointsIntoCurrentLevel,
    pointsToNextLevel,
    percentToNextLevel: Math.floor(
      (pointsIntoCurrentLevel / currentLevelRange) * 100,
    ),
  };
}

export function deriveEarnedBadges(
  completions: readonly AcceptedChallengeCompletion[],
): BadgeName[] {
  const deduplicatedCompletions = deduplicateAcceptedCompletions(completions);
  const completionCount = deduplicatedCompletions.length;
  const artCompletionCount = countCompletionsByCategory(
    deduplicatedCompletions,
    CHALLENGE_CATEGORIES.ART,
  );
  const historyCompletionCount = countCompletionsByCategory(
    deduplicatedCompletions,
    CHALLENGE_CATEGORIES.HISTORY,
  );
  const firstAcceptedDayCount = new Set(
    deduplicatedCompletions
      .map((completion) => getUtcDateKey(completion.acceptedAt))
      .filter((dateKey) => dateKey !== null),
  ).size;
  const earnedBadges: BadgeName[] = [];

  if (completionCount >= 1) {
    earnedBadges.push(BADGES.FIRST_STEPS);
  }

  if (completionCount >= 3) {
    earnedBadges.push(BADGES.WEEKEND_WALKER);
  }

  if (artCompletionCount >= 2) {
    earnedBadges.push(BADGES.ART_HUNTER);
  }

  if (historyCompletionCount >= 2) {
    earnedBadges.push(BADGES.HISTORY_SEEKER);
  }

  if (completionCount >= 5) {
    earnedBadges.push(BADGES.ROUTE_FINISHER);
  }

  if (firstAcceptedDayCount >= 1) {
    earnedBadges.push(BADGES.EARLY_EXPLORER);
  }

  return earnedBadges;
}

export function deriveProgress(
  completions: readonly AcceptedChallengeCompletion[],
): DerivedProgress {
  const deduplicatedCompletions = deduplicateAcceptedCompletions(completions);
  const totalPoints = deriveTotalPoints(deduplicatedCompletions);

  return {
    totalPoints,
    completedChallengeCount: deduplicatedCompletions.length,
    level: deriveLevelProgress(totalPoints),
    earnedBadges: deriveEarnedBadges(deduplicatedCompletions),
  };
}

function deduplicateAcceptedCompletions(
  completions: readonly AcceptedChallengeCompletion[],
): AcceptedChallengeCompletion[] {
  const completionsByChallengeId = new Map<string, AcceptedChallengeCompletion>();

  for (const completion of completions) {
    const existingCompletion = completionsByChallengeId.get(completion.challengeId);

    if (
      existingCompletion === undefined ||
      isEarlierAcceptedCompletion(completion, existingCompletion)
    ) {
      completionsByChallengeId.set(completion.challengeId, completion);
    }
  }

  return [...completionsByChallengeId.values()];
}

function isEarlierAcceptedCompletion(
  candidate: AcceptedChallengeCompletion,
  current: AcceptedChallengeCompletion,
): boolean {
  const candidateTime = getAcceptedTime(candidate.acceptedAt);
  const currentTime = getAcceptedTime(current.acceptedAt);

  if (candidateTime === null) {
    return false;
  }

  if (currentTime === null) {
    return true;
  }

  return candidateTime < currentTime;
}

function getValidAwardedPoints(awardedPoints: number): number {
  if (!Number.isFinite(awardedPoints) || awardedPoints < 0) {
    return 0;
  }

  return awardedPoints;
}

function countCompletionsByCategory(
  completions: readonly AcceptedChallengeCompletion[],
  category: ChallengeCategory,
): number {
  return completions.filter((completion) => completion.category === category).length;
}

function findCurrentLevelIndex(totalPoints: number): number {
  let currentLevelIndex = 0;

  for (const [levelIndex, level] of PROGRESSION_LEVELS.entries()) {
    if (totalPoints >= level.minimumPoints) {
      currentLevelIndex = levelIndex;
    }
  }

  return currentLevelIndex;
}

function getUtcDateKey(isoDate: string): string | null {
  const acceptedDate = new Date(isoDate);

  if (Number.isNaN(acceptedDate.getTime())) {
    return null;
  }

  const year = acceptedDate.getUTCFullYear();
  const month = String(acceptedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(acceptedDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getAcceptedTime(acceptedAt: string): number | null {
  const acceptedTime = new Date(acceptedAt).getTime();

  if (Number.isNaN(acceptedTime)) {
    return null;
  }

  return acceptedTime;
}
