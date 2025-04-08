import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, TransactionInsert, TransactionUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from './useSubscription';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, type, category, description, date, created_at, updated_at')
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
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useSubscription('transactions', user?.id, fetchTransactions);

  const addTransaction = async (transaction: Omit<TransactionInsert, 'user_id'>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistic update
      const optimisticTransaction: Transaction = {
        id: 'temp',
        user_id: user.id,
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTransactions(prev => [optimisticTransaction, ...prev]);

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) {
        // Rollback optimistic update
        setTransactions(prev => prev.filter(t => t.id !== 'temp'));
        throw error;
      }

      // Update with real data
      setTransactions(prev => 
        prev.map(t => t.id === 'temp' ? (data as Transaction) : t)
      );

      return { data: data as Transaction, error: null };
    } catch (err) {
      console.error('Error adding transaction:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateTransaction = async (id: string, updates: TransactionUpdate) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistic update
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        // Rollback optimistic update
        fetchTransactions();
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
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Optimistic delete
      setTransactions(prev => prev.filter(t => t.id !== id));

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        // Rollback optimistic delete
        fetchTransactions();
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