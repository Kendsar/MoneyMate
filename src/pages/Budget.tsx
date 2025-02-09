import React from 'react';
import { BudgetProgress } from '../components/BudgetProgress';

interface BudgetProps {
  darkMode: boolean;
}

export const Budget: React.FC<BudgetProps> = ({ darkMode }) => {
  return (
    <div className="p-4">
      <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Budget Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BudgetProgress darkMode={darkMode} />
      </div>
    </div>
  );
};