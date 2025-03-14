/*
  # Fix Schema Mismatches and Improve Database Structure

  1. Changes
     - Add missing updated_at column to transactions table
     - Add updated_at trigger for transactions table
     - Improve user creation trigger to handle metadata more robustly
     - Ensure all tables have proper timestamps and constraints
  
  2. Security
     - Maintain existing security policies
     - Ensure proper data integrity with constraints
*/

-- Fix transactions table - add missing updated_at column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE transactions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add updated_at trigger for transactions table
DROP TRIGGER IF EXISTS set_updated_at ON transactions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Improve user creation trigger to handle metadata more robustly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name_value text;
BEGIN
  -- Extract full_name from metadata if it exists
  full_name_value := CASE 
    WHEN new.raw_user_meta_data->>'full_name' IS NOT NULL THEN new.raw_user_meta_data->>'full_name'
    ELSE NULL
  END;

  INSERT INTO public.users (id, email, full_name, currency)
  VALUES (
    new.id, 
    new.email, 
    full_name_value,
    'TND'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all tables have proper constraints and indexes
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

-- Ensure all date columns have proper defaults
DO $$ 
BEGIN
  -- Check and fix date column in transactions
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'date' AND column_default IS NULL
  ) THEN
    ALTER TABLE transactions ALTER COLUMN date SET DEFAULT now();
  END IF;
END $$;