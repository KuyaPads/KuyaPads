import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinPad = (padId) => {
    if (socket) {
      socket.emit('join-pad', padId);
    }
  };

  const leavePad = (padId) => {
    if (socket) {
      socket.emit('leave-pad', padId);
    }
  };

  const emitContentChange = (padId, content) => {
    if (socket && user) {
      socket.emit('pad-content-change', {
        padId,
        content,
        userId: user.id
      });
    }
  };

  const emitCursorPosition = (padId, position) => {
    if (socket && user) {
      socket.emit('cursor-position', {
        padId,
        position,
        userId: user.id,
        username: user.username
      });
    }
  };

  const value = {
    socket,
    connected,
    joinPad,
    leavePad,
    emitContentChange,
    emitCursorPosition
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};