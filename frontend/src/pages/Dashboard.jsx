import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Calendar, Search, Filter, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { padService } from '../services';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const [pads, setPads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owned');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPads();
  }, [activeTab]);

  const fetchPads = async () => {
    setLoading(true);
    try {
      const response = await padService.getPads(activeTab);
      setPads(response.pads);
    } catch (error) {
      toast.error('Failed to fetch pads');
    } finally {
      setLoading(false);
    }
  };

  const filteredPads = pads.filter(pad =>
    pad.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CreatePadModal = () => {
    const [title, setTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e) => {
      e.preventDefault();
      if (!title.trim()) return;

      setCreating(true);
      try {
        const response = await padService.createPad({
          title: title.trim(),
          is_public: isPublic
        });
        toast.success('Pad created successfully!');
        setShowCreateModal(false);
        fetchPads();
      } catch (error) {
        toast.error('Failed to create pad');
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Create New Pad</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter pad title"
                required
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Make this pad public</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary"
              >
                {creating ? 'Creating...' : 'Create Pad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user?.first_name}! Manage your collaborative documents here.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Pad</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'owned', label: 'My Pads', icon: FileText },
            { key: 'collaborated', label: 'Shared with Me', icon: Users },
            { key: 'public', label: 'Public Pads', icon: Globe }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search pads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Pads Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
        </div>
      ) : filteredPads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPads.map((pad) => (
            <Link
              key={pad.id}
              to={`/pad/${pad.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 truncate flex-1">
                  {pad.title}
                </h3>
                <div className="flex items-center space-x-1 ml-2">
                  {pad.is_public ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {activeTab === 'owned' ? (
                  <span>Created by you</span>
                ) : activeTab === 'collaborated' ? (
                  <span>Shared by {pad.owner_username}</span>
                ) : (
                  <span>Created by {pad.owner_username}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(pad.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {pad.permission && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {pad.permission}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No pads found' : 'No pads yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : activeTab === 'owned' 
                ? 'Create your first pad to get started' 
                : 'No pads in this category yet'
            }
          </p>
          {!searchTerm && activeTab === 'owned' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create your first pad
            </button>
          )}
        </div>
      )}

      {showCreateModal && <CreatePadModal />}
    </div>
  );
};

export default Dashboard;