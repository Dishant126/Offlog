import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { 
  Users, Shield, Activity, Search, Trash2, Edit2, 
  ChevronLeft, ChevronRight, BarChart3, Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchTeams();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async (pg = 1, srch = '') => {
    try {
      const res = await adminService.getUsers({ page: pg, limit: 10, search: srch });
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (e) { console.error(e); }
  };

  const fetchTeams = async (pg = 1, srch = '') => {
    try {
      const res = await adminService.getTeams({ page: pg, limit: 10, search: srch });
      setTeams(res.data.teams);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    try {
      const res = await adminService.getActivityLogs({ page: 1, limit: 50 });
      setLogs(res.data.logs);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(id);
      fetchUsers(page, search);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    try {
      await adminService.deleteTeam(id);
      fetchTeams();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editUserData._id, {
        name: editUserData.name,
        email: editUserData.email,
        role: editUserData.role,
        isActive: editUserData.isActive
      });
      setShowEditUser(false);
      fetchUsers(page, search);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (activeTab === 'users') fetchUsers(1, search);
    else if (activeTab === 'teams') fetchTeams(1, search);
  };

  if (loading) return <div className="p-8"><Loader size="lg" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg"><Users className="h-6 w-6 text-primary-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg"><Shield className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
                <p className="text-sm text-gray-600">Total Teams</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg"><Users className="h-6 w-6 text-yellow-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg"><Clock className="h-6 w-6 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJoinRequests}</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {(activeTab === 'users' || activeTab === 'teams') && (
        <div>
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="input pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditUserData(u); setShowEditUser(true); }}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button 
                    onClick={() => { setPage(p => p - 1); fetchUsers(page - 1, search); }}
                    disabled={page <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <button 
                    onClick={() => { setPage(p => p + 1); fetchUsers(page + 1, search); }}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3">Created By</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          t.visibility === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>{t.visibility}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.createdBy?.name}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleDeleteTeam(t._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-600">{log.action}</td>
                  <td className="px-4 py-3 text-gray-600">{log.targetType}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showEditUser} onClose={() => setShowEditUser(false)} title="Edit User">
        {editUserData && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                value={editUserData.name}
                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={editUserData.role}
                onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editUserData.isActive}
                onChange={(e) => setEditUserData({ ...editUserData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowEditUser(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
