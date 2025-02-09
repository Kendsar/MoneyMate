import React, { useState } from 'react';
import { Sun, Moon, Bell, Settings, Home, Receipt, PieChart, TrendingUp, Target, Menu } from 'lucide-react';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddInvestmentModal } from './components/AddInvestmentModal';
import { AddGoalModal } from './components/AddGoalModal';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';
import { Investments } from './pages/Investments';
import { Goals } from './pages/Goals';
import { Settings as SettingsPage } from './pages/Settings';

const userPreferences = {
  darkMode: false,
  user: {
    name: 'Skander',
    totalBalance: 'TND 29,563.00',
    balanceChange: '+2.3%',
    monthlyIncome: 'TND 2,730.00',
    incomeChange: '+2.1%',
    monthlyExpenses: 'TND 1,275.00',
    expenseChange: '-1.2%',
  },
};

function App() {
  const [darkMode, setDarkMode] = useState(userPreferences.darkMode);
  const { user } = userPreferences;
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const financialStats = [
    { label: 'Total Balance', value: user.totalBalance, change: user.balanceChange },
    { label: 'Monthly Income', value: user.monthlyIncome, change: user.incomeChange },
    { label: 'Monthly Expenses', value: user.monthlyExpenses, change: user.expenseChange },
  ];

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            darkMode={darkMode}
            onAddInvestment={() => setShowInvestmentModal(true)}
            onAddGoal={() => setShowGoalModal(true)}
          />
        );
      case 'transactions':
        return <Transactions darkMode={darkMode} />;
      case 'budget':
        return <Budget darkMode={darkMode} />;
      case 'investments':
        return (
          <Investments 
            darkMode={darkMode}
            onAddInvestment={() => setShowInvestmentModal(true)}
          />
        );
      case 'goals':
        return (
          <Goals 
            darkMode={darkMode}
            onAddGoal={() => setShowGoalModal(true)}
          />
        );
      case 'settings':
        return <SettingsPage darkMode={darkMode} />;
      default:
        return <Dashboard darkMode={darkMode} onAddInvestment={() => setShowInvestmentModal(true)} onAddGoal={() => setShowGoalModal(true)} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} lg:w-64 lg:fixed lg:h-full p-4 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>MoneyMate</h1>
            <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              {darkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          
          <div className="space-y-2">
            {[
              { icon: Home, label: 'Dashboard', id: 'dashboard' },
              { icon: Receipt, label: 'Transactions', id: 'transactions' },
              { icon: PieChart, label: 'Budget', id: 'budget' },
              { icon: TrendingUp, label: 'Investments', id: 'investments' },
              { icon: Target, label: 'Goals', id: 'goals' },
              { icon: Settings, label: 'Settings', id: 'settings' },
            ].map(({ icon: Icon, label, id }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === id 
                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600')
                    : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Header */}
          <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Hello, {user.name}! 👋
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Welcome back to your financial dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                <button 
                  onClick={() => setShowTransactionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {financialStats.map(({ label, value, change }) => (
                <div
                  key={label}
                  className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}
                >
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                    <span className={`text-sm ${
                      change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }`}>{change}</span>
                  </div>
                </div>
              ))}
            </div>
          </header>

          {/* Page Content */}
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        darkMode={darkMode}
      />
      <AddInvestmentModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        darkMode={darkMode}
      />
      <AddGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;