import React, { useState } from 'react';
import { useInvestments } from '../hooks/useInvestments';
import { TrendingUp, TrendingDown, Plus, Trash2, Edit } from 'lucide-react';
import { useFinancialSummary } from '../hooks/useFinancialSummary';

interface InvestmentsProps {
  darkMode: boolean;
  onAddInvestment: () => void;
}

export const Investments: React.FC<InvestmentsProps> = ({ darkMode, onAddInvestment }) => {
  const { investments, loading, deleteInvestment } = useInvestments();
  const { summary } = useFinancialSummary();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const { error } = await deleteInvestment(id);
      if (error) {
        console.error('Error deleting investment:', error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredInvestments = filter === 'all' 
    ? investments 
    : investments.filter(inv => inv.type === filter);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      stocks: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      crypto: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      realestate: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      bonds: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      etf: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      mutual_fund: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Calculate total investment value
  const totalInvestmentValue = Number(summary?.total_investments || 0);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Investment Portfolio
        </h2>
        <button
          onClick={onAddInvestment}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Investment
        </button>
      </div>
      
      {/* Summary Card */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Portfolio Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Value</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              TND {totalInvestmentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Investments</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {investments.length}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Performance</p>
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
              <p className={`text-2xl font-bold text-green-500`}>
                +8.2%
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Investments List */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
        {/* Filters */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          {['all', 'stocks', 'crypto', 'realestate', 'bonds', 'etf', 'mutual_fund', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : 
               type === 'realestate' ? 'Real Estate' :
               type === 'etf' ? 'ETF' :
               type === 'mutual_fund' ? 'Mutual Fund' :
               type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {filter !== 'all' 
              ? `No ${filter} investments found`
              : 'No investments yet. Add your first investment!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Name</th>
                  <th className={`px-4 py-3 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Type</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                  <th className={`px-4 py-3 text-right text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((investment) => (
                  <tr 
                    key={investment.id} 
                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      <div>
                        <p className="font-medium">{investment.name}</p>
                        {investment.description && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {investment.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(investment.type)}`}>
                        {investment.type === 'realestate' ? 'Real Estate' :
                         investment.type === 'etf' ? 'ETF' :
                         investment.type === 'mutual_fund' ? 'Mutual Fund' :
                         investment.type.charAt(0).toUpperCase() + investment.type.slice(1)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      TND {Number(investment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDelete(investment.id)}
                          disabled={isDeleting === investment.id}
                          className={`p-1 rounded-full ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          } ${isDeleting === investment.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
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