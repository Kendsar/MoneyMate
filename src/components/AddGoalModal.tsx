import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { addGoal } = useSavingsGoals();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setLoading(true);
      
      if (!name || !targetAmount) {
        setError('Please fill in all required fields');
        return;
      }
      
      const targetAmountValue = parseFloat(targetAmount);
      if (isNaN(targetAmountValue) || targetAmountValue <= 0) {
        setError('Please enter a valid target amount');
        return;
      }
      
      const currentAmountValue = currentAmount ? parseFloat(currentAmount) : 0;
      if (isNaN(currentAmountValue) || currentAmountValue < 0) {
        setError('Please enter a valid current amount');
        return;
      }
      
      if (currentAmountValue > targetAmountValue) {
        setError('Current amount cannot be greater than target amount');
        return;
      }
      
      const { error } = await addGoal({
        name,
        target_amount: targetAmountValue,
        current_amount: currentAmountValue,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        description: description || null,
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      // Reset form and close modal
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
      setDescription('');
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
              Add Savings Goal
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
                htmlFor="name"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Goal Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., New Car, Emergency Fund"
                required
              />
            </div>
            
            <div>
              <label
                htmlFor="targetAmount"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Target Amount (TND)
              </label>
              <input
                type="number"
                id="targetAmount"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label
                htmlFor="currentAmount"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Current Amount (TND) (Optional)
              </label>
              <input
                type="number"
                id="currentAmount"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label
                htmlFor="deadline"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Target Date (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <div>
              <label
                htmlFor="description"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                placeholder="Add goal details"
                rows={3}
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
                {loading ? 'Adding...' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};