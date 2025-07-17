import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600">@{user?.username}</p>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              About
            </h2>
            <p className="text-gray-600">
              {user?.bio || 'No bio available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;