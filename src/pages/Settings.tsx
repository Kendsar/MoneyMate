import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Save, User } from 'lucide-react';

interface SettingsProps {
  darkMode: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ darkMode }) => {
  const { signOut, user, profile, updateProfile } = useAuth();
  const [currency, setCurrency] = useState(profile?.currency || 'TND');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setCurrency(profile.currency || 'TND');
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      setUpdateSuccess(false);
      setUpdateError(null);
      
      const { error } = await updateProfile({
        currency,
        full_name: fullName || null,
      });
      
      if (error) {
        setUpdateError(error.message);
        return;
      }
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Settings
      </h2>
      
      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
          Profile updated successfully!
        </div>
      )}
      
      {updateError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {updateError}
        </div>
      )}
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Account Information
          </h3>
          <User className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        
        <div className="space-y-4">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {user?.email}
            </p>
          </div>
          
          <div>
            <label 
              htmlFor="fullName" 
              className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`mt-1 w-full px-3 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              } border focus:ring-2 focus:ring-blue-500`}
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label 
              htmlFor="currency" 
              className={`block text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Default Currency
            </label>
            <div className="mt-1">
              <select
                id="currency"
                className={`w-full px-3 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                } border focus:ring-2 focus:ring-blue-500`}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="TND">Tunisian Dinar (TND)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleProfileUpdate}
              disabled={isUpdating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Dark Mode
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Toggle between light and dark theme
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={darkMode} className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Notifications
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Receive alerts for important updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm mb-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Account Actions
        </h3>
        
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};