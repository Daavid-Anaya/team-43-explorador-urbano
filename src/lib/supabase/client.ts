import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfig } from "./env";
import type { SupabaseBrowserConfig } from "./env";

let supabaseBrowserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient(
  config: SupabaseBrowserConfig = getSupabaseBrowserConfig(),
): SupabaseClient {
  return createClient(config.url, config.anonKey);
}

export function getSupabaseBrowserClient(): SupabaseClient {
  supabaseBrowserClient ??= createSupabaseBrowserClient();

  return supabaseBrowserClient;
}
