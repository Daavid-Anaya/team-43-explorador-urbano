# Verification: Task 1.2 - Supabase Configuration

**Issue**: #4  
**Task**: 1.2 - Configure Supabase base (auth, data, storage, RLS)  
**Date**: 2024-07-23  
**Verified by**: Dev B

## Implementation Summary

Created browser-safe Supabase client and database schema with:
- Auth integration ready
- Core tables: profiles, challenges, completions, badges
- Row Level Security (RLS) policies
- Private storage bucket for photo evidence
- Server-side completion validation function

## Acceptance Criteria Verification

### ✅ AC1: Supabase Auth, Postgres/RLS and Storage privado quedan definidos para el MVP

**Evidence**:
- Client configured in `src/lib/supabase/client.ts`
- Schema migrations in `supabase/migrations/`
- RLS policies in `20240101000002_rls_policies.sql`
- Storage bucket in `20240101000003_storage_setup.sql`

**Status**: ✅ Complete

### ✅ AC2: El cliente solo usa anon key publica; SUPABASE_SERVICE_ROLE_KEY no aparece en VITE_*, bundle cliente ni docs con valores reales

**Evidence**:
- Client uses only `VITE_SUPABASE_ANON_KEY` (see `src/lib/supabase/client.ts`)
- `.env.example` has explicit warning about service role key
- No `VITE_*` prefix for service role key
- Documentation warns against exposing service role
- **FIXED**: Added `@supabase/supabase-js` dependency to `package.json`
- **FIXED**: Added type assertion for `import.meta.env` variables

**Files checked**:
```
✅ src/lib/supabase/client.ts - uses only anon key + fixed types
✅ package.json - dependency added
✅ .env.example - no real secrets, clear warnings
✅ supabase/README.md - security notes
✅ src/lib/supabase/README.md - security section
```

**Status**: ✅ Complete

### ✅ AC3: Las politicas evitan escritura/lectura indebida de datos de otros usuarios

**Evidence**:
RLS policies implemented in `supabase/migrations/20240101000002_rls_policies.sql`:

**Profiles**:
- Users can only read/insert/update their own profile (`auth.uid() = user_id`)

**Challenges**:
- Anyone can read active challenges (public data)

**Completions**:
- Users can only read their own completions
- **SECURITY HARDENED**: NO INSERT policy - completions can ONLY be created through `submit_completion` function
- No UPDATE or DELETE policies (operations blocked)

**Badges**:
- Users can only read their own badges
- **SECURITY HARDENED**: NO INSERT policy - badges can ONLY be created through `submit_completion` function
- No UPDATE or DELETE policies (operations blocked)

**Storage (challenge-evidence)**:
- Users can only upload to their own folder (`storage.foldername(name)[1] = auth.uid()::text`)
- Users can only read their own evidence
- No UPDATE or DELETE policies (operations blocked)

**Critical Security Fix**:
- Removed permissive INSERT policies on `completions` and `badges`
- Direct client inserts are now BLOCKED by RLS
- Only `submit_completion` function (with `SECURITY DEFINER`) can insert
- This prevents client forgery of completions, points, or badges

**Status**: ✅ Complete + Security Hardened

### ✅ AC4: No se agrega logica completa de completado todavia

**Evidence**:
- `submit_completion` function prepared in `20240101000004_submit_completion_function.sql`
- **SECURITY HARDENED**: Function uses `SECURITY DEFINER` with fixed `search_path = public, pg_temp`
- **BUG FIXED**: Badge awarding logic corrected - uses exception handling instead of RETURNING into wrong type
- **DOCUMENTED**: Evidence file existence validation deferred with TODO comment
- Function validates auth, location, accuracy, evidence path format
- Function is READY but not yet integrated in UI (task 2.2-2.4 will wire it up)
- Validation boundary defined, but completion flow UX is deferred

**Security Improvements**:
1. Fixed `search_path` to prevent schema injection attacks
2. All table references use explicit `public.` schema
3. Badge insertion uses exception handling for unique violations
4. Evidence validation notes deferred storage.objects check

**Status**: ✅ Complete (validation prepared, UX deferred as planned, security hardened)

## Scope Verification

### In Scope (Completed)
- ✅ `src/lib/supabase/*` with browser-safe client
- ✅ Database migrations for all core tables
- ✅ RLS policies protecting user data
- ✅ Private storage bucket for evidence
- ✅ `.env.example` with security guidance
- ✅ Validation function for completion submission

### Out of Scope (Correctly Deferred)
- ⏸️ Completion flow UX (task 2.4)
- ⏸️ Challenge seed data (task 1.3, depends on city approval)
- ⏸️ Frontend integration (task 3.1)
- ⏸️ Real npm scripts (task 1.1 must run first)

## Security Verification

### ✅ Service Role Key Safety
- Not exposed in any `VITE_*` variable
- Not present in client code
- Documented as server-side only
- Warnings in multiple README files

