import { afterEach, describe, expect, it, vi } from "vitest";

describe("Supabase browser client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not validate environment variables during module import", async () => {
    await expect(import("./index")).resolves.toHaveProperty(
      "getSupabaseBrowserConfig",
    );
  });

  it("reports missing browser configuration only when requested", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    const { getSupabaseBrowserConfig } = await import("./env");

    expect(() => getSupabaseBrowserConfig()).toThrow(
      "Missing required browser environment variable: VITE_SUPABASE_URL",
    );
  });
});
