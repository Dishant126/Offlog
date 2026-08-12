import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import {
  Users, Shield, Activity, Search, Trash2, Edit2,
  ChevronLeft, ChevronRight, BarChart3, Clock,
  UserCheck, Globe, TrendingUp, AlertTriangle, Plus, UserPlus, X
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

const unwrap = (res) => res.data?.data ?? res.data;

function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
  return (
    <div className="card hover-lift">
      <div className="flex items-center gap-4">
        <div className={`stat-icon ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}

const ACTION_COLORS = {
  USER_REGISTERED:      'bg-emerald-50 text-emerald-700',
  USER_LOGGED_IN:       'bg-blue-50 text-blue-700',
  USER_LOGGED_OUT:      'bg-slate-100 text-slate-600',
  TEAM_CREATED:         'bg-purple-50 text-purple-700',
  TEAM_DELETED:         'bg-red-50 text-red-700',
  TEAM_JOINED:          'bg-blue-50 text-blue-700',
  MEMBER_REMOVED:       'bg-amber-50 text-amber-700',
  PROFILE_UPDATED:      'bg-sky-50 text-sky-700',
  PASSWORD_CHANGED:     'bg-amber-50 text-amber-700',
  LEADERSHIP_TRANSFERRED:'bg-purple-50 text-purple-700',
  ADMIN_DELETED_USER:   'bg-red-50 text-red-700',
  ADMIN_DELETED_TEAM:   'bg-red-50 text-red-700',
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [teams, setTeams]       = useState([]);
  const [logs,  setLogs]        = useState([]);
  const [mentorState, setMentorState] = useState({ mentors: [], teams: [] });
  const [mentorForm, setMentorForm] = useState({ name: '', email: '', password: '', role: 'MENTOR' });
  const [assignmentForm, setAssignmentForm] = useState({ teamId: '', mentorId: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const { success, error: toastError } = useToast();

  // ── Fetch functions ────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminService.getStats();
      setStats(unwrap(res));
    } catch { /* ignore */ }
  }, []);

  const fetchUsers = useCallback(async (pg = 1, srch = '') => {
    try {
      const res = await adminService.getUsers({ page: pg, limit: 10, search: srch });
      const data = unwrap(res);
      setUsers(data?.users ?? []);
      setTotalPages(data?.pages ?? 1);
    } catch { /* ignore */ }
  }, []);

  const fetchTeams = useCallback(async (pg = 1, srch = '') => {
    try {
      const res = await adminService.getTeams({ page: pg, limit: 10, search: srch });
      const data = unwrap(res);
      setTeams(data?.teams ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminService.getActivityLogs({ page: 1, limit: 60 });
      const data = unwrap(res);
      setLogs(data?.logs ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchMentorManagement = useCallback(async () => {
    try {
      const res = await adminService.getMentorManagement();
      const data = unwrap(res);
      setMentorState({ mentors: data?.mentors ?? [], teams: data?.teams ?? [] });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchStats(), fetchUsers(), fetchTeams(), fetchLogs(), fetchMentorManagement()]);
      setLoading(false);
    })();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(id);
      success('User deleted.');
      fetchUsers(page, search);
      fetchStats();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Delete this team? This cannot be undone.')) return;
    try {
      await adminService.deleteTeam(id);
      success('Team deleted.');
      fetchTeams();
      fetchStats();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editUserData._id, {
        name:     editUserData.name,
        email:    editUserData.email,
        role:     editUserData.role,
        isActive: editUserData.isActive
      });
      success('User updated.');
      setShowEditUser(false);
      fetchUsers(page, search);
    } catch (err) {
      toastError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (activeTab === 'users') fetchUsers(1, search);
    else if (activeTab === 'teams') fetchTeams(1, search);
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      await adminService.createMentor(mentorForm);
      success('Mentor created.');
      setMentorForm({ name: '', email: '', password: '', role: 'MENTOR' });
      fetchMentorManagement();
      fetchStats();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create mentor');
    }
  };

  const handleAssignMentor = async (e) => {
    e.preventDefault();
    try {
      await adminService.assignMentorToTeam(assignmentForm);
      success('Mentor assigned to team.');
      setAssignmentForm({ teamId: '', mentorId: '' });
      fetchMentorManagement();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to assign mentor');
    }
  };

  const handleRemoveMentor = async (teamId, mentorId) => {
    try {
      await adminService.removeMentorFromTeam(teamId, mentorId);
      success('Mentor removed from team.');
      fetchMentorManagement();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to remove mentor');
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearch('');
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview',       icon: BarChart3  },
    { id: 'users',    label: 'Users',           icon: Users      },
    { id: 'teams',    label: 'Teams',           icon: Shield     },
    { id: 'mentors',  label: 'Mentor Management', icon: UserPlus },
    { id: 'logs',     label: 'Activity Logs',   icon: Activity   },
  ];

  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage users, teams, and system activity</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
              activeTab === id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && stats && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users}     value={stats.totalUsers}        label="Total Users"        iconBg="bg-blue-50"     iconColor="text-blue-600" />
            <StatCard icon={Shield}    value={stats.totalTeams}        label="Total Teams"        iconBg="bg-purple-50"   iconColor="text-purple-600" />
            <StatCard icon={UserCheck} value={stats.totalMembers}      label="Team Memberships"   iconBg="bg-emerald-50"  iconColor="text-emerald-600" />
            <StatCard icon={Clock}     value={stats.totalJoinRequests} label="Pending Requests"   iconBg="bg-amber-50"    iconColor="text-amber-600" />
          </div>

          {/* Active vs Total users bar */}
          {stats.totalUsers > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  Active Users
                </h3>
                <span className="text-sm font-bold text-primary-600">
                  {stats.activeUsers} / {stats.totalUsers}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of users are currently active
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Users / Teams Search Bar ── */}
      {(activeTab === 'users' || activeTab === 'teams') && (
        <div className="animate-fade-in">
          <form onSubmit={handleSearch} className="mb-5 flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="input pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>

          {/* ── Users Table ── */}
          {activeTab === 'users' && (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">No users found</td>
                      </tr>
                    ) : users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {u.name?.[0]?.toUpperCase() ?? '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={
                            u.role === 'ADMIN'
                              ? 'badge badge-admin'
                              : u.role === 'MENTOR'
                                ? 'badge badge-mentor'
                                : 'badge badge-member'
                          }>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={u.isActive ? 'badge badge-active' : 'badge badge-inactive'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-slate-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setEditUserData(u); setShowEditUser(true); }}
                              className="btn-icon btn-ghost"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="btn-icon btn-ghost text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { const p = page - 1; setPage(p); fetchUsers(p, search); }}
                      disabled={page <= 1}
                      className="btn-icon btn-secondary btn-sm disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { const p = page + 1; setPage(p); fetchUsers(p, search); }}
                      disabled={page >= totalPages}
                      className="btn-icon btn-secondary btn-sm disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Teams Table ── */}
          {activeTab === 'teams' && (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Visibility</th>
                      <th>Created By</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">No teams found</td>
                      </tr>
                    ) : teams.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {t.logo ? (
                              <img src={t.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Users className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                            <span className="font-semibold text-slate-900 text-sm">{t.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={t.visibility === 'PUBLIC' ? 'badge badge-public' : 'badge badge-private'}>
                            {t.visibility === 'PUBLIC' ? <Globe className="h-2.5 w-2.5" /> : null}
                            {t.visibility}
                          </span>
                        </td>
                        <td className="text-slate-600 text-sm">{t.createdBy?.name ?? '—'}</td>
                        <td className="text-slate-400 text-xs">
                          {new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteTeam(t._id)}
                            className="btn-icon btn-ghost text-red-500"
                            title="Delete team"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mentor Management ── */}
      {activeTab === 'mentors' && (
        <div className="animate-fade-in space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-slate-900">Create Mentor User</h3>
              </div>
              <form onSubmit={handleCreateMentor} className="mt-4 space-y-3">
                <input className="input" placeholder="Mentor name" value={mentorForm.name} onChange={(e) => setMentorForm(p => ({ ...p, name: e.target.value }))} required />
                <input className="input" type="email" placeholder="Mentor email" value={mentorForm.email} onChange={(e) => setMentorForm(p => ({ ...p, email: e.target.value }))} required />
                <input className="input" type="password" placeholder="Temporary password" value={mentorForm.password} onChange={(e) => setMentorForm(p => ({ ...p, password: e.target.value }))} required />
                <button className="btn-primary" type="submit">Create Mentor</button>
              </form>
            </div>

            <div className="card">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-slate-900">Assign Mentor to Team</h3>
              </div>
              <form onSubmit={handleAssignMentor} className="mt-4 space-y-3">
                <select className="input" value={assignmentForm.teamId} onChange={(e) => setAssignmentForm(p => ({ ...p, teamId: e.target.value }))} required>
                  <option value="">Select team</option>
                  {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
                </select>
                <select className="input" value={assignmentForm.mentorId} onChange={(e) => setAssignmentForm(p => ({ ...p, mentorId: e.target.value }))} required>
                  <option value="">Select mentor</option>
                  {mentorState.mentors.map((mentor) => <option key={mentor._id} value={mentor._id}>{mentor.name} ({mentor.email})</option>)}
                </select>
                <button className="btn-primary" type="submit">Assign Mentor</button>
              </form>
            </div>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Mentor Team Assignments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Mentors</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorState.teams.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-400">No mentor assignments yet</td></tr>
                  ) : mentorState.teams.map(({ team, mentors }) => (
                    <tr key={team._id}>
                      <td className="font-semibold text-slate-800">{team.name}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {mentors.length === 0 ? <span className="text-slate-400">No mentors assigned</span> : mentors.map((mentor) => (
                            <span key={mentor._id} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                              {mentor.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {mentors.map((mentor) => (
                            <button key={mentor._id} onClick={() => handleRemoveMentor(team._id, mentor._id)} className="btn-icon btn-ghost text-red-500" title="Remove mentor">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Logs ── */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-500" />
              Recent Activity
              <span className="text-slate-400 font-normal text-sm">({logs.length} entries)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">No activity logs yet</td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <span className="font-medium text-slate-800 text-sm">
                        {log.user?.name ?? 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-[11px] ${ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-500 font-mono">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="text-xs text-slate-400 font-mono">{log.ipAddress ?? '—'}</td>
                    <td className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      <Modal isOpen={showEditUser} onClose={() => setShowEditUser(false)} title="Edit User">
        {editUserData && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text" className="input"
                value={editUserData.name}
                onChange={e => setEditUserData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email" className="input"
                value={editUserData.email}
                onChange={e => setEditUserData(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={editUserData.role}
                onChange={e => setEditUserData(p => ({ ...p, role: e.target.value }))}
              >
                <option value="USER">USER</option>
                <option value="MENTOR">MENTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={editUserData.isActive}
                  onChange={e => setEditUserData(p => ({ ...p, isActive: e.target.checked }))}
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-slate-700">Account Active</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowEditUser(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
