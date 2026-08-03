import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { Users, Bell, Clock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await userService.getDashboard();
      setData(res.data?.data ?? res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    await notificationService.markAsRead(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: (prev.notifications ?? []).filter((notif) => notif._id !== id),
        unreadCount: Math.max(0, (prev.unreadCount ?? 0) - 1)
      };
    });
    fetchDashboard();
  };

  if (loading) return <div className="p-8"><Loader size="lg" /></div>;
  if (!data) return <div className="p-8">Failed to load dashboard</div>;

  const { user, teams, pendingRequests, notifications, unreadCount } = data;
  const teamList = teams ?? [];
  const requestList = pendingRequests ?? [];
  const notificationList = notifications ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'there'}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your teams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamList.length}</p>
              <p className="text-sm text-gray-600">My Teams</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{requestList.length}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              <p className="text-sm text-gray-600">Unread Notifications</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Teams</h2>
            <Link to="/teams" className="text-primary-600 text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {teamList.length === 0 ? (
              <Card className="text-center py-8 text-gray-500">
                You haven't joined any teams yet.
                <Link to="/teams" className="block mt-2 text-primary-600 hover:underline">Browse teams</Link>
              </Card>
            ) : (
              teamList.map((membership) => (
                <Link key={membership._id} to={`/teams/${membership.team._id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {membership.team.logo ? (
                          <img src={membership.team.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{membership.team.name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{membership.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {notificationList.length === 0 ? (
              <Card className="text-center py-8 text-gray-500">No notifications yet</Card>
            ) : (
              notificationList.slice(0, 5).map((notif) => (
                <Card key={notif._id} className={notif.read ? 'opacity-75' : ''}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <button onClick={() => markRead(notif._id)} className="text-primary-600 text-xs hover:underline">
                        Mark read
                      </button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
