# Supabase Client Library

Browser-safe Supabase client for Urban Explorer MVP.

## Usage

```typescript
import { supabase } from '@/lib/supabase';

// Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Query challenges
const { data: challenges } = await supabase
  .from('challenges')
  .select('*')
  .eq('active', true)
  .eq('city', 'Buenos Aires');

// Get user completions
const { data: completions } = await supabase
  .from('completions')
  .select('*, challenges(*)')
  .eq('user_id', user.id)
  .order('completed_at', { ascending: false });

// Submit completion (through validated function)
const { data: result, error } = await supabase.rpc('submit_completion', {
  p_challenge_id: challengeId,
  p_latitude: position.coords.latitude,
  p_longitude: position.coords.longitude,
  p_accuracy_meters: position.coords.accuracy,
  p_evidence_path: evidencePath,
});

// Upload evidence photo
const fileName = `${userId}/${Date.now()}.jpg`;
const { data, error } = await supabase.storage
  .from('challenge-evidence')
  .upload(fileName, photoFile, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
  });
```

## Security

### Client Safety

This client uses **ONLY** the public anon key:
- ✅ Safe to use in browser/client code
- ✅ Limited by Row Level Security (RLS) policies
- ✅ Can only access data allowed by RLS

### Service Role Key

**NEVER** expose the service role key to the client:
- ❌ No `VITE_SUPABASE_SERVICE_ROLE_KEY` variable
- ❌ Never import or use in client code
- ❌ Never commit to git with real values

### RLS Protection

All database operations are protected by RLS policies:
- Users can only read/write their own profiles, completions, badges
- Users can only access their own evidence in storage
- Challenges are publicly readable
- Completion validation is server-side only

### Completion Flow Security

The `submit_completion` function enforces:
1. User must be authenticated
2. GPS accuracy ≤ 100m
3. User within challenge radius (80m default)
4. No duplicate completions
5. Evidence path format validation
6. Server-derived points and badges (client cannot forge)

Client-submitted reward fields (points, badges) are **ignored**.

## Type Safety

Type definitions are in `database.types.ts` and match the Supabase schema.

To regenerate types after schema changes:
```bash
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

Or for cloud project:
```bash
supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```

## Error Handling

```typescript
const { data, error } = await supabase
  .from('challenges')
  .select('*');

if (error) {
  console.error('Supabase error:', error);
  // Handle error (show user message, retry, etc.)
}
```

Common errors:
- **Auth required**: User not logged in
- **RLS policy violation**: Trying to access unauthorized data
- **Constraint violation**: Duplicate completion, etc.
- **Network error**: Connection issues

## Environment Variables

Required variables in `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from:
- Local: `supabase status`
- Cloud: Project Settings > API in Supabase dashboard

## Auth Session

The client automatically:
- Persists sessions in localStorage
- Refreshes tokens before expiry
- Handles auth state changes

Listen to auth state:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  if (session) {
    console.log('User:', session.user);
  }
});
```

## Real-time Subscriptions

Not in MVP scope, but available for future enhancements:
```typescript
// Example: listen to new completions
const subscription = supabase
  .channel('completions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'completions',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('New completion:', payload.new);
    }
  )
  .subscribe();
```

## Testing

For tests, mock the Supabase client:
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: mockChallenges,
        error: null,
      })),
    })),
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));
```

## Reference

Full Supabase docs: https://supabase.com/docs
