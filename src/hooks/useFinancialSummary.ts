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

      const { data, error } = await supabase
        .from('financial_summaries')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no summary exists, create one
        if (error.code === 'PGRST116') {
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
          throw error;
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

    // Set up real-time subscription only if user exists
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
            if (payload.eventType === 'UPDATE') {
              setSummary(payload.new as FinancialSummary);
            } else if (payload.eventType === 'INSERT') {
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

      if (!summary) {
        // If summary doesn't exist, create it first
        const { data: newSummary, error: createError } = await supabase
          .from('financial_summaries')
          .insert([{
            user_id: user.id,
            ...updates
          }])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setSummary(newSummary as FinancialSummary);
        return { data: newSummary as FinancialSummary, error: null };
      }

      const { data, error } = await supabase
        .from('financial_summaries')
        .update(updates)
        .eq('id', summary.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
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