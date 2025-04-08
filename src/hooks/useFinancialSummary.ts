import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FinancialSummary, FinancialSummaryUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useFinancialSummary = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setSummary(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('financial_summaries')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // More efficient than .single() for optional results

      if (fetchError) {
        // If no summary exists, create one with optimistic update
        if (fetchError.code === 'PGRST116') {
          setSummary({
            id: 'temp',
            user_id: user.id,
            current_balance: 0,
            monthly_income: 0,
            total_investments: 0,
            total_expenses: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          const { data: newData, error: initError } = await supabase
            .from('financial_summaries')
            .insert([{
              user_id: user.id,
              current_balance: 0,
              monthly_income: 0,
              total_investments: 0,
              total_expenses: 0
            }])
            .select()
            .single();
            
          if (initError) {
            throw initError;
          }
          
          setSummary(newData as FinancialSummary);
        } else {
          throw fetchError;
        }
      } else {
        setSummary(data as FinancialSummary);
      }
    } catch (err) {
      console.error('Error fetching financial summary:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSummary();

    // Optimize realtime subscription with specific columns
    if (user) {
      const subscription = supabase
        .channel('financial_summaries_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'financial_summaries',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              setSummary(payload.new as FinancialSummary);
            } else if (payload.eventType === 'DELETE') {
              setSummary(null);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchSummary]);

  const updateSummary = async (updates: FinancialSummaryUpdate) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistic update
      if (summary) {
        setSummary({
          ...summary,
          ...updates,
          updated_at: new Date().toISOString()
        });
      }

      const { data, error } = await supabase
        .from('financial_summaries')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        // Rollback optimistic update
        fetchSummary();
        throw error;
      }

      return { data: data as FinancialSummary, error: null };
    } catch (err) {
      console.error('Error updating financial summary:', err);
      return { data: null, error: err as Error };
    }
  };

  return {
    summary,
    loading,
    error,
    updateSummary,
    fetchSummary
  };
};