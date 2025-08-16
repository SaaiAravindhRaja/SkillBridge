import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

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
      const newSocket = io('http://localhost:5001');
      
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

  const joinSession = (sessionId) => {
    if (socket) {
      socket.emit('join-session', sessionId);
    }
  };

  const sendMessage = (sessionId, message) => {
    if (socket && user) {
      socket.emit('send-message', {
        sessionId,
        message,
        senderId: user.id,
        senderName: user.name
      });
    }
  };

  const updateSessionStatus = (sessionId, status) => {
    if (socket) {
      socket.emit('session-status-update', { sessionId, status });
    }
  };

  const startTyping = (sessionId) => {
    if (socket && user) {
      socket.emit('typing', { sessionId, userName: user.name });
    }
  };

  const stopTyping = (sessionId) => {
    if (socket) {
      socket.emit('stop-typing', { sessionId });
    }
  };

  const value = {
    socket,
    connected,
    joinSession,
    sendMessage,
    updateSessionStatus,
    startTyping,
    stopTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};