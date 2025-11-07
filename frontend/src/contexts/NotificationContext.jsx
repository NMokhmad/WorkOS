// NotificationContext - Contexte pour gérer les notifications
import React, { createContext, useContext, useState, useEffect } from 'react';
import { tasksAPI, eventsAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Vérifier les notifications toutes les 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const newNotifications = [];
      const now = new Date();

      // Charger les tâches et événements
      const [tasksRes, eventsRes] = await Promise.all([
        tasksAPI.getAll(),
        eventsAPI.getAll()
      ]);

      const tasks = tasksRes.tasks || [];
      const events = eventsRes.events || [];

      // Notifications pour tâches avec échéance proche (24h)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tasks.forEach(task => {
        if (task.dueDate && task.status !== 'done') {
          const dueDate = new Date(task.dueDate);
          if (dueDate >= now && dueDate <= tomorrow) {
            const hoursLeft = Math.floor((dueDate - now) / (1000 * 60 * 60));
            newNotifications.push({
              id: `task-${task.id}`,
              type: 'deadline',
              title: 'Échéance proche',
              message: `"${task.title}" est due dans ${hoursLeft}h`,
              timestamp: new Date(),
              priority: task.priority || 'medium',
              link: '/tasks',
              read: false
            });
          }
        }
      });

      // Notifications pour événements à venir (2h)
      const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      events.forEach(event => {
        const eventDate = new Date(event.startDate);
        if (eventDate >= now && eventDate <= in2Hours) {
          const minutesLeft = Math.floor((eventDate - now) / (1000 * 60));
          newNotifications.push({
            id: `event-${event.id}`,
            type: 'event',
            title: 'Événement imminent',
            message: `"${event.title}" commence dans ${minutesLeft}min`,
            timestamp: new Date(),
            priority: 'high',
            link: '/calendar',
            read: false
          });
        }
      });

      // Notifications pour tâches non commencées depuis longtemps
      tasks.forEach(task => {
        if (task.status === 'todo') {
          const createdAt = new Date(task.createdAt);
          const daysOld = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
          if (daysOld >= 3) {
            newNotifications.push({
              id: `stale-${task.id}`,
              type: 'reminder',
              title: 'Tâche en attente',
              message: `"${task.title}" n'a pas été commencée depuis ${daysOld} jours`,
              timestamp: new Date(),
              priority: 'low',
              link: '/tasks',
              read: false
            });
          }
        }
      });

      // Fusionner avec les notifications existantes (garder celles qui sont lues)
      const existingRead = notifications.filter(n => n.read);
      const allNotifications = [...newNotifications, ...existingRead]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20); // Garder max 20 notifications

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);

    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    refreshNotifications: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
