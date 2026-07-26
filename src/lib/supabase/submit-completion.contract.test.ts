import { describe, expect, it } from "vitest";

const migrations = import.meta.glob<string>(
  "../../../supabase/migrations/*.sql",
  { eager: true, import: "default", query: "?raw" },
);
const sql = Object.values(migrations).join("\n");
const submitCompletionSql =
  sql.match(
    /create(?:\s+or\s+replace)?\s+function\s+public\.submit_completion[\s\S]*?\$\$;/i,
  )?.[0] ?? "";

describe("submit_completion database contract", () => {
  it("rejects unauthenticated submissions", () => {
    expect(submitCompletionSql).toMatch(
      /auth\.uid\(\)[\s\S]*?raise exception[\s\S]*?authenticat/i,
    );
  });

  it("rejects submissions outside the challenge radius", () => {
    expect(submitCompletionSql).toMatch(
      /radius_meters[\s\S]*?raise exception[\s\S]*?(outside|radius|distance)/i,
    );
  });

  it("rejects GPS accuracy above 100 meters", () => {
    expect(submitCompletionSql).toMatch(
      /accuracy_meters[\s\S]*?>\s*100[\s\S]*?raise exception/i,
    );
  });

  it("rejects missing or inaccessible private evidence", () => {
    expect(submitCompletionSql).toMatch(
      /storage\.objects[\s\S]*?evidence_path[\s\S]*?auth\.uid\(\)[\s\S]*?raise exception/i,
    );
  });

  it("rejects a second completion for the same user and challenge", () => {
    expect(submitCompletionSql).toMatch(
      /public\.completions[\s\S]*?user_id[\s\S]*?challenge_id[\s\S]*?raise exception[\s\S]*?duplicate/i,
    );
  });

  it("rejects client-provided rewards and derives awarded points", () => {
    expect(submitCompletionSql).toMatch(
      /(points|badges)[\s\S]*?raise exception[\s\S]*?(reward|not accepted|forbidden)/i,
    );
    expect(submitCompletionSql).toMatch(
      /points_awarded[\s\S]*?public\.challenges/i,
    );
  });

  it("keeps completion execution authenticated and reads owner-scoped", () => {
    expect(sql).toMatch(/revoke execute on function public\.submit_completion[\s\S]*?from (?:public|anon)/i);
    expect(sql).toMatch(/grant execute on function public\.submit_completion[\s\S]*?to authenticated/i);
    expect(sql).toMatch(/using \(auth\.uid\(\) = user_id\)/i);
  });
});
