/*
  # Bad Habits Feature Implementation

  1. New Tables
    - bad_habits
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - description (text)
      - cost_per_occurrence (decimal)
      - created_at (timestamp)
      - updated_at (timestamp)

    - habit_tracking
      - id (uuid, primary key)
      - habit_id (uuid, foreign key)
      - date (date)
      - avoided (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Functions
    - Calculate streaks
    - Calculate savings
    - Update financial summary

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Bad Habits table
CREATE TABLE IF NOT EXISTS bad_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  cost_per_occurrence decimal NOT NULL CHECK (cost_per_occurrence >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy
ALTER TABLE bad_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bad habits"
  ON bad_habits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS bad_habits_user_id_idx ON bad_habits(user_id);

-- Habit Tracking table
CREATE TABLE IF NOT EXISTS habit_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES bad_habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  avoided boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy
ALTER TABLE habit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit tracking"
  ON habit_tracking FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bad_habits
      WHERE bad_habits.id = habit_tracking.habit_id
      AND bad_habits.user_id = auth.uid()
    )
  );

-- Create indexes for optimized queries
CREATE INDEX IF NOT EXISTS habit_tracking_habit_id_idx ON habit_tracking(habit_id);
CREATE INDEX IF NOT EXISTS habit_tracking_date_idx ON habit_tracking(date);
CREATE INDEX IF NOT EXISTS habit_tracking_habit_id_date_idx ON habit_tracking(habit_id, date);

-- Function to calculate current streak for a habit
CREATE OR REPLACE FUNCTION get_habit_streak(habit_uuid uuid)
RETURNS integer AS $$
DECLARE
  streak integer := 0;
  last_avoided_date date;
  current_date date := CURRENT_DATE;
BEGIN
  -- Get the last date the habit was avoided
  SELECT date
  INTO last_avoided_date
  FROM habit_tracking
  WHERE habit_id = habit_uuid
    AND avoided = true
    AND date <= current_date
  ORDER BY date DESC
  LIMIT 1;

  -- If no records or last avoided date is not yesterday/today, return 0
  IF last_avoided_date IS NULL OR last_avoided_date < current_date - interval '1 day' THEN
    RETURN 0;
  END IF;

  -- Count consecutive days
  WITH RECURSIVE dates AS (
    SELECT last_avoided_date as date
    UNION ALL
    SELECT date - 1
    FROM dates
    WHERE EXISTS (
      SELECT 1
      FROM habit_tracking
      WHERE habit_id = habit_uuid
        AND avoided = true
        AND date = dates.date - 1
    )
  )
  SELECT count(*)
  INTO streak
  FROM dates;

  RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total savings for a habit
CREATE OR REPLACE FUNCTION calculate_habit_savings(
  habit_uuid uuid,
  start_date date,
  end_date date
)
RETURNS decimal AS $$
DECLARE
  total_savings decimal := 0;
  cost_per_day decimal;
BEGIN
  -- Get cost per occurrence
  SELECT cost_per_occurrence INTO cost_per_day
  FROM bad_habits
  WHERE id = habit_uuid;

  -- Calculate total savings
  SELECT COALESCE(SUM(CASE WHEN avoided THEN cost_per_day ELSE 0 END), 0)
  INTO total_savings
  FROM habit_tracking
  WHERE habit_id = habit_uuid
    AND date BETWEEN start_date AND end_date;

  RETURN total_savings;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total savings for all habits of a user
CREATE OR REPLACE FUNCTION calculate_total_savings(
  user_uuid uuid,
  start_date date,
  end_date date
)
RETURNS decimal AS $$
DECLARE
  total_savings decimal := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE WHEN ht.avoided THEN bh.cost_per_occurrence ELSE 0 END
  ), 0)
  INTO total_savings
  FROM bad_habits bh
  LEFT JOIN habit_tracking ht ON ht.habit_id = bh.id
  WHERE bh.user_id = user_uuid
    AND ht.date BETWEEN start_date AND end_date;

  RETURN total_savings;
END;
$$ LANGUAGE plpgsql;

-- Function to get habit statistics
CREATE OR REPLACE FUNCTION get_habit_statistics(
  habit_uuid uuid,
  start_date date,
  end_date date
)
RETURNS TABLE (
  date date,
  avoided boolean,
  savings decimal
) AS $$
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date
  )
  SELECT
    d.date,
    COALESCE(ht.avoided, false) as avoided,
    CASE 
      WHEN COALESCE(ht.avoided, false) THEN bh.cost_per_occurrence 
      ELSE 0 
    END as savings
  FROM dates d
  LEFT JOIN habit_tracking ht ON ht.habit_id = habit_uuid AND ht.date = d.date
  LEFT JOIN bad_habits bh ON bh.id = habit_uuid
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_bad_habits
  BEFORE UPDATE ON bad_habits
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_habit_tracking
  BEFORE UPDATE ON habit_tracking
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create unique constraint to prevent multiple entries for the same habit and date
ALTER TABLE habit_tracking
  ADD CONSTRAINT unique_habit_date UNIQUE (habit_id, date);