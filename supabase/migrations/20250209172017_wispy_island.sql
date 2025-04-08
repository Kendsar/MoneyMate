/*
  # Initial Finance App Schema

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text)
      - full_name (text)
      - created_at (timestamp)
      - updated_at (timestamp)
      - currency (text, default: 'TND')

    - transactions
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - amount (decimal)
      - type (text: 'income' or 'expense')
      - category (text)
      - description (text)
      - date (timestamp)
      - created_at (timestamp)

    - investments
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - amount (decimal)
      - type (text)
      - description (text)
      - created_at (timestamp)
      - updated_at (timestamp)

    - savings_goals
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - target_amount (decimal)
      - current_amount (decimal)
      - deadline (timestamp)
      - description (text)
      - created_at (timestamp)
      - updated_at (timestamp)

    - budget_categories
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - monthly_limit (decimal)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text NOT NULL UNIQUE,
  full_name text,
  currency text DEFAULT 'TND',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Transactions table
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

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Investments table
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

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own investments"
  ON investments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Savings Goals table
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

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own savings goals"
  ON savings_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Budget Categories table
CREATE TABLE budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  monthly_limit decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budget categories"
  ON budget_categories FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();