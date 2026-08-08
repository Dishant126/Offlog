import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { teamService } from '../services/teamService';
import { notificationService } from '../services/notificationService';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import MountainIllustration from '../components/common/MountainIllustration';
import Modal from '../components/common/Modal';
import {
  Users, Bell, Clock, ArrowRight, Crown, UserCheck,
  CheckCircle, X, Plus, ChevronDown, Hash,
  UserPlus, Flag, Calendar, Award, Trash2, CheckCheck
} from 'lucide-react';

/* ── Helpers ── */
const roleMeta = {
  TEAM_LEADER: { label: 'Leader', cls: 'bg-blue-50 text-blue-700', icon: Crown },
  MENTOR:      { label: 'Mentor', cls: 'bg-emerald-50 text-emerald-700', icon: UserCheck },
  MEMBER:      { label: 'Member', cls: 'bg-slate-100 text-slate-600', icon: Users },
};

const teamColors = [
  { bg: 'bg-blue-100',    text: 'text-blue-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-amber-100',   text: 'text-amber-600' },
  { bg: 'bg-purple-100',  text: 'text-purple-600' },
  { bg: 'bg-rose-100',    text: 'text-rose-600' },
  { bg: 'bg-cyan-100',    text: 'text-cyan-600' },
];

const teamIcons = ['DS', '</>', '📣', '🛡️', '🔬', '📊', '🎨', '⚡'];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, value, label, sublabel, iconBg, iconColor, delay = 0 }) {
  return (
    <div className={`card animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-4">
        <div className={`stat-icon ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          {sublabel && (
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                iconColor.includes('blue') ? 'bg-blue-400' :
                iconColor.includes('amber') ? 'bg-amber-400' :
                iconColor.includes('emerald') ? 'bg-emerald-400' : 'bg-purple-400'
              }`} />
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Team Row ── */
function TeamRow({ membership, index }) {
  const { team, role } = membership;
  const roleInfo = roleMeta[role] || roleMeta.MEMBER;
  const colorSet = teamColors[index % teamColors.length];
  const iconLabel = teamIcons[index % teamIcons.length];

  // Extract actual member user objects cleanly
  const memberUsers = (team.members || [])
    .map(m => m.user || m)
    .filter(u => u && (u.name || u.email));

  const totalMembers = memberUsers.length;
  const visibleMembers = memberUsers.slice(0, 3);
  const remainingMembers = totalMembers > 3 ? totalMembers - 3 : 0;

  return (
    <Link to={`/teams/${team._id}`} className="block group">
      <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-slate-50 transition-colors duration-150">
        {/* Team icon */}
        <div className={`w-10 h-10 rounded-xl ${colorSet.bg} flex items-center justify-center flex-shrink-0`}>
          {team.logo ? (
            <img src={team.logo} alt="" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <span className={`text-sm font-bold ${colorSet.text}`}>{iconLabel}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 text-sm truncate">{team.name}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${roleInfo.cls}`}>
              {roleInfo.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{team.description || 'No description'}</p>
        </div>

        {/* Avatar stack with real member initials & accurate count */}
        {totalMembers > 0 && (
          <div className="flex items-center gap-1 flex-shrink-0 hidden sm:flex">
            <div className="flex -space-x-2">
              {visibleMembers.map((u, i) => (
                <div
                  key={u._id || i}
                  className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden"
                  title={u.name || u.email}
                >
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-600">
                      {getInitials(u.name || u.email)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {remainingMembers > 0 && (
              <span className="text-xs text-slate-400 font-medium ml-1">
                +{remainingMembers}
              </span>
            )}
          </div>
        )}

        {/* Arrow */}
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

/* ── Activity Item ── */
function ActivityItem({ notification, index, onDismiss }) {
  const iconMap = {
    'joined': { icon: UserPlus, color: 'bg-blue-50 text-blue-500' },
    'completed': { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500' },
    'scheduled': { icon: Calendar, color: 'bg-amber-50 text-amber-500' },
    'member': { icon: Users, color: 'bg-purple-50 text-purple-500' },
    'milestone': { icon: Flag, color: 'bg-rose-50 text-rose-500' },
    'default': { icon: Bell, color: 'bg-slate-100 text-slate-500' },
  };

  const msg = (notification.message || notification.title || '').toLowerCase();
  let iconInfo = iconMap.default;
  for (const [key, val] of Object.entries(iconMap)) {
    if (msg.includes(key)) { iconInfo = val; break; }
  }
  const IconComp = iconInfo.icon;

  return (
    <div className="group flex items-start gap-3 py-3 px-2 rounded-xl animate-fade-in relative hover:bg-slate-50/80 transition-colors" style={{ animationDelay: `${index * 80}ms` }}>
      <div className={`w-8 h-8 rounded-lg ${iconInfo.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <IconComp className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm text-slate-700">
          {notification.title && (
            <span className="font-semibold">{notification.title} </span>
          )}
          {notification.message && (
            <span className="text-slate-500">{notification.message}</span>
          )}
          {!notification.title && !notification.message && (
            <span className="text-slate-500">Activity notification</span>
          )}
        </p>
        <span className="text-[11px] text-slate-400 block mt-0.5">
          {timeAgo(notification.createdAt)}
        </span>
      </div>

      <button
        onClick={() => onDismiss(notification._id, !notification.read)}
        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-70 group-hover:opacity-100 flex-shrink-0"
        title="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}


/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => { fetchDashboard(); }, []);

  // Handle hash scrolling (e.g. #pending-requests or #recent-activity)
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [loading, location.hash]);

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

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await teamService.join(joinCode.trim().toUpperCase());
      const result = res.data?.data ?? res.data;
      success(result?.joined ? 'Joined team successfully!' : 'Join request sent!');
      setJoinCode('');
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to join team');
    } finally {
      setJoining(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setCreating(true);
    try {
      await teamService.create({
        name: formData.get('name'),
        description: formData.get('description'),
        visibility: formData.get('visibility'),
      });
      success('Team created successfully!');
      setShowCreateModal(false);
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleDismissNotification = async (id, isUnread) => {
    try {
      setData(prev => ({
        ...prev,
        notifications: (prev.notifications || []).filter(n => n._id !== id),
        unreadCount: isUnread ? Math.max(0, (prev.unreadCount || 1) - 1) : prev.unreadCount
      }));
      await notificationService.delete(id);
      success('Notification removed');
    } catch {
      toastError('Failed to remove notification');
      fetchDashboard();
    }
  };

  const handleClearAllNotifications = async () => {
    if (!data?.notifications || data.notifications.length === 0) return;
    try {
      setData(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0
      }));
      await notificationService.clearAll();
      success('All notifications cleared');
    } catch {
      toastError('Failed to clear notifications');
      fetchDashboard();
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!data?.notifications || data.notifications.length === 0) return;
    try {
      setData(prev => ({
        ...prev,
        notifications: [],
        unreadCount: 0
      }));
      await notificationService.markAllAsRead();
      await notificationService.clearAll();
      success('All notifications marked as read');
    } catch {
      toastError('Failed to mark notifications as read');
      fetchDashboard();
    }
  };

  const handleCancelJoinRequest = async (requestId) => {
    try {
      setData(prev => ({
        ...prev,
        pendingRequests: (prev.pendingRequests || []).filter(r => r._id !== requestId)
      }));
      await teamService.cancelJoinRequest(requestId);
      success('Join request cancelled');
    } catch {
      toastError('Failed to cancel request');
      fetchDashboard();
    }
  };

  const handleRespondJoinRequest = async (teamId, requestId, status) => {
    try {
      setData(prev => ({
        ...prev,
        incomingRequests: (prev.incomingRequests || []).filter(r => r._id !== requestId)
      }));
      await teamService.respondJoinRequest(teamId, requestId, status);
      success(`Join request ${status === 'ACCEPTED' ? 'accepted' : 'declined'}`);
      fetchDashboard();
    } catch {
      toastError('Failed to process request');
      fetchDashboard();
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;
  if (!data) return <div className="page-wrapper text-slate-500">Failed to load dashboard.</div>;

  const { teams = [], pendingRequests = [], incomingRequests = [], notifications = [], unreadCount = 0 } = data;
  const displayUser = data.user ?? user;
  const firstName = displayUser?.name?.split(' ')[0] ?? 'there';
  const totalPendingCount = pendingRequests.length + incomingRequests.length;

  return (
    <div className="page-wrapper">
      {/* ═══════════ Greeting Header ═══════════ */}
      <div className="relative mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {getGreeting()}, {firstName}! <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite]">👋</span>
            </h1>
            <p className="text-slate-500 mt-1">Here's what's happening with your teams today.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 flex-shrink-0 self-start"
          >
            <Plus className="h-4 w-4" />
            Create Team
            <ChevronDown className="h-3.5 w-3.5 ml-0.5 opacity-60" />
          </button>
        </div>

        {/* Mountain illustration */}
        <div className="absolute top-0 right-0 w-[55%] h-full pointer-events-none hidden md:block" style={{ opacity: 0.7 }}>
          <MountainIllustration className="w-full h-full" />
        </div>
      </div>

      {/* ═══════════ Statistics Cards ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}    value={teams.length}          label="My Teams"             sublabel={`${Math.min(teams.length, 2)} active projects`} iconBg="bg-blue-50"    iconColor="text-blue-600"   delay={0} />
        <StatCard icon={Clock}    value={totalPendingCount}     label="Pending Requests"    sublabel="Awaiting responses"   iconBg="bg-amber-50"   iconColor="text-amber-600"  delay={75} />
        <StatCard icon={CheckCircle} value={0}                  label="Tasks Due"            sublabel="This week"            iconBg="bg-emerald-50" iconColor="text-emerald-600" delay={150} />
        <StatCard icon={Bell}     value={unreadCount}           label="Unread Notifications" sublabel="Stay updated"          iconBg="bg-purple-50"  iconColor="text-purple-600" delay={225} />
      </div>

      {/* ═══════════ Main 2-Column Content Area ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left Column (3 cols): My Teams + Pending Requests ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* My Teams */}
          <div className="card p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="section-title">My Teams</h2>
              <Link to="/teams" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {teams.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Users className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">You haven't joined any teams yet.</p>
                <Link to="/teams" className="btn-primary btn-sm mt-4 inline-flex">Browse Teams</Link>
              </div>
            ) : (
              <div className="px-1 py-1 divide-y divide-slate-100">
                {teams.slice(0, 4).map((m, idx) => (
                  <TeamRow key={m._id} membership={m} index={idx} />
                ))}
              </div>
            )}
          </div>

          {/* Pending Requests */}
          <div className="card p-0" id="pending-requests">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="section-title">Pending Requests</h2>
              <Link to="/teams" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {totalPendingCount === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle className="h-10 w-10 mx-auto text-emerald-300 mb-3" />
                <p className="text-slate-500 text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="px-5 py-3 divide-y divide-slate-100">
                {/* 1. Incoming Requests (for Team Leaders/Mentors) */}
                {incomingRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {getInitials(req.user?.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          <span className="font-bold">{req.user?.name ?? 'User'}</span> requested to join <span className="text-primary-600 font-semibold">{req.team?.name}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          Requested {timeAgo(req.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRespondJoinRequest(req.team?._id, req._id, 'REJECTED')}
                        className="btn-danger btn-sm text-xs"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespondJoinRequest(req.team?._id, req._id, 'ACCEPTED')}
                        className="btn-success btn-sm text-xs"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}

                {/* 2. Outgoing Requests (sent by the user) */}
                {pendingRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-amber-600">
                          {getInitials(req.team?.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{req.team?.name ?? 'Unknown Team'}</p>
                        <p className="text-xs text-slate-400">
                          Requested {timeAgo(req.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Pending
                      </span>
                      <button
                        onClick={() => handleCancelJoinRequest(req._id)}
                        className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        title="Cancel request"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column (2 cols): Recent Activity + Join a Team ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="card p-0" id="recent-activity">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="section-title">Recent Activity</h2>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>

            <div className="px-3 py-2">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle className="h-10 w-10 mx-auto text-emerald-300 mb-3" />
                  <p className="text-slate-500 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.slice(0, 10).map((n, idx) => (
                    <ActivityItem key={n._id} notification={n} index={idx} onDismiss={handleDismissNotification} />
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Join a Team */}
          <div className="card">
            <h2 className="section-title mb-1">Join a Team</h2>
            <p className="text-sm text-slate-400 mb-4">Have a team code? Join your team now.</p>
            <form onSubmit={handleJoinTeam}>
              <div className="relative mb-3">
                <input
                  type="text"
                  className="input pr-10 uppercase tracking-wider font-mono text-sm"
                  placeholder="Enter team code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={12}
                />
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {joining ? (
                  <Loader size="sm" className="border-white/40 border-t-white" />
                ) : (
                  <>Join Team <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ═══════════ Create Team Modal ═══════════ */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="label">Team Name *</label>
            <input name="name" type="text" className="input" required maxLength={100} placeholder="e.g. Alpha Squad" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" className="input" rows={3} maxLength={1000} placeholder="What is this team about?" />
          </div>
          <div>
            <label className="label">Visibility</label>
            <select name="visibility" className="input">
              <option value="PRIVATE">🔒 Private – join code required</option>
              <option value="PUBLIC">🌐 Public – searchable & open</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
