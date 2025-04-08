import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Investment, InvestmentInsert, InvestmentUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setInvestments(data as Investment[]);
      } catch (err) {
        console.error('Error fetching investments:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();

    // Set up real-time subscription
    const subscription = supabase
      .channel('investments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchInvestments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, profile]);

  const addInvestment = async (investment: Omit<InvestmentInsert, 'user_id'>) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const newInvestment: InvestmentInsert = {
        ...investment,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('investments')
        .insert([newInvestment])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as Investment, error: null };
    } catch (err) {
      console.error('Error adding investment:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateInvestment = async (id: string, updates: InvestmentUpdate) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as Investment, error: null };
    } catch (err) {
      console.error('Error updating investment:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting investment:', err);
      return { error: err as Error };
    }
  };

  return {
    investments,
    loading,
    error,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
};