import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgetCategories } from '../hooks/useBudgetCategories';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface BudgetProps {
  darkMode: boolean;
}

export const Budget: React.FC<BudgetProps> = ({ darkMode }) => {
  const { transactions } = useTransactions();
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useBudgetCategories();
  
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Calculate spending by category for the current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear &&
      transaction.type === 'expense'
    );
  });
  
  const spendingByCategory: Record<string, number> = {};
  
  monthlyTransactions.forEach(transaction => {
    const category = transaction.category;
    if (!spendingByCategory[category]) {
      spendingByCategory[category] = 0;
    }
    spendingByCategory[category] += Number(transaction.amount);
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsSubmitting(true);
      
      if (!categoryName || !monthlyLimit) {
        setError('Please fill in all fields');
        return;
      }
      
      const limitValue = parseFloat(monthlyLimit);
      if (isNaN(limitValue) || limitValue <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      if (editingCategory) {
        await updateCategory(editingCategory, {
          name: categoryName,
          monthly_limit: limitValue,
        });
      } else {
        await addCategory({
          name: categoryName,
          monthly_limit: limitValue,
        });
      }
      
      // Reset form
      setCategoryName('');
      setMonthlyLimit('');
      setShowAddCategory(false);
      setEditingCategory(null);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category: any) => {
    setCategoryName(category.name);
    setMonthlyLimit(category.monthly_limit.toString());
    setEditingCategory(category.id);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsDeleting(id);
      const { error } = await deleteCategory(id);
      if (error) {
        console.error('Error deleting category:', error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelAddCategory = () => {
    setShowAddCategory(false);
    setCategoryName('');
    setMonthlyLimit('');
    setEditingCategory(null);
    setError(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Budget Overview
        </h2>
        <button
          onClick={() => setShowAddCategory(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Category
        </button>
      </div>
      
      {/* Add/Edit Category Form */}
      {showAddCategory && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {editingCategory ? 'Edit Budget Category' : 'Add Budget Category'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label
                htmlFor="categoryName"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Groceries, Entertainment"
                required
              />
            </div>
            
            <div>
              <label
                htmlFor="monthlyLimit"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Monthly Limit (TND)
              </label>
              <input
                type="number"
                id="monthlyLimit"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelAddCategory}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Budget Categories */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Monthly Budget Categories
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No budget categories yet. Add your first category!
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const spent = spendingByCategory[category.name.toLowerCase()] || 0;
              const limit = Number(category.monthly_limit);
              const percentage = Math.min(100, Math.round((spent / limit) * 100));
              const isOverBudget = spent > limit;
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {category.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          TND {spent.toFixed(2)} of TND {limit.toFixed(2)}
                        </p>
                        <span className={`text-sm ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                          {isOverBudget ? 'Over budget' : `${100 - percentage}% remaining`}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Edit className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isDeleting === category.id}
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        } ${isDeleting === category.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`flex flex-col justify-center overflow-hidden ${
                          isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};