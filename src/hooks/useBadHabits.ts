import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BadHabit, HabitTracking, HabitStatistics } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useBadHabits = () => {
  const [habits, setHabits] = useState<BadHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const fetchHabits = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('bad_habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setHabits(data as BadHabit[]);
      } catch (err) {
        console.error('Error fetching bad habits:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();

    // Set up real-time subscription
    const subscription = supabase
      .channel('bad_habits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bad_habits',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchHabits();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const addHabit = async (habit: Omit<BadHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('bad_habits')
        .insert([{ ...habit, user_id: user.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as BadHabit, error: null };
    } catch (err) {
      console.error('Error adding bad habit:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('bad_habits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting bad habit:', err);
      return { error: err as Error };
    }
  };

  const trackHabit = async (habitId: string, date: string, avoided: boolean) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('habit_tracking')
        .upsert([
          {
            habit_id: habitId,
            date,
            avoided,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as HabitTracking, error: null };
    } catch (err) {
      console.error('Error tracking habit:', err);
      return { data: null, error: err as Error };
    }
  };

  const getHabitStreak = async (habitId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_habit_streak', { habit_uuid: habitId });

      if (error) {
        throw error;
      }

      return { data: data as number, error: null };
    } catch (err) {
      console.error('Error getting habit streak:', err);
      return { data: 0, error: err as Error };
    }
  };

  const getHabitStatistics = async (
    habitId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const { data, error } = await supabase
        .rpc('get_habit_statistics', {
          habit_uuid: habitId,
          start_date: startDate,
          end_date: endDate,
        });

      if (error) {
        throw error;
      }

      return { data: data as HabitStatistics[], error: null };
    } catch (err) {
      console.error('Error getting habit statistics:', err);
      return { data: null, error: err as Error };
    }
  };

  const calculateSavings = async (
    habitId: string,
    startDate: string,
    endDate: string
  ) => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_habit_savings', {
          habit_uuid: habitId,
          start_date: startDate,
          end_date: endDate,
        });

      if (error) {
        throw error;
      }

      return { data: data as number, error: null };
    } catch (err) {
      console.error('Error calculating savings:', err);
      return { data: 0, error: err as Error };
    }
  };

  const calculateTotalSavings = async (startDate: string, endDate: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .rpc('calculate_total_savings', {
          user_uuid: user.id,
          start_date: startDate,
          end_date: endDate,
        });

      if (error) {
        throw error;
      }

      return { data: data as number, error: null };
    } catch (err) {
      console.error('Error calculating total savings:', err);
      return { data: 0, error: err as Error };
    }
  };

  return {
    habits,
    loading,
    error,
    addHabit,
    deleteHabit,
    trackHabit,
    getHabitStreak,
    getHabitStatistics,
    calculateSavings,
    calculateTotalSavings,
  };
};