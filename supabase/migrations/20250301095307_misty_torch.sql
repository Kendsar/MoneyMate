/*
  # Fix User RLS Policies and Authentication Flow

  1. Changes
     - Update RLS policies for users table to allow proper user creation
     - Add policy for inserting new users
     - Fix foreign key constraints handling
  
  2. Security
     - Maintain security while allowing proper user creation
     - Ensure authenticated users can only access their own data
*/

-- Fix users table RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow new users to be created (important for signup flow)
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage all users (for admin functions)
CREATE POLICY "Service role can manage all users"
  ON users FOR ALL
  TO service_role
  USING (true);

-- Ensure the auth.users() function exists for RLS policies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, currency)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'TND')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();