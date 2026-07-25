import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LocationResult } from "../../shared/browser/locationService";
import type { Challenge } from "./challengeDiscovery";
import { DiscoveryView } from "./DiscoveryView";
import type { DiscoveryObservability } from "./discoveryObservability";

const grantedLocation: LocationResult = {
  status: "granted",
  location: { latitude: 19.4352, longitude: -99.1412, accuracyMeters: 10 },
};

const deniedLocation: LocationResult = {
  status: "denied",
  reason: "permission-denied",
};

const challenges: Challenge[] = [
  {
    id: "bellas-artes",
    title: "El Guardián del Centro",
    description: "Encuentra el Palacio de Bellas Artes.",
    city: "Ciudad de México",
    category: "Art",
    locationName: "Palacio de Bellas Artes",
    latitude: 19.4352,
    longitude: -99.1412,
    radiusMeters: 80,
    points: 100,
    photoPrompt: "Toma una foto del domo.",
    difficulty: "easy",
    estimatedMinutes: 20,
    progress: "not-started",
    distanceMeters: 0,
  },
];

function renderDiscovery(location: LocationResult) {
  return render(
    <DiscoveryView
      locationService={{ getCurrentLocation: async () => location }}
      loadChallengeList={vi.fn(async () => challenges)}
    />,
  );
}

describe("DiscoveryView", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows nearby challenges and opens detail", async () => {
    renderDiscovery(grantedLocation);

    expect(await screen.findByRole("heading", { name: "Retos urbanos cercanos" })).toBeInTheDocument();
    expect(screen.getByText("0 m")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));

    expect(screen.getByRole("heading", { name: "El Guardián del Centro" })).toBeInTheDocument();
    expect(screen.getByText("Foto requerida")).toBeInTheDocument();
  });

  it("keeps catalog browsable when location permission is denied", async () => {
    const observability: DiscoveryObservability = { capture: vi.fn() };

    render(
      <DiscoveryView
        locationService={{ getCurrentLocation: async () => deniedLocation }}
        loadChallengeList={vi.fn(async () => challenges)}
        observability={observability}
      />,
    );

    expect(await screen.findByText(/Podés navegar el catálogo sin ubicación/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "El Guardián del Centro" })).toBeInTheDocument();
    expect(observability.capture).toHaveBeenCalledWith({
      name: "geolocation-fallback",
      reason: "permission-denied",
    });

    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));

    expect(screen.getByText("No iniciado")).toBeInTheDocument();
  });

  it("lets the user retry after a catalog load failure", async () => {
    const observability: DiscoveryObservability = { capture: vi.fn() };
    const loadChallengeList = vi
      .fn<() => Promise<Challenge[]>>()
      .mockRejectedValueOnce(new Error("Supabase temporarily unavailable"))
      .mockResolvedValueOnce(challenges);

    render(
      <DiscoveryView
        locationService={{ getCurrentLocation: async () => grantedLocation }}
        loadChallengeList={loadChallengeList}
        observability={observability}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Supabase temporarily unavailable",
    );
    expect(observability.capture).toHaveBeenCalledWith({
      name: "catalog-load-failed",
      message: "Supabase temporarily unavailable",
    });

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("heading", { name: "Retos urbanos cercanos" })).toBeInTheDocument();
    expect(loadChallengeList).toHaveBeenCalledTimes(2);
  });
});
