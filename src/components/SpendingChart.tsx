import React from 'react';

interface Category {
  name: string;
  percentage: number;
  color: string;
}

interface SpendingChartProps {
  darkMode: boolean;
  categories?: Category[];
  loading?: boolean;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ 
  darkMode,
  categories = [],
  loading = false
}) => {
  // If we have real categories, use them, otherwise use sample data
  const displayCategories = categories.length > 0 
    ? categories
    : [
        { name: 'Housing', percentage: 35, color: 'bg-blue-500' },
        { name: 'Food', percentage: 20, color: 'bg-green-500' },
        { name: 'Transport', percentage: 15, color: 'bg-yellow-500' },
        { name: 'Entertainment', percentage: 10, color: 'bg-purple-500' },
        { name: 'Others', percentage: 20, color: 'bg-gray-500' },
      ];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm h-full`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Spending Breakdown
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : displayCategories.length === 0 ? (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No spending data available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {displayCategories.map((category) => (
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
      )}
    </div>
  );
};