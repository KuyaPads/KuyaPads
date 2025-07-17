import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Chat
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Conversations
          </h2>
          <div className="text-gray-500 text-center py-8">
            No conversations yet. Start chatting with your friends!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;