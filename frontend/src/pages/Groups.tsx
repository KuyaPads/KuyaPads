import React from 'react';

const Groups: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Groups
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            My Groups
          </h2>
          <div className="text-gray-500 text-center py-8">
            No groups joined yet. Discover and join groups that interest you!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;