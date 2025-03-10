import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinancialSummary } from '../hooks/useFinancialSummary';

interface BalanceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const BalanceUpdateModal: React.FC<BalanceUpdateModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const { summary, updateSummary } = useFinancialSummary();
  const [balance, setBalance] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (summary) {
      setBalance(summary.current_balance.toString());
      setMonthlyIncome(summary.monthly_income.toString());
    }
  }, [summary]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setLoading(true);
      
      const balanceValue = parseFloat(balance);
      const incomeValue = parseFloat(monthlyIncome);
      
      if (isNaN(balanceValue)) {
        setError('Please enter a valid balance amount');
        return;
      }
      
      if (isNaN(incomeValue) || incomeValue < 0) {
        setError('Please enter a valid monthly income amount');
        return;
      }
      
      const { error } = await updateSummary({
        current_balance: balanceValue,
        monthly_income: incomeValue
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      onClose();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-md p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Update Financial Information
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="balance"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Current Balance
              </label>
              <input
                type="number"
                id="balance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            
            <div>
              <label
                htmlFor="monthlyIncome"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Monthly Income
              </label>
              <input
                type="number"
                id="monthlyIncome"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};