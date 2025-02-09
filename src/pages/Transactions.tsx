import React from 'react';

interface TransactionsProps {
  darkMode: boolean;
}

export const Transactions: React.FC<TransactionsProps> = ({ darkMode }) => {
  return (
    <div className="p-4">
      <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Transactions
      </h2>
      {/* Transaction list will be implemented here */}
    </div>
  );
};