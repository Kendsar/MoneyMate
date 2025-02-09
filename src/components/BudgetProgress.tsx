import React from 'react';

interface BudgetProgressProps {
  darkMode: boolean;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ darkMode }) => {
  const budget = {
    total: 5000,
    spent: 3275,
    remaining: 1725,
    percentage: 65.5,
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Monthly Budget
      </h3>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
              darkMode ? 'text-blue-200 bg-blue-800' : 'text-blue-600 bg-blue-200'
            }`}>
              {budget.percentage}% Used
            </span>
          </div>
        </div>
        <div className="flex h-2 mb-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            style={{ width: `${budget.percentage}%` }}
            className="flex flex-col justify-center overflow-hidden bg-blue-500"
          ></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Spent</p>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              ${budget.spent.toLocaleString()}
            </p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</p>
            <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              ${budget.remaining.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};