import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <FileX className="mx-auto h-24 w-24 text-gray-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page not found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;