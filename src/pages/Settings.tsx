import React from 'react';

interface SettingsProps {
  darkMode: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ darkMode }) => {
  return (
    <div className="p-4">
      <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Settings
      </h2>
      {/* Settings form will be implemented here */}
    </div>
  );
};