import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface SocketContextType {
  send: (data: any) => void;
  on: (type: string, callback: (data: any) => void) => void;
  off: (type: string) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Record<string, (data: any) => void>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:12345');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error', err);
    };

    socket.onmessage = (event) => {
      console.log(' Message from server:', event.data);

      try {
        const data = JSON.parse(event.data);
        const { type } = data;
        const handler = listenersRef.current[type];
        if (handler) {
          handler(data);
        } else {
          console.warn(`No handler for message type "${type}"`, data);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    return () => socket.close();
  }, []);

  const send = (data: any) => {
    const json = JSON.stringify(data);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(json);
    } else {
      console.warn('Tried to send message while socket is not open:', data);
    }
  };

  const on = (type: string, callback: (data: any) => void) => {
    listenersRef.current[type] = callback;
  };

  const off = (type: string) => {
    delete listenersRef.current[type];
  };

  return (
    <SocketContext.Provider value={{ send, on, off, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};