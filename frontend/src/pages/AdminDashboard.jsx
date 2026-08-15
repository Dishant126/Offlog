import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import {
  Users, Shield, Activity, Search, Trash2, Edit2,
  ChevronLeft, ChevronRight, BarChart3, Clock,
  UserCheck, Globe, TrendingUp, Plus, Award, UserPlus,
  UserCheck as MentorIcon, X
} from 'lucide-react';

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
  ADMIN_CREATED_USER:   'bg-emerald-50 text-emerald-700',
  ADMIN_ASSIGNED_MENTOR:'bg-amber-50 text-amber-700',
  ADMIN_DELETED_USER:   'bg-red-50 text-red-700',
  ADMIN_DELETED_TEAM:   'bg-red-50 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [teams, setTeams]       = useState([]);
  const [mentorAssignments, setMentorAssignments] = useState([]);
  const [logs,  setLogs]        = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states for Mentor Management (Matching Screenshot 1 & 2)
  const [createMentorForm, setCreateMentorForm] = useState({ name: '', email: '', password: '' });
  const [creatingMentor, setCreatingMentor] = useState(false);

  const [assignForm, setAssignForm] = useState({ teamId: '', mentorId: '' });
  const [assigningMentor, setAssigningMentor] = useState(false);

  // Modals
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUserData, setEditUserData] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserData, setCreateUserData] = useState({ name: '', email: '', password: '', role: 'MENTOR', bio: '' });
  const [creatingUser, setCreatingUser] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminService.getStats();
      setStats(unwrap(res));
    } catch { /* ignore */ }
  }, []);

  const fetchUsers = useCallback(async (pg = 1, srch = '') => {
    try {
      const res = await adminService.getUsers({ page: pg, limit: 50, search: srch });
      const data = unwrap(res);
      setUsers(data?.users ?? []);
      setTotalPages(data?.pages ?? 1);
    } catch { /* ignore */ }
  }, []);

  const fetchTeams = useCallback(async (pg = 1, srch = '') => {
    try {
      const res = await adminService.getTeams({ page: pg, limit: 50, search: srch });
      const data = unwrap(res);
      setTeams(data?.teams ?? []);
    } catch { /* ignore */ }
  }, []);

  const fetchMentorAssignments = useCallback(async () => {
    try {
      const res = await adminService.getMentorAssignments();
      setMentorAssignments(unwrap(res));
    } catch { /* ignore */ }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminService.getActivityLogs({ page: 1, limit: 60 });
      const data = unwrap(res);
      setLogs(data?.logs ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchStats(), fetchUsers(), fetchTeams(), fetchMentorAssignments(), fetchLogs()]);
      setLoading(false);
    })();
  }, []);

  const handleCreateMentorDirect = async (e) => {
    e.preventDefault();
    if (!createMentorForm.name || !createMentorForm.email || !createMentorForm.password) {
      toastError('Please fill out all mentor fields');
      return;
    }
    setCreatingMentor(true);
    try {
      await adminService.createUser({
        name: createMentorForm.name,
        email: createMentorForm.email,
        password: createMentorForm.password,
        role: 'MENTOR'
      });
      success(`Mentor account "${createMentorForm.name}" created successfully!`);
      setCreateMentorForm({ name: '', email: '', password: '' });
      fetchUsers();
      fetchStats();
      fetchMentorAssignments();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create mentor');
    } finally {
      setCreatingMentor(false);
    }
  };

  const handleAssignMentorDirect = async (e) => {
    e.preventDefault();
    if (!assignForm.teamId || !assignForm.mentorId) {
      toastError('Please select both team and mentor');
      return;
    }
    setAssigningMentor(true);
    try {
      await adminService.assignMentor(assignForm.teamId, assignForm.mentorId);
      success('Mentor assigned to team successfully!');
      setAssignForm({ teamId: '', mentorId: '' });
      fetchMentorAssignments();
      fetchStats();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to assign mentor');
    } finally {
      setAssigningMentor(false);
    }
  };

  const handleRemoveMentor = async (teamId, userId) => {
    if (!window.confirm('Remove mentor from this team?')) return;
    try {
      await adminService.removeMentor(teamId, userId);
      success('Mentor unassigned from team.');
      fetchMentorAssignments();
    } catch (err) {
      toastError('Failed to remove mentor');
    }
  };

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
      fetchStats();
    } catch (err) {
      toastError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await adminService.createUser(createUserData);
      success(`New ${createUserData.role} account created successfully!`);
      setShowCreateUser(false);
      setCreateUserData({ name: '', email: '', password: '', role: 'MENTOR', bio: '' });
      fetchUsers(page, search);
      fetchStats();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (activeTab === 'users') fetchUsers(1, search);
    else if (activeTab === 'teams') fetchTeams(1, search);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearch('');
    setPage(1);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;

  const tabs = [
    { id: 'overview font-semibold', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'mentor-management', label: 'Mentor Management', icon: MentorIcon },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="page-title text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage users, teams, and system activity</p>
          </div>
        </div>
      </div>

      {/* ── Tabs (Matching Screenshot 1 & 2) ── */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════ OVERVIEW TAB ════════════ */}
      {activeTab === 'overview' && stats && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     value={stats.totalUsers}        label="Total Users"        iconBg="bg-blue-50"     iconColor="text-blue-600" />
            <StatCard icon={Award}     value={stats.totalMentors || 0} label="Assigned Mentors"   iconBg="bg-amber-50"    iconColor="text-amber-600" />
            <StatCard icon={Shield}    value={stats.totalTeams}        label="Total Teams"        iconBg="bg-purple-50"   iconColor="text-purple-600" />
            <StatCard icon={Clock}     value={stats.totalJoinRequests} label="Pending Requests"   iconBg="bg-emerald-50"  iconColor="text-emerald-600" />
          </div>

          {stats.totalUsers > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Active System Accounts
                </h3>
                <span className="text-sm font-bold text-blue-600">
                  {stats.activeUsers} / {stats.totalUsers}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ MENTOR MANAGEMENT TAB (Matching Screenshot 1 & 2) ════════════ */}
      {activeTab === 'mentor-management' && (
        <div className="animate-fade-in space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Card: + Create Mentor User (Matching Screenshot 1) */}
            <div className="card p-6 border border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
                <UserPlus className="h-4 w-4 text-blue-600" />
                Create Mentor User
              </h2>

              <form onSubmit={handleCreateMentorDirect} className="space-y-4">
                <div>
                  <input
                    type="text"
                    className="input bg-slate-50 text-sm py-2.5 rounded-xl border-slate-200 placeholder-slate-400"
                    placeholder="Mentor name"
                    value={createMentorForm.name}
                    onChange={e => setCreateMentorForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    className="input bg-slate-50 text-sm py-2.5 rounded-xl border-slate-200 placeholder-slate-400"
                    placeholder="Mentor email"
                    value={createMentorForm.email}
                    onChange={e => setCreateMentorForm(p => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    className="input bg-slate-50 text-sm py-2.5 rounded-xl border-slate-200 placeholder-slate-400"
                    placeholder="Temporary password"
                    value={createMentorForm.password}
                    onChange={e => setCreateMentorForm(p => ({ ...p, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingMentor}
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-sm"
                >
                  {creatingMentor ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Create Mentor'}
                </button>
              </form>
            </div>

            {/* Right Card: + Assign Mentor to Team (Matching Screenshot 1) */}
            <div className="card p-6 border border-slate-200 shadow-sm bg-white rounded-2xl">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-5">
                <Plus className="h-4 w-4 text-blue-600" />
                Assign Mentor to Team
              </h2>

              <form onSubmit={handleAssignMentorDirect} className="space-y-4">
                <div>
                  <select
                    className="input bg-slate-50 text-sm py-2.5 rounded-xl border-slate-200 font-medium"
                    value={assignForm.teamId}
                    onChange={e => setAssignForm(p => ({ ...p, teamId: e.target.value }))}
                    required
                  >
                    <option value="">Select team</option>
                    {teams.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    className="input bg-slate-50 text-sm py-2.5 rounded-xl border-slate-200 font-medium"
                    value={assignForm.mentorId}
                    onChange={e => setAssignForm(p => ({ ...p, mentorId: e.target.value }))}
                    required
                  >
                    <option value="">Select mentor</option>
                    {users.filter(u => u.role === 'MENTOR' || u.role === 'ADMIN').map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={assigningMentor}
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-sm"
                >
                  {assigningMentor ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Assign Mentor'}
                </button>
              </form>
            </div>

          </div>

          {/* Mentor Team Assignments Table (Matching Screenshot 1) */}
          <div className="card p-0 border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Mentor Team Assignments</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-6">TEAM</th>
                    <th className="py-3 px-6">MENTORS</th>
                    <th className="py-3 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {mentorAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-slate-400">No teams registered yet</td>
                    </tr>
                  ) : (
                    mentorAssignments.map(({ team: t, mentors }) => (
                      <tr key={t._id} className="hover:bg-slate-50/60">
                        <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                          {t.name}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {mentors.length === 0 ? (
                            <span className="text-slate-400 italic">No mentors assigned</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {mentors.map(m => (
                                <span key={m._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                  {m.name} ({m.email})
                                  <button
                                    onClick={() => handleRemoveMentor(t._id, m._id)}
                                    className="p-0.5 hover:text-red-600 rounded"
                                    title="Unassign mentor"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setAssignForm({ teamId: t._id, mentorId: '' });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-secondary btn-sm text-xs font-semibold"
                          >
                            + Assign Mentor
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ USERS & TEAMS SEARCH / TABLES ════════════ */}
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
                              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
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
                          <span className={`badge ${
                            u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.role === 'MENTOR' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'
                          }`}>
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
                              title="Edit User Role"
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">No teams found</td>
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

      {/* ════════════ ACTIVITY LOGS ════════════ */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Recent Activity Logs
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
      <Modal isOpen={showEditUser} onClose={() => setShowEditUser(false)} title="Edit User Account">
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
                className="input font-medium"
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
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
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
