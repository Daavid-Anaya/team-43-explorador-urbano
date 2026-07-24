-- Row Level Security (RLS) policies for Urban Explorer MVP
-- Ensures users can only access their own data and public challenges

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Challenges policies
-- Anyone (authenticated or not) can read active challenges
CREATE POLICY "Anyone can read active challenges"
  ON challenges
  FOR SELECT
  USING (active = true);

-- Completions policies
-- Users can read their own completions
CREATE POLICY "Users can read own completions"
  ON completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own completions (through submit_completion function only)
-- This policy is permissive but the function enforces validation
CREATE POLICY "Users can insert own completions"
  ON completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete completions
-- No UPDATE or DELETE policies = operations blocked

-- Badges policies
-- Users can read their own badges
CREATE POLICY "Users can read own badges"
  ON badges
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own badges (through submit_completion function only)
CREATE POLICY "Users can insert own badges"
  ON badges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete badges
-- No UPDATE or DELETE policies = operations blocked
