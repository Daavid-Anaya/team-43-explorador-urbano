import { describe, expect, it } from "vitest";
import type { BrowserLocation } from "../../shared/browser/locationService";
import {
  calculateDistanceMeters,
  formatDistance,
  loadChallenges,
  mapChallengeRow,
  sortChallengesByDistance,
  type Challenge,
  type ChallengeQueryClient,
  type ChallengeRow,
} from "./challengeDiscovery";

const bellasArtes: ChallengeRow = {
  id: "bellas-artes",
  title: "El Guardián del Centro",
  description: "Encuentra el Palacio de Bellas Artes.",
  city: "Ciudad de México",
  category: "Art",
  location_name: "Palacio de Bellas Artes",
  latitude: 19.4352,
  longitude: -99.1412,
  radius_meters: 80,
  points: 100,
  photo_prompt: "Toma una foto del domo.",
  difficulty: "easy",
  estimated_minutes: 20,
};

const zocalo: ChallengeRow = {
  ...bellasArtes,
  id: "zocalo",
  title: "El Epicentro de la Nación",
  location_name: "Zócalo de la CDMX",
  latitude: "19.4326",
  longitude: "-99.1332",
};

const origin: BrowserLocation = {
  latitude: 19.4352,
  longitude: -99.1412,
  accuracyMeters: 10,
};

function createChallenge(row: ChallengeRow, distanceMeters: number | null): Challenge {
  const challenge = mapChallengeRow(row, null);

  if (!challenge) {
    throw new Error("Expected valid challenge row");
  }

  return { ...challenge, distanceMeters };
}

describe("challenge discovery", () => {
  it("calculates distance with haversine", () => {
    expect(calculateDistanceMeters(origin, { latitude: 19.4326, longitude: -99.1332 })).toBe(
      887,
    );
  });

  it("maps rows and attaches distance when location is available", () => {
    expect(mapChallengeRow(bellasArtes, origin)).toMatchObject({
      id: "bellas-artes",
      locationName: "Palacio de Bellas Artes",
      progress: "not-started",
      distanceMeters: 0,
    });
  });

  it("drops rows without usable coordinates", () => {
    expect(mapChallengeRow({ ...bellasArtes, latitude: null }, origin)).toBeNull();
  });

  it("sorts by distance and keeps browsable items without distance last", () => {
    const sorted = sortChallengesByDistance([
      createChallenge(bellasArtes, null),
      createChallenge(zocalo, 300),
      createChallenge({ ...bellasArtes, id: "near", title: "Near" }, 10),
    ]);

    expect(sorted.map((challenge) => challenge.id)).toEqual(["near", "zocalo", "bellas-artes"]);
  });

  it("formats meters, kilometers, and fallback distance", () => {
    expect(formatDistance(null)).toBe("Distancia no disponible");
    expect(formatDistance(80)).toBe("80 m");
    expect(formatDistance(1_240)).toBe("1.2 km");
  });

  it("loads active challenges from Supabase query shape", async () => {
    const client = {
      from: (table: "challenges" | "completions") => {
        if (table === "completions") {
          return {
            select: () => ({
              eq: async () => ({ data: [], error: null }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [zocalo, bellasArtes], error: null }),
            }),
          }),
        };
      },
    } as unknown as ChallengeQueryClient;

    await expect(loadChallenges(origin, client)).resolves.toMatchObject([
      { id: "bellas-artes", distanceMeters: 0 },
      { id: "zocalo", distanceMeters: 887 },
    ]);
  });

  it("merges authenticated user completion progress into challenges", async () => {
    const client = {
      auth: {
        getUser: async () => ({ data: { user: { id: "user-1" } }, error: null }),
      },
      from: (table: "challenges" | "completions") => {
        if (table === "completions") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  { challenge_id: "bellas-artes", validation_status: "approved" },
                  { challenge_id: "zocalo", validation_status: "pending" },
                ],
                error: null,
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [bellasArtes, zocalo], error: null }),
            }),
          }),
        };
      },
    } as unknown as ChallengeQueryClient;

    await expect(loadChallenges(origin, client)).resolves.toMatchObject([
      { id: "bellas-artes", progress: "completed" },
      { id: "zocalo", progress: "in-progress" },
    ]);
  });
});
