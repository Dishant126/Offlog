import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import {
  Users, Bell, Clock, ArrowRight, Crown,
  UserCheck, CheckCircle, X, TrendingUp, Plus
} from 'lucide-react';

const roleMeta = {
  TEAM_LEADER: { label: 'Team Leader', cls: 'badge-leader', icon: Crown },
  MENTOR:      { label: 'Mentor',      cls: 'badge-mentor',  icon: UserCheck },
  MEMBER:      { label: 'Member',      cls: 'badge-member',  icon: Users },
};

function StatCard({ icon: Icon, value, label, color, gradient }) {
  return (
    <div className="card group hover-lift">
      <div className="flex items-center gap-4">
        <div className={`stat-icon ${gradient}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await userService.getDashboard();
      setData(res.data?.data ?? res.data);
    } catch {
      toastError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setData(prev => prev ? {
        ...prev,
        notifications: (prev.notifications ?? []).filter(n => n._id !== id),
        unreadCount: Math.max(0, (prev.unreadCount ?? 0) - 1)
      } : prev);
    } catch { /* ignore */ }
  };

  if (loading) return <Loader size="lg" center />;
  if (!data)   return <div className="page-wrapper text-slate-500">Failed to load dashboard.</div>;

  const { teams = [], pendingRequests = [], notifications = [], unreadCount = 0 } = data;
  const displayUser = data.user ?? user;

  return (
    <div className="page-wrapper">
      {/* ── Welcome Banner ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {displayUser?.avatar ? (
            <img src={displayUser.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary-200" />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-gradient-card flex items-center justify-center ring-2 ring-primary-200">
              <Users className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="page-title">
              Welcome, <span className="text-gradient">{displayUser?.name?.split(' ')[0] ?? 'there'}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your teams</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/teams" className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Team
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users}    value={teams.length}         label="My Teams"            gradient="bg-indigo-50" color="text-primary-600" />
        <StatCard icon={Clock}    value={pendingRequests.length} label="Pending Requests"  gradient="bg-amber-50"  color="text-amber-600" />
        <StatCard icon={Bell}     value={unreadCount}           label="Unread Notifications" gradient="bg-red-50"  color="text-red-500" />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* My Teams (wider) */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Teams</h2>
            <Link to="/teams" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {teams.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">You haven't joined any teams yet.</p>
              <Link to="/teams" className="btn-primary btn-sm mt-4 inline-flex">Browse Teams</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.slice(0, 6).map((m) => {
                const role = roleMeta[m.role] ?? roleMeta.MEMBER;
                const RoleIcon = role.icon;
                return (
                  <Link key={m._id} to={`/teams/${m.team._id}`}>
                    <div className="card card-hover flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {m.team.logo ? (
                          <img src={m.team.logo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{m.team.name}</p>
                          <span className={`${role.cls} text-[11px] mt-0.5`}>
                            <RoleIcon className="h-3 w-3" />
                            {role.label}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications (narrower) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Notifications</h2>
            {unreadCount > 0 && (
              <span className="badge badge-leader">{unreadCount} new</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="card text-center py-10">
              <CheckCircle className="h-10 w-10 mx-auto text-emerald-300 mb-3" />
              <p className="text-slate-500 text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 7).map((n) => (
                <div key={n._id} className="card p-4 flex items-start gap-3 group">
                  <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-xs">{n.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissNotification(n._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex-shrink-0"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pending join requests */}
      {pendingRequests.length > 0 && (
        <div className="mt-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Join Requests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRequests.map((req) => (
              <div key={req._id} className="card p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{req.team?.name ?? 'Unknown Team'}</p>
                  <p className="text-xs text-amber-600">Awaiting approval</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
