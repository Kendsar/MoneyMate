import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useFinancialSummary } from '../hooks/useFinancialSummary';
import { useAuth } from '../context/AuthContext';

export const BalanceWidget: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const { summary } = useFinancialSummary();
  const { profile } = useAuth();
  
  const currency = profile?.currency || 'TND';
  const currentBalance = Number(summary?.current_balance || 0);
  const monthlyIncome = Number(summary?.monthly_income || 0);
  const monthlyExpenses = Number(summary?.total_expenses || 0);
  
  const monthlyChange = monthlyIncome - monthlyExpenses;
  const changePercentage = monthlyIncome > 0 
    ? ((monthlyChange) / monthlyIncome * 100).toFixed(1)
    : '0.0';

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Current Balance
          </h3>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency} {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Monthly Income
          </h3>
          <p className="text-2xl font-bold mt-1 text-green-500">
            {currency} {monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Monthly Change
          </h3>
          <div className="flex items-center mt-1">
            {monthlyChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            )}
            <p className={`text-2xl font-bold ${monthlyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {changePercentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};