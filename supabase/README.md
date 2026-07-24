# Supabase Configuration

This directory contains database migrations and configuration for the Urban Explorer MVP.

## Migrations

Migrations are applied in order by filename timestamp. Each migration is idempotent where possible.

| Migration | Purpose |
|-----------|---------|
| `20240101000001_initial_schema.sql` | Creates core tables: profiles, challenges, completions, badges |
| `20240101000002_rls_policies.sql` | Row Level Security policies to protect user data |
| `20240101000003_storage_setup.sql` | Private storage bucket for photo evidence |
| `20240101000004_submit_completion_function.sql` | Server-side completion validation function |

## Setup Instructions

### Local Development with Supabase CLI

1. Install Supabase CLI: https://supabase.com/docs/guides/cli

2. Initialize Supabase locally:
   ```bash
   supabase init
   ```

3. Start local Supabase:
   ```bash
   supabase start
   ```

4. Apply migrations:
   ```bash
   supabase db reset
   ```

5. Get your local credentials:
   ```bash
   supabase status
   ```
   
   Copy the API URL and anon key to your `.env` file.

### Using Supabase Cloud Project

1. Create a new project at https://supabase.com

2. Get your project credentials:
   - Go to Project Settings > API
   - Copy the Project URL and anon public key

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your real values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Apply migrations:
   ```bash
   supabase db push
   ```
   
   Or manually run each migration file in the Supabase SQL Editor.

## Security Notes

### Service Role Key

**CRITICAL**: The service role key (`SUPABASE_SERVICE_ROLE_KEY`) provides unrestricted database access and MUST NEVER be exposed to the client.

- ❌ DO NOT add it to `.env` with `VITE_` prefix
- ❌ DO NOT include it in client-side code
- ❌ DO NOT commit real values to git
- ✅ Store it only in Vercel environment variables (server-side)
- ✅ Use only in server-side functions if needed (not in current MVP scope)

The client uses only `VITE_SUPABASE_ANON_KEY`, which has limited permissions enforced by RLS policies.

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only read/write their own data
- Challenges are publicly readable when active
- Completions can only be created through the validated `submit_completion` function
- Storage evidence is private per user

## Database Schema

### Tables

**profiles**
- `user_id` (UUID, PK) - References auth.users
- `display_name` (TEXT) - User's display name
- `created_at`, `updated_at` (TIMESTAMPTZ)

**challenges**
- `id` (UUID, PK)
- `title`, `description` (TEXT)
- `category` (TEXT) - Art, History, Nature, Landmark, Hidden Gem
- `latitude`, `longitude` (DOUBLE PRECISION)
- `radius_meters` (INTEGER) - Default 80
- `points` (INTEGER) - Points awarded on completion
- `photo_prompt` (TEXT)
- `difficulty` (TEXT) - Easy, Medium, Hard
- `estimated_minutes` (INTEGER)
- `city` (TEXT)
- `active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**completions**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References auth.users
- `challenge_id` (UUID, FK) - References challenges
- `completed_at` (TIMESTAMPTZ)
- `latitude`, `longitude` (DOUBLE PRECISION) - User's location
- `accuracy_meters` (DOUBLE PRECISION) - GPS accuracy
- `evidence_path` (TEXT) - Path to photo in storage
- `points_awarded` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- UNIQUE constraint on (user_id, challenge_id)

**badges**
- `id` (UUID, PK)
- `user_id` (UUID, FK) - References auth.users
- `badge_type` (TEXT) - First Completion, City Explorer, Challenge Master
- `earned_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- UNIQUE constraint on (user_id, badge_type)

### Functions

**submit_completion(challenge_id, latitude, longitude, accuracy_meters, evidence_path)**

Server-side validation for challenge completion. Validates:
- User is authenticated
- GPS accuracy ≤ 100m
- Challenge exists and is active
- No duplicate completion
- User is within challenge radius (default 80m)
- Evidence path is valid and accessible

Returns JSON:
```json
{
  "completion_id": "uuid",
  "points_awarded": 100,
  "total_points": 350,
  "new_badges": ["First Completion"]
}
```

Automatically awards badges:
- "First Completion" - First challenge completed
- "City Explorer" - 5 challenges completed
- "Challenge Master" - All challenges in city completed

## Storage Buckets

**challenge-evidence** (private)
- Stores photo evidence for completions
- Path format: `{user_id}/{filename}`
- RLS policies ensure users can only access their own evidence
- No public access

## Verification

### Smoke Tests

After applying migrations, verify:

1. **Tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Storage bucket exists**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'challenge-evidence';
   ```

4. **Function exists**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' AND routine_name = 'submit_completion';
   ```

### Test Completion Flow

1. Create test user through Supabase Auth
2. Seed a test challenge
3. Call `submit_completion` function
4. Verify completion record created
5. Verify points awarded
6. Verify badges awarded for milestones

## Seed Data

Challenge seed data will be added in task 1.3 after the city and dataset are approved.

Location: `supabase/seed/challenges.json`

## Rollback

To rollback migrations locally:
```bash
supabase db reset
```

For production, create reverse migrations or restore from backup. See `design.md` for recovery guidance.
