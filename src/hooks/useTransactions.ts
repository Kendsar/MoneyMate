import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, TransactionInsert, TransactionUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        setTransactions(data as Transaction[]);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Set up real-time subscription
    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, profile]);

  const addTransaction = async (transaction: Omit<TransactionInsert, 'user_id'>) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const newTransaction: TransactionInsert = {
        ...transaction,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        throw error;
      }

      return { data: data as Transaction, error: null };
    } catch (err) {
      console.error('Error adding transaction:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateTransaction = async (id: string, updates: TransactionUpdate) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as Transaction, error: null };
    } catch (err) {
      console.error('Error updating transaction:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting transaction:', err);
      return { error: err as Error };
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};