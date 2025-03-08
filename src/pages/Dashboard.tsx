import React, { useEffect, useState } from 'react';
import { InvestmentCard } from '../components/InvestmentCard';
import { SpendingChart } from '../components/SpendingChart';
import { BudgetProgress } from '../components/BudgetProgress';
import { SavingsGoal } from '../components/SavingsGoal';
import { SmartTips } from '../components/SmartTips';
import { useTransactions } from '../hooks/useTransactions';
import { useInvestments } from '../hooks/useInvestments';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { useFinancialSummary } from '../hooks/useFinancialSummary';
import { useAuth } from '../context/AuthContext';

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
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { goals, loading: goalsLoading } = useSavingsGoals();
  const { summary, loading: summaryLoading } = useFinancialSummary();
  const { profile } = useAuth();
  
  const [spendingBreakdown, setSpendingBreakdown] = useState<{name: string; percentage: number; color: string}[]>([]);
  
  useEffect(() => {
    if (transactionsLoading) return;
    
    // Process transactions for spending breakdown
    const categorySpending: Record<string, number> = {};
    let totalSpending = 0;
    
    // Get current month transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      
      // Only include current month expenses
      if (transaction.type === 'expense' && 
          transactionMonth === currentMonth && 
          transactionYear === currentYear) {
        
        // Track category spending for pie chart
        const category = transaction.category;
        if (!categorySpending[category]) {
          categorySpending[category] = 0;
        }
        categorySpending[category] += Number(transaction.amount);
        totalSpending += Number(transaction.amount);
      }
    });
    
    // Prepare spending breakdown for pie chart
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'];
    
    const breakdown = Object.entries(categorySpending)
      .map(([name, amount], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    setSpendingBreakdown(breakdown);
  }, [transactions, transactionsLoading]);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <InvestmentCard 
          darkMode={darkMode} 
          onAddInvestment={onAddInvestment}
          investments={investments}
          loading={investmentsLoading}
          currency={profile?.currency || 'TND'}
        />
      </div>
      <div>
        <SpendingChart 
          darkMode={darkMode} 
          categories={spendingBreakdown}
          loading={transactionsLoading}
        />
      </div>
      <div>
        <BudgetProgress 
          darkMode={darkMode}
          monthlyBudget={Number(summary?.monthly_income || 5000)}
          spent={Number(summary?.total_expenses || 0)}
          currency={profile?.currency || 'TND'}
        />
      </div>
      <div>
        <SavingsGoal 
          darkMode={darkMode} 
          onAddGoal={onAddGoal}
          goals={goals}
          loading={goalsLoading}
          currency={profile?.currency || 'TND'}
        />
      </div>
      <div className="lg:col-span-2">
        <SmartTips darkMode={darkMode} />
      </div>
    </div>
  );
};