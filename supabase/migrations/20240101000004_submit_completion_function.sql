-- Completion validation function
-- Server-side validation for challenge completion with derived rewards
-- Validates auth, location, accuracy, evidence, and prevents duplicates

CREATE OR REPLACE FUNCTION submit_completion(
  p_challenge_id UUID,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_accuracy_meters DOUBLE PRECISION,
  p_evidence_path TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_challenge RECORD;
  v_distance_meters DOUBLE PRECISION;
  v_completion_id UUID;
  v_total_points INTEGER;
  v_completion_count INTEGER;
  v_new_badges TEXT[] := ARRAY[]::TEXT[];
  v_badge_inserted BOOLEAN;
  v_result JSON;
BEGIN
  -- Validate user is authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate GPS accuracy
  IF p_accuracy_meters > 100 THEN
    RAISE EXCEPTION 'GPS accuracy too low. Required: ≤ 100m, got: % m', p_accuracy_meters;
  END IF;

  -- Fetch challenge details
  SELECT * INTO v_challenge
  FROM public.challenges
  WHERE id = p_challenge_id AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found or inactive';
  END IF;

  -- Check for duplicate completion
  IF EXISTS (
    SELECT 1 FROM public.completions
    WHERE user_id = v_user_id AND challenge_id = p_challenge_id
  ) THEN
    RAISE EXCEPTION 'Challenge already completed';
  END IF;

  -- Calculate distance using Haversine formula (approximation)
  -- Earth radius in meters: 6371000
  v_distance_meters := 6371000 * 2 * ASIN(SQRT(
    POWER(SIN(RADIANS(p_latitude - v_challenge.latitude) / 2), 2) +
    COS(RADIANS(v_challenge.latitude)) * COS(RADIANS(p_latitude)) *
    POWER(SIN(RADIANS(p_longitude - v_challenge.longitude) / 2), 2)
  ));

  -- Validate user is within challenge radius
  IF v_distance_meters > v_challenge.radius_meters THEN
    RAISE EXCEPTION 'Too far from challenge location. Required: ≤ % m, distance: % m',
      v_challenge.radius_meters, ROUND(v_distance_meters::NUMERIC, 2);
  END IF;

  -- Validate evidence path exists and is accessible
  IF p_evidence_path IS NULL OR p_evidence_path = '' THEN
    RAISE EXCEPTION 'Photo evidence is required';
  END IF;

  -- Validate evidence path format (should be in user's folder)
  IF NOT p_evidence_path LIKE v_user_id::text || '/%' THEN
    RAISE EXCEPTION 'Invalid evidence path format';
  END IF;

  -- TODO: Validate evidence file exists in storage.objects
  -- This validation is deferred to avoid blocking the MVP
  -- Future enhancement: check storage.objects for file existence

  -- Insert completion record
  INSERT INTO public.completions (
    user_id,
    challenge_id,
    latitude,
    longitude,
    accuracy_meters,
    evidence_path,
    points_awarded
  ) VALUES (
    v_user_id,
    p_challenge_id,
    p_latitude,
    p_longitude,
    p_accuracy_meters,
    p_evidence_path,
    v_challenge.points
  )
  RETURNING id INTO v_completion_id;

  -- Calculate total points
  SELECT COALESCE(SUM(points_awarded), 0) INTO v_total_points
  FROM public.completions
  WHERE user_id = v_user_id;

  -- Get completion count
  SELECT COUNT(*) INTO v_completion_count
  FROM public.completions
  WHERE user_id = v_user_id;

  -- Award "First Completion" badge if this is the first
  IF v_completion_count = 1 THEN
    BEGIN
      INSERT INTO public.badges (user_id, badge_type)
      VALUES (v_user_id, 'First Completion');
      v_badge_inserted := TRUE;
    EXCEPTION
      WHEN unique_violation THEN
        v_badge_inserted := FALSE;
    END;
    
    IF v_badge_inserted THEN
      v_new_badges := array_append(v_new_badges, 'First Completion');
    END IF;
  END IF;

  -- Award "City Explorer" badge if user completed 5 challenges
  IF v_completion_count >= 5 THEN
    BEGIN
      INSERT INTO public.badges (user_id, badge_type)
      VALUES (v_user_id, 'City Explorer');
      v_badge_inserted := TRUE;
    EXCEPTION
      WHEN unique_violation THEN
        v_badge_inserted := FALSE;
    END;
    
    IF v_badge_inserted THEN
      v_new_badges := array_append(v_new_badges, 'City Explorer');
    END IF;
  END IF;

  -- Award "Challenge Master" badge if user completed all challenges in the city
  IF v_completion_count >= (
    SELECT COUNT(*) FROM public.challenges WHERE city = v_challenge.city AND active = true
  ) THEN
    BEGIN
      INSERT INTO public.badges (user_id, badge_type)
      VALUES (v_user_id, 'Challenge Master');
      v_badge_inserted := TRUE;
    EXCEPTION
      WHEN unique_violation THEN
        v_badge_inserted := FALSE;
    END;
    
    IF v_badge_inserted THEN
      v_new_badges := array_append(v_new_badges, 'Challenge Master');
    END IF;
  END IF;

  -- Build result JSON
  v_result := json_build_object(
    'completion_id', v_completion_id,
    'points_awarded', v_challenge.points,
    'total_points', v_total_points,
    'new_badges', v_new_badges
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_completion TO authenticated;

-- Revoke from public and anon
REVOKE EXECUTE ON FUNCTION submit_completion FROM public, anon;
