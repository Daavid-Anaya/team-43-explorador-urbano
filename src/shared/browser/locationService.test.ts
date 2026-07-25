import { afterEach, describe, expect, it, vi } from "vitest";
import { browserLocationService } from "./locationService";

describe("browserLocationService", () => {
  const originalGeolocation = navigator.geolocation;

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: originalGeolocation,
    });
    vi.restoreAllMocks();
  });

  it("returns unsupported when geolocation is unavailable", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });

    await expect(browserLocationService.getCurrentLocation()).resolves.toEqual({
      status: "denied",
      reason: "unsupported",
    });
  });

  it("returns granted coordinates", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          success({
            coords: {
              latitude: 19.4352,
              longitude: -99.1412,
              accuracy: 12,
            },
          } as GeolocationPosition);
        }),
      },
    });

    await expect(browserLocationService.getCurrentLocation()).resolves.toEqual({
      status: "granted",
      location: {
        latitude: 19.4352,
        longitude: -99.1412,
        accuracyMeters: 12,
      },
    });
  });

  it("maps permission denial to a browsable fallback", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn(
          (_success: PositionCallback, error: PositionErrorCallback) => {
            error({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
          },
        ),
      },
    });

    await expect(browserLocationService.getCurrentLocation()).resolves.toEqual({
      status: "denied",
      reason: "permission-denied",
    });
  });
});
