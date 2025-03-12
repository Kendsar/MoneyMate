import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useFinancialSummary } from '../hooks/useFinancialSummary';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit } from 'lucide-react';

interface TransactionsProps {
  darkMode: boolean;
}

export const Transactions: React.FC<TransactionsProps> = ({ darkMode }) => {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const { summary } = useFinancialSummary();
  const { profile } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const { error } = await deleteTransaction(id);
      if (error) {
        console.error('Error deleting transaction:', error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      if (filter === 'all') return true;
      return transaction.type === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc'
          ? Number(b.amount) - Number(a.amount)
          : Number(a.amount) - Number(b.amount);
      }
    });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      housing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      food: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      transport: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      utilities: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      healthcare: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      salary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      investment: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      freelance: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      gift: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Transactions
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Balance</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {profile?.currency} {Number(summary?.current_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Income</p>
          <p className="text-2xl font-bold text-green-500">
            {profile?.currency} {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">
            {profile?.currency} {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
              Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className={`px-3 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className={`px-3 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Category</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Description</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(transaction.category)}`}>
                        {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {transaction.description || '-'}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{profile?.currency} {Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        disabled={isDeleting === transaction.id}
                        className={`p-1 rounded-full ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                        } ${isDeleting === transaction.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};