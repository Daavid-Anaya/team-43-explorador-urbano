import { describe, expect, it } from "vitest";
import sql from "../../../supabase/migrations/20260724000000_initial_auth_data_storage.sql?raw";

const completionPolicyStatements =
  sql.match(/create policy "[^"]+"\s+on public\.completions[\s\S]*?;/gi) ?? [];

describe("Supabase initial migration contract", () => {
  it("enables and forces RLS on browser-readable application tables", () => {
    expect(sql).toMatch(/alter table public\.profiles enable row level security;/i);
    expect(sql).toMatch(/alter table public\.profiles force row level security;/i);
    expect(sql).toMatch(/alter table public\.challenges enable row level security;/i);
    expect(sql).toMatch(/alter table public\.challenges force row level security;/i);
    expect(sql).toMatch(/alter table public\.completions enable row level security;/i);
    expect(sql).toMatch(/alter table public\.completions force row level security;/i);
  });

  it("keeps profile access scoped to the authenticated owner", () => {
    expect(sql).toMatch(/create policy "Users can read their own profile"[\s\S]*?for select[\s\S]*?to authenticated[\s\S]*?using \(auth\.uid\(\) = id\);/i);
    expect(sql).toMatch(/create policy "Users can update their own profile"[\s\S]*?for update[\s\S]*?to authenticated[\s\S]*?using \(auth\.uid\(\) = id\)[\s\S]*?with check \(auth\.uid\(\) = id\);/i);
  });

  it("allows anonymous users to read only active challenges", () => {
    expect(sql).toMatch(/create policy "Anyone can read active challenges"[\s\S]*?for select[\s\S]*?to anon, authenticated[\s\S]*?using \(is_active\);/i);
  });

  it("keeps completion rows browser read-only and owner-scoped", () => {
    expect(sql).toMatch(/create policy "Users can read their own completions"[\s\S]*?for select[\s\S]*?to authenticated[\s\S]*?using \(auth\.uid\(\) = user_id\);/i);
    expect(completionPolicyStatements).toHaveLength(1);
    expect(completionPolicyStatements[0]).not.toMatch(/for insert/i);
    expect(completionPolicyStatements[0]).not.toMatch(/for update/i);
    expect(completionPolicyStatements[0]).not.toMatch(/for delete/i);
  });

  it("creates a private evidence bucket and fails when Supabase storage is unavailable", () => {
    expect(sql).toMatch(/insert into storage\.buckets[\s\S]*?'evidence'[\s\S]*?false/i);
    expect(sql).toMatch(/raise exception 'Supabase storage\.buckets table is required/i);
    expect(sql).toMatch(/raise exception 'Supabase storage\.objects table is required/i);
    expect(sql).not.toMatch(/to_regclass\('storage\./i);
  });

  it("allows evidence insert and select only within the authenticated user's folder", () => {
    expect(sql).toMatch(/create policy "Users can read their own evidence objects"[\s\S]*?on storage\.objects[\s\S]*?for select[\s\S]*?to authenticated[\s\S]*?bucket_id = 'evidence'[\s\S]*?\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/i);
    expect(sql).toMatch(/create policy "Users can upload their own evidence objects"[\s\S]*?on storage\.objects[\s\S]*?for insert[\s\S]*?to authenticated[\s\S]*?bucket_id = 'evidence'[\s\S]*?\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/i);
  });

  it("does not allow browser updates or deletes for submitted evidence objects", () => {
    expect(sql).not.toContain("Users can update their own evidence objects");
    expect(sql).not.toContain("Users can delete their own evidence objects");
    expect(sql).not.toMatch(/on storage\.objects[\s\S]{0,240}for update/i);
    expect(sql).not.toMatch(/on storage\.objects[\s\S]{0,240}for delete/i);
  });

  it("uses rerun-safe creation for core tables, indexes, and guarded policies", () => {
    expect(sql).toMatch(/create table if not exists public\.profiles/i);
    expect(sql).toMatch(/create table if not exists public\.challenges/i);
    expect(sql).toMatch(/create table if not exists public\.completions/i);
    expect(sql).toMatch(/create index if not exists challenges_city_category_idx/i);
    expect(sql).toMatch(/create index if not exists completions_user_status_idx/i);
    expect(sql).toMatch(/if not exists \([\s\S]*?from pg_policies/i);
  });
});
