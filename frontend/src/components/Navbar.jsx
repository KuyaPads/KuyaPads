import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img 
                src="/kpc-32.svg" 
                alt="KuyaPads" 
                className="h-8 w-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold text-primary-600">KuyaPads</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.first_name} {user.last_name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;