-- ==============================================================================
-- BASEMENT NINE - SUPABASE DATABASE SCHEMA & RLS MIGRATION
-- Run this SQL in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create custom profiles table with email & credentials storage
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  password_hash TEXT,
  operator_name TEXT NOT NULL DEFAULT 'OPERATOR_09',
  unlocked_level INTEGER NOT NULL DEFAULT 1,
  completed_levels INTEGER[] NOT NULL DEFAULT '{}',
  best_times JSONB NOT NULL DEFAULT '{}'::jsonb,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  sanity INTEGER NOT NULL DEFAULT 100 CHECK (sanity >= 0 AND sanity <= 100),
  min_sanity_recorded INTEGER NOT NULL DEFAULT 100 CHECK (min_sanity_recorded >= 0 AND min_sanity_recorded <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 5. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    operator_name,
    unlocked_level,
    completed_levels,
    best_times,
    achievements,
    sanity,
    min_sanity_recorded
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'operator_name', 'OPERATOR_09'),
    1,
    '{}',
    '{}'::jsonb,
    '{}',
    100,
    100
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
