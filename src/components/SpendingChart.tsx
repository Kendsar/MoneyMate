import React from 'react';

interface SpendingChartProps {
  darkMode: boolean;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ darkMode }) => {
  const categories = [
    { name: 'Housing', percentage: 35, color: 'bg-blue-500' },
    { name: 'Food', percentage: 20, color: 'bg-green-500' },
    { name: 'Transport', percentage: 15, color: 'bg-yellow-500' },
    { name: 'Entertainment', percentage: 10, color: 'bg-purple-500' },
    { name: 'Others', percentage: 20, color: 'bg-gray-500' },
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Spending Breakdown
      </h3>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {category.name}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {category.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className={`${category.color} h-2.5 rounded-full`}
                style={{ width: `${category.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};