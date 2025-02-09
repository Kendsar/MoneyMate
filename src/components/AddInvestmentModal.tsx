import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle investment submission
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-md p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Add Investment
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Investment Name
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
                placeholder="e.g., AAPL Stock, Bitcoin"
                required
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Amount (TND)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                htmlFor="type"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Investment Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select type</option>
                <option value="stocks">Stocks</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="realestate">Real Estate</option>
                <option value="bonds">Bonds</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="description"
                className={`block text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                } mb-1`}
              >
                Description
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
                placeholder="Add investment details"
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
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Investment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};