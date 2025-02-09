import React from 'react';
import { Target, Plus } from 'lucide-react';

interface SavingsGoalProps {
  darkMode: boolean;
  onAddGoal: () => void;
}

export const SavingsGoal: React.FC<SavingsGoalProps> = ({ darkMode, onAddGoal }) => {
  const goal = {
    target: 30000,
    current: 22500,
    percentage: 75,
    name: 'New Car',
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Savings Goal
        </h3>
        <div className="flex space-x-2">
          <Target className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <button
            onClick={onAddGoal}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mb-4">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{goal.name}</p>
        <div className="flex items-end justify-between mt-1">
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            TND {goal.current.toLocaleString()}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            of TND {goal.target.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="relative pt-1">
        <div className="flex h-2 mb-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            style={{ width: `${goal.percentage}%` }}
            className="flex flex-col justify-center overflow-hidden bg-green-500"
          ></div>
        </div>
        <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {goal.percentage}% of goal reached
        </p>
      </div>
    </div>
  );
};