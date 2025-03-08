/*
  # Fix schema issues

  1. Changes
    - Remove password column constraint from users table
    - Fix user profile creation and fetching
    - Ensure proper RLS policies for all tables
    - Fix transaction creation issues

  2. Security
    - Update RLS policies to ensure proper access control
*/

-- Fix users table issues
DO $$ 
BEGIN
  -- Check if password column exists and drop it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users DROP COLUMN password;
  END IF;
END $$;

-- Ensure users table has correct structure
ALTER TABLE users 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Fix RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Create proper RLS policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all users"
  ON users FOR ALL
  TO service_role
  USING (true);

-- Improve user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, currency)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'TND'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix transactions table issues
DO $$ 
BEGIN
  -- Ensure date column has proper default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'date'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN date SET DEFAULT now();
  END IF;
  
  -- Ensure updated_at column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE transactions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Fix RLS policies for transactions
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix investments table RLS
DROP POLICY IF EXISTS "Users can manage own investments" ON investments;
CREATE POLICY "Users can manage own investments"
  ON investments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix savings_goals table RLS
DROP POLICY IF EXISTS "Users can manage own savings goals" ON savings_goals;
CREATE POLICY "Users can manage own savings goals"
  ON savings_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix budget_categories table RLS
DROP POLICY IF EXISTS "Users can manage own budget categories" ON budget_categories;
CREATE POLICY "Users can manage own budget categories"
  ON budget_categories FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure all tables have proper indexes
DO $$ 
BEGIN
  -- Add indexes for foreign keys if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'transactions_user_id_idx'
  ) THEN
    CREATE INDEX transactions_user_id_idx ON transactions(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'investments_user_id_idx'
  ) THEN
    CREATE INDEX investments_user_id_idx ON investments(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'savings_goals_user_id_idx'
  ) THEN
    CREATE INDEX savings_goals_user_id_idx ON savings_goals(user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'budget_categories_user_id_idx'
  ) THEN
    CREATE INDEX budget_categories_user_id_idx ON budget_categories(user_id);
  END IF;
END $$;