-- ══════════════════════════════════════════════════════════════════════════════
-- TAMILPRENEUR AI STUDIO: SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Copy and run this in your Supabase Project -> SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Profiles Table (Team Members)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  team_role TEXT DEFAULT 'Team Member',
  department TEXT DEFAULT 'General',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated team members"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 2. MOM Records Table (Minutes of Meeting)
CREATE TABLE IF NOT EXISTS public.mom_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  department TEXT DEFAULT 'General',
  date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  decisions JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  discussion_points JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for MOM Records (Each team member sees their own or team records)
ALTER TABLE public.mom_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MOM records"
  ON public.mom_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MOM records"
  ON public.mom_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MOM records"
  ON public.mom_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MOM records"
  ON public.mom_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Call Records Table (Lead Intelligence & Sales CRM)
CREATE TABLE IF NOT EXISTS public.call_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  client_name TEXT,
  lead_status TEXT DEFAULT 'New',
  department TEXT DEFAULT 'Inbound Lead',
  date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  follow_ups JSONB DEFAULT '[]'::jsonb,
  coaching_tips TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Call Records
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Call records"
  ON public.call_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Call records"
  ON public.call_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Call records"
  ON public.call_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Call records"
  ON public.call_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Activity Logs Table (User Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
