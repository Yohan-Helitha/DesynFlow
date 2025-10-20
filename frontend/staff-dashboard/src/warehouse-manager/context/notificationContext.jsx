import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/warehouse/notifications?recipient=warehouse&limit=200');
      if (!res.ok) throw new Error('Failed to fetch');
      const payload = await res.json();
      let items = [];
      if (Array.isArray(payload)) items = payload;
      else if (Array.isArray(payload.data)) items = payload.data;
      else if (Array.isArray(payload.notifications)) items = payload.notifications;
      else items = [];

      setNotifications(items.map((it) => ({ ...it, id: it._id || it.id || (it._id && it._id.toString()) }))); 
    } catch (err) {
      console.error('fetchNotifications error', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/warehouse/notifications/unread-count?recipient=warehouse');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const count = typeof data.data === 'number' ? data.data : (data.count || data.unreadCount || 0);
      setUnreadCount(count);
    } catch (err) {
      console.error('fetchUnreadCount error', err);
    }
  };

  const refreshNotifications = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  // Mark a single notification as read (server) and persist read id locally for quick UI
  const markNotificationAsRead = async (id) => {
    try {
      // local storage optimistic update for client-side read tracking
      const stored = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const base = id && id.toString().split('_')[0];
      if (!stored.includes(id)) stored.push(id);
      if (base && !stored.includes(base)) stored.push(base);
      localStorage.setItem('readNotifications', JSON.stringify(stored));

      // call server
      const res = await fetch(`/api/warehouse/notifications/${id}/read`, { method: 'PUT' });
      if (!res.ok) {
        // silent: we'll still keep client read state
        console.warn('markNotificationAsRead: server responded with', res.status);
      }
      // refresh unread count and list
      await fetchUnreadCount();
      await fetchNotifications();
    } catch (err) {
      console.error('markNotificationAsRead error', err);
    }
  };

  const markAsRead = async () => {
    try {
      // mark all on server
      const res = await fetch('/api/warehouse/notifications/mark-all-read?recipient=warehouse', { method: 'PUT' });
      if (!res.ok) console.warn('markAsRead server status', res.status);
      // clear local read store by adding all current base ids
      try {
        const ids = notifications.map(n => n.id || n._id || n._id?.toString()).filter(Boolean);
        const baseIds = ids.map(id => id.toString().split('_')[0]);
        const stored = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const merged = Array.from(new Set([...stored, ...ids, ...baseIds]));
        localStorage.setItem('readNotifications', JSON.stringify(merged));
      } catch (e) {}
      await refreshNotifications();
    } catch (err) {
      console.error('markAsRead error', err);
    }
  };

  const removeNotification = async (id) => {
    try {
      const res = await fetch(`/api/warehouse/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      // remove locally
      setNotifications(prev => prev.filter(n => (n.id || n._id || n._id?.toString()) !== id));
      await fetchUnreadCount();
      return true;
    } catch (err) {
      console.error('removeNotification error', err);
      return false;
    }
  };

  useEffect(() => {
    refreshNotifications();

    // polling
    pollingRef.current = setInterval(() => {
      refreshNotifications();
    }, 5000);

    const onFocus = () => refreshNotifications();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(pollingRef.current);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refreshNotifications, markNotificationAsRead, markAsRead, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};

// Provide backwards-compatible named export
export const NotificationsProvider = NotificationProvider;

export default NotificationContext;
