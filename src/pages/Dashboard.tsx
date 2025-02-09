import React from 'react';
import { InvestmentCard } from '../components/InvestmentCard';
import { SpendingChart } from '../components/SpendingChart';
import { BudgetProgress } from '../components/BudgetProgress';
import { SavingsGoal } from '../components/SavingsGoal';
import { SmartTips } from '../components/SmartTips';

interface DashboardProps {
  darkMode: boolean;
  onAddInvestment: () => void;
  onAddGoal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  darkMode, 
  onAddInvestment, 
  onAddGoal 
}) => {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <InvestmentCard 
          darkMode={darkMode} 
          onAddInvestment={onAddInvestment} 
        />
      </div>
      <div>
        <SpendingChart darkMode={darkMode} />
      </div>
      <div>
        <BudgetProgress darkMode={darkMode} />
      </div>
      <div>
        <SavingsGoal 
          darkMode={darkMode} 
          onAddGoal={onAddGoal} 
        />
      </div>
      <div className="lg:col-span-2">
        <SmartTips darkMode={darkMode} />
      </div>
    </div>
  );
};