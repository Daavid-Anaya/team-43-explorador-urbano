import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrowserDiscoveryObservability } from "./discoveryObservability";

describe("createBrowserDiscoveryObservability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("captures discovery events with sendBeacon when the Vite endpoint is configured", () => {
    vi.stubEnv("VITE_OBSERVABILITY_ENDPOINT", "https://observability.example.com/discovery");

    const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => true);
    const warn = vi.fn<typeof console.warn>();
    const observability = createBrowserDiscoveryObservability({ sendBeacon, warn });

    observability.capture({ name: "geolocation-fallback", reason: "permission-denied" });

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(sendBeacon).toHaveBeenCalledWith(
      "https://observability.example.com/discovery",
      expect.stringContaining('"name":"geolocation-fallback"'),
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("falls back to console warning when remote capture is not configured", () => {
    const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => true);
    const warn = vi.fn<typeof console.warn>();
    const event = { name: "catalog-load-failed", message: "Supabase unavailable" } as const;
    const observability = createBrowserDiscoveryObservability({ sendBeacon, warn });

    observability.capture(event);

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("[discovery]", event);
  });

  it("falls back to console warning when sendBeacon cannot capture", () => {
    const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => false);
    const warn = vi.fn<typeof console.warn>();
    const event = { name: "catalog-load-failed", message: "Supabase unavailable" } as const;
    const observability = createBrowserDiscoveryObservability({
      endpoint: "https://observability.example.com/discovery",
      sendBeacon,
      warn,
    });

    observability.capture(event);

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith("[discovery]", event);
  });
});
