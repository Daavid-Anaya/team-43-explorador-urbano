import { describe, expect, it } from "vitest";
import challenges from "./challenges.json";

const ACCEPTED_CATEGORIES = ["Art", "History", "Nature", "Landmark", "Hidden Gem"];
const ACCEPTED_DIFFICULTIES = ["easy", "medium", "hard"];
const REQUIRED_FIELDS = [
  "title",
  "description",
  "category",
  "city",
  "latitude",
  "longitude",
  "radiusMeters",
  "points",
  "photoPrompt",
  "difficulty",
  "estimatedMinutes",
] as const;

describe("Seed de desafíos (Ciudad de México)", () => {
  it("usa la misma ciudad en todos los registros", () => {
    const cities = new Set(challenges.map((c) => c.city));
    expect(cities.size).toBe(1);
    expect(cities.has("Ciudad de México")).toBe(true);
  });

  it("contiene entre 8 y 12 desafíos", () => {
    expect(challenges.length).toBeGreaterThanOrEqual(8);
    expect(challenges.length).toBeLessThanOrEqual(12);
  });

  it("cada desafío incluye todos los campos requeridos por el contrato del MVP", () => {
    for (const challenge of challenges) {
      for (const field of REQUIRED_FIELDS) {
        expect(challenge, `falta el campo "${field}" en "${challenge.title}"`).toHaveProperty(field);
      }
    }
  });

  it("usa solo categorías aceptadas", () => {
    for (const challenge of challenges) {
      expect(ACCEPTED_CATEGORIES, `categoría inválida en "${challenge.title}"`).toContain(
        challenge.category,
      );
    }
  });

  it("usa solo dificultades aceptadas", () => {
    for (const challenge of challenges) {
      expect(ACCEPTED_DIFFICULTIES, `dificultad inválida en "${challenge.title}"`).toContain(
        challenge.difficulty,
      );
    }
  });

  it("tiene coordenadas válidas", () => {
    for (const challenge of challenges) {
      expect(challenge.latitude).toBeGreaterThanOrEqual(-90);
      expect(challenge.latitude).toBeLessThanOrEqual(90);
      expect(challenge.longitude).toBeGreaterThanOrEqual(-180);
      expect(challenge.longitude).toBeLessThanOrEqual(180);
    }
  });

  it("tiene puntos y radio positivos", () => {
    for (const challenge of challenges) {
      expect(challenge.points).toBeGreaterThan(0);
      expect(challenge.radiusMeters).toBeGreaterThan(0);
    }
  });

  it("no tiene títulos duplicados", () => {
    const titles = challenges.map((c) => c.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
