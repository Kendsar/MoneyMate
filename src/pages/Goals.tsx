import React from 'react';
import { SavingsGoal } from '../components/SavingsGoal';

interface GoalsProps {
  darkMode: boolean;
  onAddGoal: () => void;
}

export const Goals: React.FC<GoalsProps> = ({ darkMode, onAddGoal }) => {
  return (
    <div className="p-4">
      <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Savings Goals
      </h2>
      <SavingsGoal darkMode={darkMode} onAddGoal={onAddGoal} />
    </div>
  );
};