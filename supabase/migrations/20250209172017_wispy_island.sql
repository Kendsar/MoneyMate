-- Users table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT auth.uid(),
      email text NOT NULL UNIQUE,
      full_name text,
      currency text DEFAULT 'TND',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile"
      ON users FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile"
      ON users FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Transactions table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    CREATE TABLE transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      amount decimal NOT NULL,
      type text NOT NULL CHECK (type IN ('income', 'expense')),
      category text NOT NULL,
      description text,
      date timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own transactions') THEN
    CREATE POLICY "Users can manage own transactions"
      ON transactions FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Investments table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investments') THEN
    CREATE TABLE investments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      name text NOT NULL,
      amount decimal NOT NULL,
      type text NOT NULL,
      description text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own investments') THEN
    CREATE POLICY "Users can manage own investments"
      ON investments FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Savings Goals table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'savings_goals') THEN
    CREATE TABLE savings_goals (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      name text NOT NULL,
      target_amount decimal NOT NULL,
      current_amount decimal DEFAULT 0,
      deadline timestamptz,
      description text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own savings goals') THEN
    CREATE POLICY "Users can manage own savings goals"
      ON savings_goals FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Budget Categories table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_categories') THEN
    CREATE TABLE budget_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      name text NOT NULL,
      monthly_limit decimal NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own budget categories') THEN
    CREATE POLICY "Users can manage own budget categories"
      ON budget_categories FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- User Preferences table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
    CREATE TABLE user_preferences (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      dark_mode boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own preferences') THEN
    CREATE POLICY "Users can manage own preferences"
      ON user_preferences FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Functions and Triggers
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_users') THEN
    CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_investments') THEN
    CREATE TRIGGER set_updated_at_investments
      BEFORE UPDATE ON investments
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_savings_goals') THEN
    CREATE TRIGGER set_updated_at_savings_goals
      BEFORE UPDATE ON savings_goals
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_preferences') THEN
    CREATE TRIGGER set_updated_at_user_preferences
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;
