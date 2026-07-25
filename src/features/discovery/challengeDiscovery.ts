import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import type { BrowserLocation } from "../../shared/browser/locationService";

const CHALLENGE_DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

const CHALLENGE_PROGRESS = {
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
} as const;

export type ChallengeDifficulty =
  (typeof CHALLENGE_DIFFICULTY)[keyof typeof CHALLENGE_DIFFICULTY];

export type ChallengeProgress =
  (typeof CHALLENGE_PROGRESS)[keyof typeof CHALLENGE_PROGRESS];

export interface ChallengeRow {
  id: string;
  title: string;
  description: string;
  city: string;
  category: string;
  location_name: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  radius_meters: number;
  points: number;
  photo_prompt: string | null;
  difficulty: ChallengeDifficulty;
  estimated_minutes: number | null;
}

export interface ChallengeCompletionRow {
  challenge_id: string;
  validation_status: "pending" | "approved" | "rejected";
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  city: string;
  category: string;
  locationName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  points: number;
  photoPrompt: string;
  difficulty: ChallengeDifficulty;
  estimatedMinutes: number | null;
  progress: ChallengeProgress;
  distanceMeters: number | null;
}

export interface ChallengeQueryClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
  from(table: "challenges"): {
    select(columns: string): {
      eq(column: "is_active", value: true): {
        order(column: "title", options: { ascending: true }): PromiseLike<{
          data: ChallengeRow[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
  from(table: "completions"): {
    select(columns: string): {
      eq(column: "user_id", value: string): PromiseLike<{
        data: ChallengeCompletionRow[] | null;
        error: { message: string } | null;
      }>;
    };
  };
}

const CHALLENGE_COLUMNS =
  "id,title,description,city,category,location_name,latitude,longitude,radius_meters,points,photo_prompt,difficulty,estimated_minutes";

const COMPLETION_COLUMNS = "challenge_id,validation_status";

function toCoordinate(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const coordinate = Number(value);

  return Number.isFinite(coordinate) ? coordinate : null;
}

export function calculateDistanceMeters(
  origin: BrowserLocation,
  destination: Pick<Challenge, "latitude" | "longitude">,
): number {
  const earthRadiusMeters = 6_371_000;
  const originLat = (origin.latitude * Math.PI) / 180;
  const destinationLat = (destination.latitude * Math.PI) / 180;
  const deltaLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const deltaLng = ((destination.longitude - origin.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const haversine =
    sinLat * sinLat + Math.cos(originLat) * Math.cos(destinationLat) * sinLng * sinLng;

  return Math.round(
    earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)),
  );
}

export function formatDistance(distanceMeters: number | null): string {
  if (distanceMeters === null) {
    return "Distancia no disponible";
  }

  if (distanceMeters < 1_000) {
    return `${distanceMeters} m`;
  }

  return `${(distanceMeters / 1_000).toFixed(1)} km`;
}

export function mapChallengeRow(
  row: ChallengeRow,
  location: BrowserLocation | null,
  progress: ChallengeProgress = CHALLENGE_PROGRESS.NOT_STARTED,
): Challenge | null {
  const latitude = toCoordinate(row.latitude);
  const longitude = toCoordinate(row.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  const challenge = {
    id: row.id,
    title: row.title,
    description: row.description,
    city: row.city,
    category: row.category,
    locationName: row.location_name ?? row.city,
    latitude,
    longitude,
    radiusMeters: row.radius_meters,
    points: row.points,
    photoPrompt: row.photo_prompt ?? "Toma una foto clara del lugar del reto.",
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    progress,
    distanceMeters: null,
  } satisfies Challenge;

  return location
    ? { ...challenge, distanceMeters: calculateDistanceMeters(location, challenge) }
    : challenge;
}

function mapCompletionProgress(status: ChallengeCompletionRow["validation_status"]): ChallengeProgress {
  if (status === "approved") {
    return CHALLENGE_PROGRESS.COMPLETED;
  }

  if (status === "pending") {
    return CHALLENGE_PROGRESS.IN_PROGRESS;
  }

  return CHALLENGE_PROGRESS.NOT_STARTED;
}

async function loadUserCompletionProgress(
  client: ChallengeQueryClient,
): Promise<Map<string, ChallengeProgress>> {
  const userResult = await client.auth?.getUser();
  const userId = userResult?.data.user?.id;

  if (!userId) {
    return new Map();
  }

  const { data, error } = await client
    .from("completions")
    .select(COMPLETION_COLUMNS)
    .eq("user_id", userId);

  if (error) {
    return new Map();
  }

  return new Map(
    (data ?? []).map((completion) => [
      completion.challenge_id,
      mapCompletionProgress(completion.validation_status),
    ]),
  );
}

export function sortChallengesByDistance(challenges: Challenge[]): Challenge[] {
  return [...challenges].sort((left, right) => {
    if (left.distanceMeters === null && right.distanceMeters === null) {
      return left.title.localeCompare(right.title);
    }

    if (left.distanceMeters === null) {
      return 1;
    }

    if (right.distanceMeters === null) {
      return -1;
    }

    return left.distanceMeters - right.distanceMeters;
  });
}

export async function loadChallenges(
  location: BrowserLocation | null,
  client?: ChallengeQueryClient,
): Promise<Challenge[]> {
  const queryClient = client ?? (getSupabaseBrowserClient() as unknown as ChallengeQueryClient);
  const [{ data, error }, completionProgress] = await Promise.all([
    queryClient
    .from("challenges")
    .select(CHALLENGE_COLUMNS)
    .eq("is_active", true)
      .order("title", { ascending: true }),
    loadUserCompletionProgress(queryClient),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return sortChallengesByDistance(
    (data ?? []).flatMap((row) => {
      const challenge = mapChallengeRow(
        row,
        location,
        completionProgress.get(row.id) ?? CHALLENGE_PROGRESS.NOT_STARTED,
      );

      return challenge ? [challenge] : [];
    }),
  );
}
