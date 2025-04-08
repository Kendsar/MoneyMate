import React from 'react';
import { Target, Plus } from 'lucide-react';
import { SavingsGoal as SavingsGoalType } from '../types/supabase';
import { Link } from 'react-router-dom';

interface SavingsGoalProps {
  darkMode: boolean;
  onAddGoal: () => void;
  goals?: SavingsGoalType[];
  loading?: boolean;
  currency?: string;
}

export const SavingsGoal: React.FC<SavingsGoalProps> = ({ 
  darkMode, 
  onAddGoal,
  goals = [],
  loading = false,
  currency = 'TND'
}) => {
  // If we have real goals, use the first one, otherwise use sample data
  const goal = goals.length > 0 
    ? {
        target: Number(goals[0].target_amount),
        current: Number(goals[0].current_amount || 0),
        percentage: Math.round((Number(goals[0].current_amount || 0) / Number(goals[0].target_amount)) * 100),
        name: goals[0].name,
      }
    : {
        target: 30000,
        current: 22500,
        percentage: 75,
        name: 'New Car',
      };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm h-full`}>
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
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No savings goals yet. Add your first goal!
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{goal.name}</p>
            <div className="flex items-end justify-between mt-1">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {currency} {goal.current.toLocaleString()}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                of {currency} {goal.target.toLocaleString()}
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
          
          {goals.length > 1 && (
            <div className="text-center mt-4">
              <Link
                to="/goals"
                className={`text-sm font-medium ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                View all goals ({goals.length}) →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};