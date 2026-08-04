import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { useToast } from '../hooks/useToast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { Plus, Search, Users, Globe, Lock, Copy, Check, ArrowRight, Hash } from 'lucide-react';

function TeamCard({ membership: m }) {
  const roleColors = {
    TEAM_LEADER: 'badge-leader',
    MENTOR:      'badge-mentor',
    MEMBER:      'badge-member',
  };
  const roleLabel = m.role.replace('_', ' ');

  return (
    <Link to={`/teams/${m.team._id}`} className="block group">
      <div className="card card-hover h-full flex flex-col">
        {/* Card top color bar */}
        <div className="h-1 -mx-6 -mt-6 mb-5 rounded-t-2xl bg-gradient-card" />

        <div className="flex items-start justify-between mb-4">
          {m.team.logo ? (
            <img src={m.team.logo} alt="" className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100" />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gradient-card flex items-center justify-center shadow-glow-sm">
              <Users className="h-5 w-5 text-white" />
            </div>
          )}
          <span className={`${roleColors[m.role] ?? 'badge-member'} text-[11px]`}>
            {roleLabel}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
          {m.team.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 flex-1">
          {m.team.description || 'No description provided.'}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {m.team.visibility === 'PUBLIC'
              ? <><Globe className="h-3 w-3 text-emerald-500" /> Public</>
              : <><Lock className="h-3 w-3" /> Private</>}
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

function PublicTeamCard({ team, onJoin, alreadyMember }) {
  return (
    <div className="card h-full flex flex-col">
      <div className="h-1 -mx-6 -mt-6 mb-5 rounded-t-2xl bg-gradient-success" />

      <div className="flex items-start justify-between mb-4">
        {team.logo ? (
          <img src={team.logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Globe className="h-5 w-5 text-emerald-600" />
          </div>
        )}
        <span className="badge-public text-[11px]">Public</span>
      </div>

      <h3 className="font-bold text-slate-900 mb-1">{team.name}</h3>
      <p className="text-xs text-slate-500 line-clamp-2 flex-1">
        {team.description || 'No description provided.'}
      </p>
      <p className="text-xs text-slate-400 mt-2">By {team.createdBy?.name}</p>

      <button
        onClick={() => onJoin(team._id)}
        disabled={alreadyMember}
        className={`mt-4 w-full btn btn-sm ${alreadyMember ? 'btn-secondary opacity-50 cursor-default' : 'btn-primary'}`}
      >
        {alreadyMember ? 'Already Joined' : 'Join Team'}
      </button>
    </div>
  );
}

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [publicTeams, setPublicTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [copied, setCopied] = useState(null);
  const { success, error: toastError } = useToast();

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      const [myRes, publicRes] = await Promise.all([
        teamService.getMyTeams(),
        teamService.getPublic()
      ]);
      setTeams(myRes.data?.data ?? myRes.data ?? []);
      const pData = publicRes.data?.data ?? publicRes.data;
      setPublicTeams(pData?.teams ?? pData ?? []);
    } catch { toastError('Failed to load teams'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setCreating(true);
    try {
      await teamService.create({
        name: formData.get('name'),
        description: formData.get('description'),
        visibility: formData.get('visibility')
      });
      success('Team created successfully!');
      setShowCreate(false);
      fetchTeams();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create team');
    } finally { setCreating(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      const res = await teamService.join(joinCode.trim().toUpperCase(), joinMsg);
      const result = res.data?.data ?? res.data;
      success(result?.joined ? 'Joined team successfully!' : 'Join request sent!');
      setShowJoin(false);
      setJoinCode('');
      setJoinMsg('');
      fetchTeams();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to join team');
    } finally { setJoining(false); }
  };

  const handlePublicJoin = async (teamId) => {
    try {
      await teamService.joinPublic(teamId);
      success('Joined team!');
      fetchTeams();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to join team');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const myTeamIds = new Set(teams.map(m => m.team?._id));
  const filteredPublic = publicTeams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader size="lg" center />;

  return (
    <div className="page-wrapper">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="text-slate-500 text-sm mt-1">
            {teams.length} team{teams.length !== 1 ? 's' : ''} you're part of
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(true)} className="btn-secondary flex items-center gap-2">
            <Hash className="h-4 w-4" /> Join by Code
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Team
          </button>
        </div>
      </div>

      {/* ── My Teams ── */}
      <section className="mb-10">
        <h2 className="section-title mb-4">My Teams</h2>
        {teams.length === 0 ? (
          <div className="card text-center py-14">
            <Users className="h-12 w-12 mx-auto text-slate-200 mb-4" />
            <p className="font-semibold text-slate-600">No teams yet</p>
            <p className="text-sm text-slate-400 mt-1">Create a team or join one using a code</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Create Team</button>
              <button onClick={() => setShowJoin(true)} className="btn-secondary btn-sm">Join by Code</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams.map(m => (
              <TeamCard key={m._id} membership={m} />
            ))}
          </div>
        )}
      </section>

      {/* ── Public Teams ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="section-title">Discover Public Teams</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams..."
              className="input pl-9 w-56 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredPublic.length === 0 ? (
          <div className="card text-center py-10">
            <Globe className="h-10 w-10 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">
              {searchQuery ? 'No teams match your search' : 'No public teams available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPublic.map(team => (
              <PublicTeamCard
                key={team._id}
                team={team}
                onJoin={handlePublicJoin}
                alreadyMember={myTeamIds.has(team._id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Create Team Modal ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <form onSubmit={handleCreate} className="space-y-4">
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
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Create Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Join Team Modal ── */}
      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Join a Team">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="label">Team Join Code</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="input pl-9 uppercase tracking-widest font-mono"
                placeholder="TEAM-XXXXXX"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                required
                maxLength={12}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Enter the code shared by the team leader</p>
          </div>
          <div>
            <label className="label">Message (optional)</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Introduce yourself to the team leader..."
              value={joinMsg}
              onChange={e => setJoinMsg(e.target.value)}
              maxLength={300}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowJoin(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={joining} className="btn-primary">
              {joining ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Send Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
