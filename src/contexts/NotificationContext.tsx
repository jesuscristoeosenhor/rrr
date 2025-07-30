import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { NotificationContextType, Notification } from '@/types';
import { generateId } from '@/utils/helpers';

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      autoClose: notification.autoClose ?? true,
      read: false,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after 5 seconds if autoClose is true
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(String(newNotification.id));
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => String(notification.id) !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        String(notification.id) === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearNotifications,
    unreadCount,
  }), [notifications, addNotification, removeNotification, markAsRead, clearNotifications, unreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};