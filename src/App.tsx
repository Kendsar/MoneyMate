import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Investments } from './pages/Investments';
import { Goals } from './pages/Goals';
import { Budget } from './pages/Budget';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';

// Components
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddInvestmentModal } from './components/AddInvestmentModal';
import { AddGoalModal } from './components/AddGoalModal';
import { BalanceUpdateModal } from './components/BalanceUpdateModal';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showBalanceUpdate, setShowBalanceUpdate] = useState(false);
  
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Auth pages don't need the layout
  if (!user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-200 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="px-4 py-6 border-b dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Finance.io</h1>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1">
              <a
                href="/"
                className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === '/' && 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Dashboard
              </a>
              <a
                href="/transactions"
                className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === '/transactions' && 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Transactions
              </a>
              <a
                href="/investments"
                className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === '/investments' && 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Investments
              </a>
              <a
                href="/goals"
                className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === '/goals' && 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Goals
              </a>
              <a
                href="/budget"
                className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === '/budget' && 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Budget
              </a>
            </nav>
            
            <div className="p-4 border-t dark:border-gray-700">
              <a
                href="/settings"
                className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  location.pathname === '/settings' && 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Settings
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="md:ml-64">
          {/* Top Bar */}
          <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowBalanceUpdate(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Update Balance
                </button>
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add Transaction
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main>
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    darkMode={darkMode} 
                    onAddInvestment={() => setShowAddInvestment(true)}
                    onAddGoal={() => setShowAddGoal(true)}
                  />
                } 
              />
              <Route path="/transactions" element={<Transactions darkMode={darkMode} />} />
              <Route 
                path="/investments" 
                element={
                  <Investments 
                    darkMode={darkMode} 
                    onAddInvestment={() => setShowAddInvestment(true)} 
                  />
                } 
              />
              <Route 
                path="/goals" 
                element={
                  <Goals 
                    darkMode={darkMode} 
                    onAddGoal={() => setShowAddGoal(true)} 
                  />
                } 
              />
              <Route path="/budget" element={<Budget darkMode={darkMode} />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} />} />
            </Routes>
          </main>
        </div>

        {/* Modals */}
        <AddTransactionModal
          isOpen={showAddTransaction}
          onClose={() => setShowAddTransaction(false)}
          darkMode={darkMode}
        />
        
        <AddInvestmentModal
          isOpen={showAddInvestment}
          onClose={() => setShowAddInvestment(false)}
          darkMode={darkMode}
        />
        
        <AddGoalModal
          isOpen={showAddGoal}
          onClose={() => setShowAddGoal(false)}
          darkMode={darkMode}
        />
        
        <BalanceUpdateModal
          isOpen={showBalanceUpdate}
          onClose={() => setShowBalanceUpdate(false)}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

export default App;