import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import { useToast } from '../hooks/useToast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import {
  Users, Settings, Trash2, LogOut, Crown, UserCheck,
  UserX, ArrowUpDown, Copy, Check, User, Globe, Lock,
  RefreshCw, ChevronLeft, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

const roleMeta = {
  TEAM_LEADER: { label: 'Team Leader', cls: 'badge-leader', icon: Crown },
  MENTOR:      { label: 'Mentor',      cls: 'badge-mentor',  icon: UserCheck },
  MEMBER:      { label: 'Member',      cls: 'badge-member',  icon: User },
};

function MemberCard({ member: m, isLeader, onRoleChange, onTransfer, onRemove }) {
  const meta = roleMeta[m.role] ?? roleMeta.MEMBER;
  const MetaIcon = meta.icon;
  const isTargetLeader = m.role === 'TEAM_LEADER';

  return (
    <div className="card flex items-start justify-between gap-3 group">
      <div className="flex items-center gap-3 min-w-0">
        {m.user.avatar ? (
          <img src={m.user.avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0" />
        ) : (
          <div className={`h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 ${isTargetLeader ? 'bg-gradient-card' : 'bg-slate-100'}`}>
            <User className={`h-5 w-5 ${isTargetLeader ? 'text-white' : 'text-slate-400'}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{m.user.name}</p>
          <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
          <span className={`${meta.cls} text-[11px] mt-1 inline-flex items-center gap-1`}>
            <MetaIcon className="h-2.5 w-2.5" />
            {meta.label}
          </span>
        </div>
      </div>

      {isLeader && !isTargetLeader && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onRoleChange(m.user._id, m.role === 'MENTOR' ? 'MEMBER' : 'MENTOR')}
            className="btn-icon btn-ghost text-slate-500"
            title={m.role === 'MENTOR' ? 'Demote to Member' : 'Promote to Mentor'}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onTransfer(m.user._id)}
            className="btn-icon btn-ghost text-violet-500"
            title="Transfer Leadership"
          >
            <Crown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onRemove(m.user._id)}
            className="btn-icon btn-ghost text-red-500"
            title="Remove Member"
          >
            <UserX className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { success, error: toastError, warn } = useToast();

  useEffect(() => { fetchTeam(); }, [teamId]);

  const fetchTeam = async () => {
    try {
      const res = await teamService.getById(teamId);
      const d = res.data?.data ?? res.data;
      setTeam(d.team);
      setMembers(d.members ?? []);
      setUserRole(d.userRole);
      setEditForm({
        name: d.team.name,
        description: d.team.description,
        visibility: d.team.visibility,
        allowJoinRequests: d.team.allowJoinRequests
      });
    } catch {
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
    } catch { toastError('Failed to load join requests'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teamService.update(teamId, editForm);
      success('Team settings saved!');
      fetchTeam();
      setShowSettings(false);
    } catch (err) {
      toastError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this team? This cannot be undone.')) return;
    try {
      await teamService.delete(teamId);
      success('Team deleted.');
      navigate('/teams');
    } catch (err) {
      toastError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await teamService.leave(teamId);
      success('You left the team.');
      navigate('/teams');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to leave team');
    }
  };

  const handlePublicJoin = async () => {
    try {
      await teamService.joinPublic(teamId);
      success('Joined team!');
      fetchTeam();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to join team');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await teamService.removeMember(teamId, memberId);
      success('Member removed.');
      fetchTeam();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole);
      success(`Role updated to ${newRole.replace('_', ' ')}`);
      fetchTeam();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleTransfer = async (memberId) => {
    if (!window.confirm('Transfer leadership to this member?')) return;
    try {
      await teamService.transferLeadership(teamId, memberId);
      success('Leadership transferred!');
      fetchTeam();
    } catch (err) {
      toastError(err.response?.data?.message || 'Transfer failed');
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await teamService.respondJoinRequest(teamId, requestId, status);
      success(`Request ${status === 'ACCEPTED' ? 'accepted' : 'rejected'}`);
      fetchRequests();
      fetchTeam();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to respond');
    }
  };

  const regenerateCode = async () => {
    try {
      const res = await teamService.regenerateCode(teamId);
      const d = res.data?.data ?? res.data;
      setTeam(prev => ({ ...prev, joinCode: d.joinCode }));
      success('Join code regenerated!');
    } catch { toastError('Failed to regenerate code'); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loader size="lg" center />;
  if (!team) return null;

  const isLeader = userRole === 'TEAM_LEADER';
  const isMentor = userRole === 'MENTOR';
  const isMember = !!userRole;
  const pendingRequestCount = joinRequests.length;

  // Sort: Leader first, then Mentors, then Members
  const sortedMembers = [...members].sort((a, b) => {
    const order = { TEAM_LEADER: 0, MENTOR: 1, MEMBER: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  return (
    <div className="page-wrapper">
      {/* Back link */}
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors group">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Teams
      </Link>

      {/* ── Hero Section ── */}
      <div className="card mb-6 overflow-hidden">
        {/* Gradient hero bar */}
        <div className="h-24 -mx-6 -mt-6 mb-6 bg-gradient-hero flex items-end px-6 pb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot opacity-30" />
          <div className="relative z-10 flex items-center gap-3">
            {team.logo ? (
              <img src={team.logo} alt="" className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/30" />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-white/15 border border-white/30 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{team.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={team.visibility === 'PUBLIC' ? 'badge-public' : 'badge-private'}>
                  {team.visibility === 'PUBLIC' ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                  {team.visibility}
                </span>
                {isLeader && <span className="badge-leader"><Crown className="h-2.5 w-2.5" /> Leader</span>}
                {isMentor && <span className="badge-mentor"><UserCheck className="h-2.5 w-2.5" /> Mentor</span>}
              </div>
            </div>
          </div>
        </div>

        {team.description && (
          <p className="text-slate-600 text-sm mb-4">{team.description}</p>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {(isLeader || isMentor) && (
            <button onClick={fetchRequests} className="btn-secondary btn-sm flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Join Requests
              {pendingRequestCount > 0 && (
                <span className="ml-1 min-w-[18px] h-4.5 bg-primary-600 text-white text-[10px] font-bold rounded-full px-1 flex items-center">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          )}
          {isLeader && (
            <button onClick={() => setShowSettings(true)} className="btn-secondary btn-sm flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Settings
            </button>
          )}
          {!isMember && team.visibility === 'PUBLIC' && (
            <button onClick={handlePublicJoin} className="btn-primary btn-sm flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Join Team
            </button>
          )}
          {isMember && !isLeader && (
            <button onClick={handleLeave} className="btn-danger btn-sm flex items-center gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Leave Team
            </button>
          )}
        </div>
      </div>

      {/* ── Join Code Card ── */}
      {isLeader && (
        <div className="card mb-6 bg-indigo-50 border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">Team Join Code</p>
              <p className="text-3xl font-mono font-bold text-indigo-700 tracking-widest">{team.joinCode}</p>
              <p className="text-xs text-indigo-400 mt-1">Share this code with people you want to invite</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyCode} className="btn-secondary btn-sm flex items-center gap-1.5">
                {copied ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
              <button onClick={regenerateCode} className="btn-secondary btn-sm flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Members ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            Members
            <span className="text-slate-400 font-normal text-base">({members.length})</span>
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="card text-center py-10 text-slate-400">No members found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedMembers.map(m => (
              <MemberCard
                key={m._id}
                member={m}
                isLeader={isLeader}
                onRoleChange={handleRoleChange}
                onTransfer={handleTransfer}
                onRemove={handleRemoveMember}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Settings Modal ── */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Team Settings">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">Team Name</label>
            <input
              type="text" className="input"
              value={editForm.name ?? ''}
              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input" rows={3}
              value={editForm.description ?? ''}
              onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Visibility</label>
            <select
              className="input"
              value={editForm.visibility ?? 'PRIVATE'}
              onChange={e => setEditForm(p => ({ ...p, visibility: e.target.value }))}
            >
              <option value="PRIVATE">🔒 Private</option>
              <option value="PUBLIC">🌐 Public</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={editForm.allowJoinRequests ?? true}
                onChange={e => setEditForm(p => ({ ...p, allowJoinRequests: e.target.checked }))}
              />
              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary-600 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">Allow join requests</span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3">
            <button type="button" onClick={handleDelete} className="btn-danger flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete Team
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowSettings(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Join Requests Modal ── */}
      <Modal isOpen={showRequests} onClose={() => setShowRequests(false)} title="Pending Join Requests" size="lg">
        {joinRequests.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500">No pending join requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {joinRequests.map(req => (
              <div key={req._id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  {req.user.avatar ? (
                    <img src={req.user.avatar} alt="" className="h-11 w-11 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{req.user.name}</p>
                    <p className="text-xs text-slate-500">{req.user.email}</p>
                    {req.message && (
                      <p className="text-xs text-slate-400 mt-1 italic">"{req.message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRespondRequest(req._id, 'ACCEPTED')}
                    className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handleRespondRequest(req._id, 'REJECTED')}
                    className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  >
                    <UserX className="h-3.5 w-3.5" /> Reject
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
