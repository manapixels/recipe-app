'use client';

import React, { useState, ReactNode } from 'react';

interface ProfileTabsProps {
  createdRecipesContent: ReactNode;
  // favoritedRecipesContent will be added later
}

type TabKey = 'created' | 'favorites';

const ProfileTabs: React.FC<ProfileTabsProps> = ({ createdRecipesContent }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('created');

  const renderContent = () => {
    switch (activeTab) {
      case 'created':
        return createdRecipesContent;
      case 'favorites':
        return <p className="text-gray-500 py-4">Favorited recipes will appear here soon!</p>; // Placeholder
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('created')}
            className={`
              ${
                activeTab === 'created'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            `}
          >
            Created Recipes
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`
              ${
                activeTab === 'favorites'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            `}
            // disabled // Will enable when favorites are implemented
          >
            Favorited Recipes (Coming Soon)
          </button>
        </nav>
      </div>
      <div className="py-6">{renderContent()}</div>
    </div>
  );
};

export default ProfileTabs;
