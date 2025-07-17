import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Welcome to KuyaPads, {user?.firstName}!
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create a Post
          </h2>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            placeholder="What's on your mind?"
          />
          <div className="mt-4 flex justify-end">
            <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
              Post
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Posts
          </h2>
          <div className="text-gray-500 text-center py-8">
            No posts yet. Be the first to share something!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;