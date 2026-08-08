import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import TopHeader from '../components/common/TopHeader';
import { notificationService } from '../services/notificationService';

export default function AppLayout({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      const data = res.data?.data ?? res.data;
      setUnreadCount(data?.unreadCount ?? 0);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Sidebar */}
      <Sidebar
        unreadNotifications={unreadCount}
        pendingRequests={pendingRequests}
      />

      {/* Main area offset by sidebar width */}
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {/* Top Header */}
        <TopHeader unreadCount={unreadCount} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
