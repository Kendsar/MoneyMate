import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SavingsGoal, SavingsGoalInsert, SavingsGoalUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setGoals(data as SavingsGoal[]);
      } catch (err) {
        console.error('Error fetching savings goals:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();

    // Set up real-time subscription
    const subscription = supabase
      .channel('savings_goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_goals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, profile]);

  const addGoal = async (goal: Omit<SavingsGoalInsert, 'user_id'>) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const newGoal: SavingsGoalInsert = {
        ...goal,
        user_id: user.id,
        current_amount: goal.current_amount || 0,
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([newGoal])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as SavingsGoal, error: null };
    } catch (err) {
      console.error('Error adding savings goal:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateGoal = async (id: string, updates: SavingsGoalUpdate) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as SavingsGoal, error: null };
    } catch (err) {
      console.error('Error updating savings goal:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting savings goal:', err);
      return { error: err as Error };
    }
  };

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
  };
};