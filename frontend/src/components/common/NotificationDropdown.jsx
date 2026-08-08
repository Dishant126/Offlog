import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../services/notificationService';
import { Bell, CheckCheck, Trash2, X, UserPlus, CheckCircle, Calendar, Users, Flag, Shield, Info } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const getNotificationIcon = (type, message = '') => {
  const msg = (message || type || '').toLowerCase();
  if (msg.includes('join') || type === 'JOIN_REQUEST' || type === 'JOIN_ACCEPTED') return { icon: UserPlus, color: 'bg-blue-50 text-blue-600' };
  if (msg.includes('role') || type === 'ROLE_CHANGED') return { icon: Shield, color: 'bg-purple-50 text-purple-600' };
  if (msg.includes('completed') || msg.includes('accepted')) return { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' };
  if (msg.includes('schedule')) return { icon: Calendar, color: 'bg-amber-50 text-amber-600' };
  if (msg.includes('team') || type === 'TEAM_JOINED') return { icon: Users, color: 'bg-cyan-50 text-cyan-600' };
  if (msg.includes('milestone')) return { icon: Flag, color: 'bg-rose-50 text-rose-600' };
  return { icon: Info, color: 'bg-slate-100 text-slate-600' };
};

export default function NotificationDropdown({ initialUnreadCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      const data = res.data?.data ?? res.data;
      if (Array.isArray(data?.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount ?? data.notifications.filter(n => !n.read).length);
      }
    } catch { /* ignore silently */ }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(prev => !prev);
  };

  const handleMarkAsRead = async (id, isUnread) => {
    if (!isUnread) return;
    try {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationService.markAsRead(id);
    } catch {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      await notificationService.markAllAsRead();
      success('All notifications marked as read');
    } catch {
      toastError('Failed to mark all as read');
      fetchNotifications();
    }
  };

  const handleDismiss = async (e, id, isUnread) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
      await notificationService.delete(id);
      success('Notification removed');
    } catch {
      error('Failed to remove notification');
      fetchNotifications();
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      setNotifications([]);
      setUnreadCount(0);
      await notificationService.clearAll();
      success('All notifications cleared');
    } catch {
      error('Failed to clear notifications');
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-50 text-primary-600">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 text-xs text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium text-slate-600">No notifications</p>
                <p className="text-xs text-slate-400 mt-0.5">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon: Icon, color } = getNotificationIcon(n.type, n.message || n.title);
                return (
                  <div
                    key={n._id}
                    onClick={() => handleMarkAsRead(n._id, !n.read)}
                    className={`group flex items-start gap-3 p-3 transition-colors cursor-pointer relative ${
                      !n.read ? 'bg-primary-50/40 hover:bg-primary-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                        )}
                        <p className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title || 'Notification'}
                        </p>
                      </div>
                      {n.message && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Close / Dismiss button */}
                    <button
                      onClick={(e) => handleDismiss(e, n._id, !n.read)}
                      className="absolute top-3 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all opacity-70 group-hover:opacity-100"
                      title="Close notification"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
