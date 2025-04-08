import React, { useState } from 'react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { Target, Plus, Trash2, Edit } from 'lucide-react';
import { useFinancialSummary } from '../hooks/useFinancialSummary';

interface GoalsProps {
  darkMode: boolean;
  onAddGoal: () => void;
}

export const Goals: React.FC<GoalsProps> = ({ darkMode, onAddGoal }) => {
  const { goals, loading, deleteGoal, updateGoal } = useSavingsGoals();
  const { summary } = useFinancialSummary();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const { error } = await deleteGoal(id);
      if (error) {
        console.error('Error deleting goal:', error);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const handleContribution = async (goalId: string, currentAmount: number, targetAmount: number) => {
    try {
      setError(null);
      const amount = parseFloat(contributionAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      // Check if user has enough balance
      if (summary && Number(summary.current_balance) < amount) {
        setError('Insufficient balance for this contribution');
        return;
      }
      
      const newAmount = currentAmount + amount;
      if (newAmount > targetAmount) {
        setError('Contribution would exceed the target amount');
        return;
      }
      
      setIsUpdating(goalId);
      await updateGoal(goalId, { current_amount: newAmount });
      setContributionAmount('');
    } catch (err) {
      console.error('Error updating goal:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const calculateDaysLeft = (dateString: string | null) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    const today = new Date();
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Savings Goals
        </h2>
        <button
          onClick={onAddGoal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Add Goal
        </button>
      </div>
      
      {/* Balance Card */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm mb-6`}>
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available Balance</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {`${summary?.current_balance ? summary.current_balance < 0 ? '-' : '' : ''}TND ${Math.abs(Number(summary?.current_balance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Saved</p>
            <p className={`text-xl font-bold text-green-500`}>
              TND {goals.reduce((total, goal) => total + Number(goal.current_amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-sm text-center`}>
          <Target className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            No Savings Goals Yet
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Create your first savings goal to start tracking your progress
          </p>
          <button
            onClick={onAddGoal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const currentAmount = Number(goal.current_amount || 0 );
            const targetAmount = Number(goal.target_amount);
            const percentage = Math.min(100, Math.round((currentAmount / targetAmount) * 100));
            const daysLeft = calculateDaysLeft(goal.deadline);
            
            return (
              <div
                key={goal.id}
                className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl p-6 shadow-sm relative`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      {goal.name}
                    </h3>
                    {goal.description && (
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{goal.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    disabled={isDeleting === goal.id}
                    className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} ${
                      isDeleting === goal.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-end justify-between mb-1">
                    <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                      TND {currentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      of TND {targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex h-2 mb-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="flex flex-col justify-center overflow-hidden bg-green-500"
                      ></div>
                    </div>
                    <p className={`text-sm text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {percentage}% of goal reached
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Amount Needed</p>
                  <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    TND {(targetAmount - currentAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Target Date</p>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{formatDate(goal.deadline)}</p>
                  </div>
                  {daysLeft !== null && (
                    <div>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Days Left</p>
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{daysLeft}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className={`text-sm mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Add Contribution</p>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
                      } border focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={() => handleContribution(goal.id, currentAmount, targetAmount)}
                      disabled={isUpdating === goal.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating === goal.id ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            );
            
          })}
        </div>
      )}
    </div>
  );
};