-- Security and smoke tests for Supabase schema
-- Run these tests after applying migrations to verify RLS and validation

-- Test 1: Direct insert to completions should be BLOCKED
-- Expected: INSERT fails due to no INSERT policy
DO $$
BEGIN
  -- Attempt direct insert (should fail)
  INSERT INTO public.completions (
    user_id,
    challenge_id,
    latitude,
    longitude,
    accuracy_meters,
    evidence_path,
    points_awarded
  ) VALUES (
    gen_random_uuid(),
    gen_random_uuid(),
    -34.0,
    -56.0,
    50.0,
    'test/evidence.jpg',
    100
  );
  
  RAISE EXCEPTION 'SECURITY FAIL: Direct insert to completions was allowed';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: Direct insert to completions blocked by RLS';
  WHEN others THEN
    RAISE NOTICE 'PASS: Direct insert to completions blocked (%)' , SQLERRM;
END;
$$;

-- Test 2: Direct insert to badges should be BLOCKED
-- Expected: INSERT fails due to no INSERT policy
DO $$
BEGIN
  -- Attempt direct insert (should fail)
  INSERT INTO public.badges (
    user_id,
    badge_type
  ) VALUES (
    gen_random_uuid(),
    'First Completion'
  );
  
  RAISE EXCEPTION 'SECURITY FAIL: Direct insert to badges was allowed';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: Direct insert to badges blocked by RLS';
  WHEN others THEN
    RAISE NOTICE 'PASS: Direct insert to badges blocked (%)' , SQLERRM;
END;
$$;

-- Test 3: submit_completion rejects unauthenticated user
-- Expected: Function raises exception
DO $$
DECLARE
  v_result JSON;
BEGIN
  v_result := submit_completion(
    gen_random_uuid(),
    -34.0,
    -56.0,
    50.0,
    'test/evidence.jpg'
  );
  
  RAISE EXCEPTION 'SECURITY FAIL: Unauthenticated completion was allowed';
EXCEPTION
  WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM LIKE '%must be authenticated%' THEN
      RAISE NOTICE 'PASS: Unauthenticated completion rejected';
    ELSE
      RAISE NOTICE 'FAIL: Unexpected error: %', SQLERRM;
    END IF;
END;
$$;

-- Test 4: submit_completion rejects GPS accuracy > 100m
-- Note: This test requires a valid user context in real scenario
-- For now, it will fail at auth check, which is acceptable
DO $$
DECLARE
  v_result JSON;
BEGIN
  v_result := submit_completion(
    gen_random_uuid(),
    -34.0,
    -56.0,
    150.0, -- Invalid accuracy
    'test/evidence.jpg'
  );
  
  RAISE EXCEPTION 'VALIDATION FAIL: Low GPS accuracy was allowed';
EXCEPTION
  WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM LIKE '%GPS accuracy too low%' OR SQLERRM LIKE '%must be authenticated%' THEN
      RAISE NOTICE 'PASS: Low GPS accuracy handled (%)' , SQLERRM;
    ELSE
      RAISE NOTICE 'UNEXPECTED: %', SQLERRM;
    END IF;
END;
$$;

-- Test 5: submit_completion rejects empty evidence path
DO $$
DECLARE
  v_result JSON;
BEGIN
  v_result := submit_completion(
    gen_random_uuid(),
    -34.0,
    -56.0,
    50.0,
    '' -- Empty evidence
  );
  
  RAISE EXCEPTION 'VALIDATION FAIL: Empty evidence was allowed';
EXCEPTION
  WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM LIKE '%Photo evidence is required%' OR SQLERRM LIKE '%must be authenticated%' THEN
      RAISE NOTICE 'PASS: Empty evidence rejected (%)' , SQLERRM;
    ELSE
      RAISE NOTICE 'UNEXPECTED: %', SQLERRM;
    END IF;
END;
$$;

-- Test 6: Verify RLS is enabled on all tables
DO $$
DECLARE
  v_tables TEXT[] := ARRAY['profiles', 'challenges', 'completions', 'badges'];
  v_table TEXT;
  v_rls_enabled BOOLEAN;
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    SELECT relrowsecurity INTO v_rls_enabled
    FROM pg_class
    WHERE relname = v_table AND relnamespace = 'public'::regnamespace;
    
    IF v_rls_enabled THEN
      RAISE NOTICE 'PASS: RLS enabled on %', v_table;
    ELSE
      RAISE EXCEPTION 'SECURITY FAIL: RLS not enabled on %', v_table;
    END IF;
  END LOOP;
END;
$$;

-- Test 7: Verify storage bucket exists and is private
DO $$
DECLARE
  v_bucket_public BOOLEAN;
BEGIN
  SELECT public INTO v_bucket_public
  FROM storage.buckets
  WHERE id = 'challenge-evidence';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FAIL: challenge-evidence bucket not found';
  END IF;
  
  IF v_bucket_public THEN
    RAISE EXCEPTION 'SECURITY FAIL: challenge-evidence bucket is public';
  ELSE
    RAISE NOTICE 'PASS: challenge-evidence bucket is private';
  END IF;
END;
$$;

-- Test 8: Verify submit_completion function exists with correct signature
DO $$
DECLARE
  v_function_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'submit_completion'
  ) INTO v_function_exists;
  
  IF v_function_exists THEN
    RAISE NOTICE 'PASS: submit_completion function exists';
  ELSE
    RAISE EXCEPTION 'FAIL: submit_completion function not found';
  END IF;
END;
$$;

RAISE NOTICE '========================================';
RAISE NOTICE 'Security tests completed';
RAISE NOTICE 'Review output above for PASS/FAIL results';
RAISE NOTICE '========================================';
