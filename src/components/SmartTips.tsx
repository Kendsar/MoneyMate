import React from 'react';
import { LightbulbIcon } from 'lucide-react';

interface SmartTipsProps {
  darkMode: boolean;
}

export const SmartTips: React.FC<SmartTipsProps> = ({ darkMode }) => {
  const tips = [
    {
      title: 'Reduce Subscription Costs',
      description: 'You could save $45/month by optimizing your streaming subscriptions.',
      action: 'Review Subscriptions',
    },
    {
      title: 'Investment Opportunity',
      description: 'Based on your profile, consider diversifying into index funds.',
      action: 'Learn More',
    },
    {
      title: 'Savings Challenge',
      description: 'Join the 52-week savings challenge to boost your emergency fund.',
      action: 'Start Challenge',
    },
  ];

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Smart Money Tips
        </h3>
        <LightbulbIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      <div className="grid gap-4">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors cursor-pointer`}
          >
            <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {tip.title}
            </h4>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {tip.description}
            </p>
            <button
              className={`text-sm font-medium ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {tip.action} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};