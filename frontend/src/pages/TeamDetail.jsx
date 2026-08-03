import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { 
  Users, Settings, Trash2, LogOut, Crown, UserCheck, 
  UserX, ArrowUpDown, Copy, Check, User, Globe, Lock
} from 'lucide-react';

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const res = await teamService.getById(teamId);
      const teamData = res.data?.data ?? res.data;
      setTeam(teamData.team);
      setMembers(teamData.members ?? []);
      setUserRole(teamData.userRole);
      setEditForm({
        name: teamData.team.name,
        description: teamData.team.description,
        visibility: teamData.team.visibility,
        allowJoinRequests: teamData.team.allowJoinRequests
      });
    } catch (e) {
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await teamService.getJoinRequests(teamId);
      setJoinRequests(res.data?.data ?? res.data ?? []);
      setShowRequests(true);
    } catch (e) {
      alert('Failed to load join requests');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await teamService.update(teamId, editForm);
      fetchTeam();
      setShowSettings(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      await teamService.delete(teamId);
      navigate('/teams');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      await teamService.leave(teamId);
      navigate('/teams');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave team');
    }
  };

  const handlePublicJoin = async () => {
    try {
      await teamService.joinPublic(teamId);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join team');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await teamService.removeMember(teamId, memberId);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleTransfer = async (memberId) => {
    if (!confirm('Transfer leadership to this member?')) return;
    try {
      await teamService.transferLeadership(teamId, memberId);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Transfer failed');
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await teamService.respondJoinRequest(teamId, requestId, status);
      fetchRequests();
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond');
    }
  };

  const regenerateCode = async () => {
    try {
      const res = await teamService.regenerateCode(teamId);
      const responseData = res.data?.data ?? res.data;
      setTeam(prev => ({ ...prev, joinCode: responseData.joinCode }));
    } catch (err) {
      alert('Failed to regenerate code');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8"><Loader size="lg" /></div>;
  if (!team) return null;

  const isLeader = userRole === 'TEAM_LEADER';
  const isMentor = userRole === 'MENTOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          {team.logo ? (
            <img src={team.logo} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-600 mt-1">{team.description || 'No description'}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                team.visibility === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {team.visibility === 'PUBLIC' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {team.visibility}
              </span>
              {isLeader && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Leader
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(isLeader || isMentor) && (
            <button onClick={fetchRequests} className="btn-secondary flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4" /> Requests
            </button>
          )}
          {isLeader && (
            <button onClick={() => setShowSettings(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" /> Settings
            </button>
          )}
          {!isLeader && team.visibility === 'PUBLIC' && !userRole && (
            <button onClick={handlePublicJoin} className="btn-primary flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" /> Join Team
            </button>
          )}
          {!isLeader && userRole && (
            <button onClick={handleLeave} className="btn-danger flex items-center gap-2 text-sm">
              <LogOut className="h-4 w-4" /> Leave
            </button>
          )}
        </div>
      </div>

      {isLeader && (
        <Card className="mb-6 bg-primary-50 border-primary-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary-900">Join Code</p>
              <p className="text-2xl font-mono font-bold text-primary-700">{team.joinCode}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCode} className="btn-secondary text-sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button onClick={regenerateCode} className="btn-primary text-sm">Regenerate</button>
            </div>
          </div>
        </Card>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4">Members ({members.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <Card key={m._id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {m.user.avatar ? (
                  <img src={m.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{m.user.name}</p>
                  <p className="text-xs text-gray-500">{m.user.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    m.role === 'TEAM_LEADER' ? 'bg-purple-100 text-purple-700' :
                    m.role === 'MENTOR' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {m.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              {isLeader && m.role !== 'TEAM_LEADER' && (
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleRoleChange(m.user._id, m.role === 'MENTOR' ? 'MEMBER' : 'MENTOR')}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    title={m.role === 'MENTOR' ? 'Demote to Member' : 'Promote to Mentor'}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleTransfer(m.user._id)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    title="Transfer Leadership"
                  >
                    <Crown className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleRemoveMember(m.user._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Team Settings">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">Team Name</label>
            <input 
              type="text" 
              className="input" 
              value={editForm.name} 
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea 
              className="input" 
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Visibility</label>
            <select 
              className="input"
              value={editForm.visibility}
              onChange={(e) => setEditForm({...editForm, visibility: e.target.value})}
            >
              <option value="PRIVATE">Private</option>
              <option value="PUBLIC">Public</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="allowJoin"
              checked={editForm.allowJoinRequests}
              onChange={(e) => setEditForm({...editForm, allowJoinRequests: e.target.checked})}
            />
            <label htmlFor="allowJoin" className="text-sm text-gray-700">Allow join requests</label>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
            <button type="button" onClick={handleDelete} className="btn-danger flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Team
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowSettings(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showRequests} onClose={() => setShowRequests(false)} title="Join Requests">
        {joinRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {joinRequests.map((req) => (
              <div key={req._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {req.user.avatar ? (
                    <img src={req.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{req.user.name}</p>
                    <p className="text-xs text-gray-500">{req.user.email}</p>
                    {req.message && <p className="text-xs text-gray-400 mt-1">"{req.message}"</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRespondRequest(req._id, 'ACCEPTED')}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleRespondRequest(req._id, 'REJECTED')}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <UserX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
