import React from 'react';
import { InvestmentCard } from '../components/InvestmentCard';

interface InvestmentsProps {
  darkMode: boolean;
  onAddInvestment: () => void;
}

export const Investments: React.FC<InvestmentsProps> = ({ darkMode, onAddInvestment }) => {
  return (
    <div className="p-4">
      <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Investment Portfolio
      </h2>
      <InvestmentCard darkMode={darkMode} onAddInvestment={onAddInvestment} />
    </div>
  );
};