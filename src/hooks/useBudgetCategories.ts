import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BudgetCategory, BudgetCategoryInsert, BudgetCategoryUpdate } from '../types/supabase';
import { useAuth } from '../context/AuthContext';

export const useBudgetCategories = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('budget_categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data as BudgetCategory[]);
      } catch (err) {
        console.error('Error fetching budget categories:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Set up real-time subscription
    const subscription = supabase
      .channel('budget_categories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_categories',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, profile]);

  const addCategory = async (category: Omit<BudgetCategoryInsert, 'user_id'>) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const newCategory: BudgetCategoryInsert = {
        ...category,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('budget_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as BudgetCategory, error: null };
    } catch (err) {
      console.error('Error adding budget category:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateCategory = async (id: string, updates: BudgetCategoryUpdate) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('budget_categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data: data as BudgetCategory, error: null };
    } catch (err) {
      console.error('Error updating budget category:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error deleting budget category:', err);
      return { error: err as Error };
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};