import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, Users, ArrowLeft, Settings, Share2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { padService } from '../services';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

const PadEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinPad, leavePad, emitContentChange } = useSocket();
  
  const [pad, setPad] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const quillRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  useEffect(() => {
    fetchPad();
  }, [id]);

  useEffect(() => {
    if (socket && pad) {
      joinPad(id);

      socket.on('pad-content-update', (data) => {
        if (data.userId !== user.id) {
          setContent(data.content);
        }
      });

      return () => {
        leavePad(id);
        socket.off('pad-content-update');
      };
    }
  }, [socket, pad, id, user.id]);

  const fetchPad = async () => {
    setLoading(true);
    try {
      const response = await padService.getPad(id);
      setPad(response.pad);
      setCollaborators(response.collaborators);
      setContent(response.pad.content);
      setTitle(response.pad.title);
    } catch (error) {
      toast.error('Failed to load pad');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (value) => {
    setContent(value);
    
    // Emit real-time changes
    if (socket) {
      emitContentChange(id, value);
    }

    // Auto-save after 2 seconds of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePad(value, title);
    }, 2000);
  };

  const savePad = async (newContent = content, newTitle = title) => {
    if (!pad) return;

    setSaving(true);
    try {
      await padService.updatePad(id, {
        content: newContent,
        title: newTitle
      });
    } catch (error) {
      toast.error('Failed to save pad');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePad(content, newTitle);
    }, 1000);
  };

  const handleSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    savePad();
    toast.success('Pad saved!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pad not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditing(false);
                    }
                  }}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
                  onClick={() => setIsEditing(true)}
                >
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {saving && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="spinner w-4 h-4"></div>
                  <span>Saving...</span>
                </div>
              )}
              
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>

              {collaborators.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 3).map((collaborator, index) => (
                      <div
                        key={collaborator.id}
                        className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={`${collaborator.first_name} ${collaborator.last_name}`}
                      >
                        {collaborator.first_name[0]}{collaborator.last_name[0]}
                      </div>
                    ))}
                    {collaborators.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                        +{collaborators.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Clock className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            style={{ height: 'calc(100vh - 300px)' }}
            placeholder="Start writing your content here..."
          />
        </div>
      </div>
    </div>
  );
};

export default PadEditor;