/*
  # Financial data real-time updates

  1. New Tables
    - `financial_summaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `current_balance` (decimal)
      - `monthly_income` (decimal)
      - `total_investments` (decimal)
      - `total_expenses` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `financial_summaries` table
    - Add policy for authenticated users to manage their own data
  
  3. Triggers
    - Add triggers to update financial summaries when transactions, investments, or goals change
*/

-- Create financial summaries table
CREATE TABLE IF NOT EXISTS financial_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_balance decimal NOT NULL DEFAULT 0,
  monthly_income decimal NOT NULL DEFAULT 0,
  total_investments decimal NOT NULL DEFAULT 0,
  total_expenses decimal NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE financial_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own financial summaries"
  ON financial_summaries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS financial_summaries_user_id_idx ON financial_summaries(user_id);

-- Create trigger to update financial_summaries when transactions change
CREATE OR REPLACE FUNCTION update_financial_summary_on_transaction_change()
RETURNS TRIGGER AS $$
DECLARE
  summary_exists boolean;
BEGIN
  -- Check if summary exists for this user
  SELECT EXISTS(
    SELECT 1 FROM financial_summaries WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  ) INTO summary_exists;
  
  -- For INSERT operations
  IF (TG_OP = 'INSERT') THEN
    IF (summary_exists) THEN
      -- Update existing summary
      IF (NEW.type = 'income') THEN
        UPDATE financial_summaries 
        SET 
          current_balance = current_balance + NEW.amount,
          monthly_income = CASE 
            WHEN EXTRACT(MONTH FROM NEW.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM NEW.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN monthly_income + NEW.amount 
            ELSE monthly_income 
          END,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSE -- expense
        UPDATE financial_summaries 
        SET 
          current_balance = current_balance - NEW.amount,
          total_expenses = CASE 
            WHEN EXTRACT(MONTH FROM NEW.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM NEW.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN total_expenses + NEW.amount 
            ELSE total_expenses 
          END,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    ELSE
      -- Create new summary
      INSERT INTO financial_summaries (
        user_id, 
        current_balance, 
        monthly_income,
        total_expenses
      ) 
      VALUES (
        NEW.user_id, 
        CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END,
        CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.type = 'expense' THEN NEW.amount ELSE 0 END
      );
    END IF;
  
  -- For UPDATE operations
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.type = OLD.type) THEN
      -- Same type, just amount changed
      IF (NEW.type = 'income') THEN
        UPDATE financial_summaries 
        SET 
          current_balance = current_balance - OLD.amount + NEW.amount,
          monthly_income = CASE 
            WHEN EXTRACT(MONTH FROM NEW.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM NEW.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN monthly_income - OLD.amount + NEW.amount 
            ELSE monthly_income 
          END,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSE -- expense
        UPDATE financial_summaries 
        SET 
          current_balance = current_balance + OLD.amount - NEW.amount,
          total_expenses = CASE 
            WHEN EXTRACT(MONTH FROM NEW.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM NEW.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN total_expenses - OLD.amount + NEW.amount 
            ELSE total_expenses 
          END,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    ELSE
      -- Type changed (income <-> expense)
      IF (NEW.type = 'income') THEN
        -- Changed from expense to income
        UPDATE financial_summaries 
        SET 
          current_balance = current_balance + OLD.amount + NEW.amount,
          monthly_income = CASE 
            WHEN EXTRACT(MONTH FROM NEW.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM NEW.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN monthly_income + NEW.amount 
            ELSE monthly_income 
          END,
          total_expenses = CASE 
            WHEN EXTRACT(MONTH FROM OLD.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM OLD.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN total_expenses - OLD.amount 
            ELSE total_expenses 
          END,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSE
        -- Changed from income to expense
        UPDATE financial_summaries 
        SET 
          current_balance = current_balance - OLD.amount - NEW.amount,
          monthly_income = CASE 
            WHEN EXTRACT(MONTH FROM OLD.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM OLD.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN monthly_income - OLD.amount 
            ELSE monthly_income 
          END,
          total_expenses = CASE 
            WHEN EXTRACT(MONTH FROM NEW.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
              AND EXTRACT(YEAR FROM NEW.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
            THEN total_expenses + NEW.amount 
            ELSE total_expenses 
          END,
          updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  
  -- For DELETE operations
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.type = 'income') THEN
      UPDATE financial_summaries 
      SET 
        current_balance = current_balance - OLD.amount,
        monthly_income = CASE 
          WHEN EXTRACT(MONTH FROM OLD.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(YEAR FROM OLD.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
          THEN monthly_income - OLD.amount 
          ELSE monthly_income 
        END,
        updated_at = now()
      WHERE user_id = OLD.user_id;
    ELSE -- expense
      UPDATE financial_summaries 
      SET 
        current_balance = current_balance + OLD.amount,
        total_expenses = CASE 
          WHEN EXTRACT(MONTH FROM OLD.date) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(YEAR FROM OLD.date) = EXTRACT(YEAR FROM CURRENT_DATE) 
          THEN total_expenses - OLD.amount 
          ELSE total_expenses 
        END,
        updated_at = now()
      WHERE user_id = OLD.user_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transactions
DROP TRIGGER IF EXISTS update_financial_summary_transactions ON transactions;
CREATE TRIGGER update_financial_summary_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_financial_summary_on_transaction_change();

-- Create trigger to update financial_summaries when investments change
CREATE OR REPLACE FUNCTION update_financial_summary_on_investment_change()
RETURNS TRIGGER AS $$
DECLARE
  summary_exists boolean;
BEGIN
  -- Check if summary exists for this user
  SELECT EXISTS(
    SELECT 1 FROM financial_summaries WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  ) INTO summary_exists;
  
  -- For INSERT operations
  IF (TG_OP = 'INSERT') THEN
    IF (summary_exists) THEN
      -- Update existing summary
      UPDATE financial_summaries 
      SET 
        total_investments = total_investments + NEW.amount,
        current_balance = current_balance - NEW.amount, -- Investments reduce available balance
        updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Create new summary
      INSERT INTO financial_summaries (
        user_id, 
        current_balance,
        total_investments
      ) 
      VALUES (
        NEW.user_id, 
        -NEW.amount, -- Investments reduce available balance
        NEW.amount
      );
    END IF;
  
  -- For UPDATE operations
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE financial_summaries 
    SET 
      total_investments = total_investments - OLD.amount + NEW.amount,
      current_balance = current_balance + OLD.amount - NEW.amount, -- Adjust balance based on investment change
      updated_at = now()
    WHERE user_id = NEW.user_id;
  
  -- For DELETE operations
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE financial_summaries 
    SET 
      total_investments = total_investments - OLD.amount,
      current_balance = current_balance + OLD.amount, -- Return investment amount to balance
      updated_at = now()
    WHERE user_id = OLD.user_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for investments
DROP TRIGGER IF EXISTS update_financial_summary_investments ON investments;
CREATE TRIGGER update_financial_summary_investments
  AFTER INSERT OR UPDATE OR DELETE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_financial_summary_on_investment_change();

-- Create function to manually update a user's financial summary
CREATE OR REPLACE FUNCTION update_user_financial_summary(user_uuid uuid)
RETURNS void AS $$
DECLARE
  total_inc decimal;
  total_exp decimal;
  total_inv decimal;
  monthly_inc decimal;
  monthly_exp decimal;
  summary_exists boolean;
BEGIN
  -- Calculate totals
  SELECT COALESCE(SUM(amount), 0) INTO total_inc
  FROM transactions 
  WHERE user_id = user_uuid AND type = 'income';
  
  SELECT COALESCE(SUM(amount), 0) INTO total_exp
  FROM transactions 
  WHERE user_id = user_uuid AND type = 'expense';
  
  SELECT COALESCE(SUM(amount), 0) INTO total_inv
  FROM investments 
  WHERE user_id = user_uuid;
  
  -- Calculate monthly figures
  SELECT COALESCE(SUM(amount), 0) INTO monthly_inc
  FROM transactions 
  WHERE user_id = user_uuid 
    AND type = 'income'
    AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  SELECT COALESCE(SUM(amount), 0) INTO monthly_exp
  FROM transactions 
  WHERE user_id = user_uuid 
    AND type = 'expense'
    AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Check if summary exists
  SELECT EXISTS(
    SELECT 1 FROM financial_summaries WHERE user_id = user_uuid
  ) INTO summary_exists;
  
  IF summary_exists THEN
    -- Update existing summary
    UPDATE financial_summaries 
    SET 
      current_balance = total_inc - total_exp - total_inv,
      monthly_income = monthly_inc,
      total_expenses = monthly_exp,
      total_investments = total_inv,
      updated_at = now()
    WHERE user_id = user_uuid;
  ELSE
    -- Create new summary
    INSERT INTO financial_summaries (
      user_id, 
      current_balance, 
      monthly_income,
      total_expenses,
      total_investments
    ) 
    VALUES (
      user_uuid, 
      total_inc - total_exp - total_inv,
      monthly_inc,
      monthly_exp,
      total_inv
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize financial summary when a new user is created
CREATE OR REPLACE FUNCTION initialize_financial_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO financial_summaries (user_id, current_balance, monthly_income, total_investments, total_expenses)
  VALUES (NEW.id, 0, 0, 0, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users
DROP TRIGGER IF EXISTS initialize_financial_summary_trigger ON users;
CREATE TRIGGER initialize_financial_summary_trigger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION initialize_financial_summary();

-- Initialize financial summaries for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM users LOOP
    PERFORM update_user_financial_summary(user_record.id);
  END LOOP;
END;
$$;