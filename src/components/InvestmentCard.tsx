import React from 'react';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';

interface InvestmentCardProps {
  darkMode: boolean;
  onAddInvestment: () => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({ darkMode, onAddInvestment }) => {
  const investments = [
    { name: 'AAPL', value: 'TND 38,450', change: '+2.4%', type: 'Stocks' },
    { name: 'BTC', value: 'TND 25,230', change: '-1.2%', type: 'Crypto' },
    { name: 'Real Estate Fund', value: 'TND 145,000', change: '+0.8%', type: 'Real Estate' },
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
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
      <div className="space-y-4">
        {investments.map((investment) => (
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
      </div>
    </div>
  );
};