### ✅ RLS Protection
All tables have RLS enabled:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
```

### ✅ Storage Privacy
- Bucket is private (`public = false`)
- Path-based access control by user ID
- Users cannot access other users' evidence

### ✅ Validation Boundary
- `submit_completion` function uses `SECURITY DEFINER`
- Validates all inputs server-side
- Derives points and badges (client cannot forge)
- Rejects unauthorized operations

## Manual Smoke Test Checklist

**Status**: ⏸️ Cannot execute yet (requires Supabase project setup and task 1.1 npm scripts)

**New**: Security tests added in `supabase/tests/security.test.sql`

When Supabase is configured, verify:

1. **Database Setup**:
   - [ ] Apply migrations with `supabase db reset` (local) or `supabase db push` (cloud)
   - [ ] Verify tables exist
   - [ ] Verify RLS is enabled on all tables
   - [ ] Verify storage bucket exists
   - [ ] Run `supabase test db` or execute `supabase/tests/security.test.sql`

2. **Security Tests** (automated in security.test.sql):
   - [ ] Direct insert to `completions` is BLOCKED
   - [ ] Direct insert to `badges` is BLOCKED
   - [ ] Unauthenticated `submit_completion` is rejected
   - [ ] GPS accuracy > 100m is rejected
   - [ ] Empty evidence path is rejected
   - [ ] RLS enabled on all tables
   - [ ] Storage bucket is private
   - [ ] `submit_completion` function exists

3. **Client Connection**:
   - [ ] Create `.env` from `.env.example`
   - [ ] Add real Supabase URL and anon key
   - [ ] Verify client can connect (will need task 1.1 app first)

4. **Auth Flow**:
   - [ ] Create test user
   - [ ] Verify session persists
   - [ ] Verify RLS allows reading own profile

5. **RLS Policies** (manual validation):
   - [ ] User A cannot read User B's profile
   - [ ] User A cannot read User B's completions
   - [ ] User A cannot access User B's storage evidence
   - [ ] Anyone can read active challenges
   - [ ] Direct client insert to completions FAILS
   - [ ] Direct client insert to badges FAILS

6. **Completion Validation**:
   - [ ] Seed a test challenge
   - [ ] Call `submit_completion` with valid data through RPC
   - [ ] Verify completion record created
   - [ ] Verify points awarded correctly
   - [ ] Verify first badge awarded
   - [ ] Try duplicate completion → should fail
   - [ ] Try outside radius → should fail
   - [ ] Try low GPS accuracy → should fail
   - [ ] Try invalid evidence path → should fail

## Gaps and Notes

### Current Gaps
1. **No npm scripts yet** - Task 1.1 must complete first to run `npm install`
2. **No Supabase project** - Team must provision local or cloud Supabase
3. **No seed data** - Task 1.3 will add after city approval
4. **No frontend integration** - Task 3.1 will wire auth state

### Documentation Gaps
None - comprehensive READMEs added for:
- `supabase/README.md` - Setup, schema, verification
- `src/lib/supabase/README.md` - Usage, security, examples

### Migration Rollback
For local: `supabase db reset`
For production: Follow `design.md` recovery guidance (fix-forward preferred)

## Files Modified

**Created** (13 files, ~1100 lines):
- `.env.example`
- `package.json` (modified - added @supabase/supabase-js)
- `src/lib/supabase/client.ts`
- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/index.ts`
- `src/lib/supabase/README.md`
- `supabase/migrations/20240101000001_initial_schema.sql`
- `supabase/migrations/20240101000002_rls_policies.sql`
- `supabase/migrations/20240101000003_storage_setup.sql`
- `supabase/migrations/20240101000004_submit_completion_function.sql`
- `supabase/tests/security.test.sql` (NEW - automated security tests)
- `supabase/README.md`
- `docs/SIZE_EXCEPTION.md` (NEW - justification for >400 lines)

**Modified**: 
- `package.json` - added @supabase/supabase-js dependency

## Review Budget

**Estimated lines**: ~1100 lines (exceeds 400-line target)

**Breakdown**:
- Migrations: ~550 lines (SQL + security hardening)
- Client code: ~200 lines (TS)
- Security tests: ~150 lines (SQL)
- Documentation: ~300 lines (MD)

**Size Exception**: Justified in `docs/SIZE_EXCEPTION.md`
- Atomic security unit (schema + RLS must deploy together)
- Type safety requires complete schema
- Cannot split without introducing insecure intermediate states

**Critical for Review**:
1. RLS policies (no INSERT on completions/badges)
2. `submit_completion` security (`SECURITY DEFINER` + `search_path`)
3. Client safety (only anon key)
4. Security test suite

## Next Steps

To complete PR1 bootstrap slice:
1. ✅ **Task 1.2** (this task) - Supabase config DONE
2. ⏸️ **Task 1.1** - App bootstrap (package.json, vite config, app shell)
3. ⏸️ **Task 1.3** - Challenge seed data (after city approval)

## References

- Issue: https://github.com/Daavid-Anaya/team-43-explorador-urbano/issues/4
- OpenSpec tasks: `openspec/changes/urban-explorer-mvp/tasks.md` (task 1.2)
- OpenSpec spec: `openspec/changes/urban-explorer-mvp/specs/supabase-vercel-platform/spec.md`
- Design: `openspec/changes/urban-explorer-mvp/design.md`

## Verification Statement

Task 1.2 acceptance criteria are met:
- ✅ Supabase Auth, Postgres/RLS, Storage defined
- ✅ Client uses only anon key (no service role exposure)
- ✅ RLS policies prevent unauthorized data access
- ✅ Completion validation prepared (not yet fully integrated)

Gaps are documented and align with expected dependencies on tasks 1.1 and 1.3.

**Ready for review**: Yes  
**Blocking issues**: None  
**Follow-up tasks**: 1.1 (app bootstrap), 1.3 (seed data)
