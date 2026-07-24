export interface SupabaseBrowserConfig {
  url: string;
  anonKey: string;
}

function requireBrowserEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required browser environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig {
  return {
    url: requireBrowserEnv("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL),
    anonKey: requireBrowserEnv(
      "VITE_SUPABASE_ANON_KEY",
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    ),
  };
}
