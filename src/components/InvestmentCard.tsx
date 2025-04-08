import React from 'react';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Investment } from '../types/supabase';
import { Link } from 'react-router-dom';

interface InvestmentCardProps {
  darkMode: boolean;
  onAddInvestment: () => void;
  investments?: Investment[];
  loading?: boolean;
  currency?: string;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ 
  darkMode, 
  onAddInvestment,
  investments = [],
  loading = false,
  currency = 'TND'
}) => {
  // If we have real investments, use them, otherwise use sample data
  const displayInvestments = investments.length > 0 
    ? investments.slice(0, 3).map(inv => ({
        name: inv.name,
        value: `${currency} ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+2.4%', // This would come from market data in a real app
        type: inv.type.charAt(0).toUpperCase() + inv.type.slice(1)
      }))
    : [
        { name: 'AAPL', value: `${currency} 38,450`, change: '+2.4%', type: 'Stocks' },
        { name: 'BTC', value: `${currency} 25,230`, change: '-1.2%', type: 'Crypto' },
        { name: 'Real Estate Fund', value: `${currency} 145,000`, change: '+0.8%', type: 'Real Estate' },
      ];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm h-full`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Investment Portfolio
        </h3>
        <button
          onClick={onAddInvestment}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayInvestments.map((investment) => (
            <div key={investment.name} className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {investment.name}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {investment.type}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {investment.value}
                </p>
                <div className="flex items-center space-x-1">
                  {investment.change.startsWith('+') ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={investment.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                    {investment.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {investments.length > 3 && (
            <div className="text-center mt-4">
              <Link
                to="/investments"
                className={`text-sm font-medium ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                View all investments ({investments.length}) →
              </Link>
            </div>
          )}
          
          {investments.length === 0 && (
            <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No investments yet. Add your first investment!
            </div>
          )}
        </div>
      )}
    </div>
  );
};