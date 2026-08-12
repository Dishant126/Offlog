import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import {
  Plus, Search, Users, Globe, Lock, ArrowRight, Hash, Crown, UserCheck
} from 'lucide-react';

const teamColors = [
  { bg: 'bg-blue-50',    border: 'border-blue-100',   accent: 'bg-blue-600',    text: 'text-blue-600' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-600', text: 'text-emerald-600' },
  { bg: 'bg-amber-50',   border: 'border-amber-100',   accent: 'bg-amber-600',   text: 'text-amber-600' },
  { bg: 'bg-purple-50',  border: 'border-purple-100',  accent: 'bg-purple-600',  text: 'text-purple-600' },
  { bg: 'bg-rose-50',    border: 'border-rose-100',    accent: 'bg-rose-600',    text: 'text-rose-600' },
  { bg: 'bg-cyan-50',    border: 'border-cyan-100',    accent: 'bg-cyan-600',    text: 'text-cyan-600' },
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function TeamCard({ team, membership, index, currentUserId, onJoinPublic, isMentor = false }) {
  const colorSet = teamColors[index % teamColors.length];
  
  // Calculate role label
  const role = membership?.role;
  const isLeader = role === 'TEAM_LEADER' || team.createdBy?._id === currentUserId;
  const roleLabel = isLeader ? 'Leader' : role ? (role === 'MENTOR' ? 'Mentor' : 'Member') : null;

  // Leader name
  const leaderName = team.createdBy?.name || 'Leader';

  // Members list & avatar stack
  const members = team.members || [];
  const memberUsers = members.map(m => m.user || m).filter(u => u && (u.name || u.email));
  const totalMembers = memberUsers.length || 1;
  const visibleMembers = memberUsers.slice(0, 3);
  const remainingMembers = totalMembers > 3 ? totalMembers - 3 : 0;

  return (
    <div className="card card-hover h-full flex flex-col justify-between group p-5">
      <div>
        {/* Top bar with icon & tags */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${colorSet.bg} border ${colorSet.border} flex items-center justify-center flex-shrink-0 font-bold ${colorSet.text} text-base shadow-sm`}>
            {team.logo ? (
              <img src={team.logo} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              getInitials(team.name)
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              team.visibility === 'PUBLIC' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {team.visibility === 'PUBLIC' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {team.visibility}
            </span>
            {roleLabel && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isLeader ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-700'
              }`}>
                {isLeader && <Crown className="h-3 w-3 text-blue-600" />}
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        {/* Name & Description */}
        <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-primary-600 transition-colors">
          {team.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {team.description || 'Building the future of our team collaboration.'}
        </p>

        {/* Metadata info */}
        <div className="text-xs text-slate-400 font-medium mb-4 space-y-1">
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>{totalMembers} member{totalMembers !== 1 ? 's' : ''}</span>
            <span className="text-slate-300">•</span>
            <span>{leaderName}</span>
          </p>
        </div>
      </div>

      {/* Footer avatar stack & View Team link */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        {/* Avatar Stack */}
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {visibleMembers.length > 0 ? (
              visibleMembers.map((u, i) => (
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
              ))
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-slate-500">{getInitials(leaderName)}</span>
              </div>
            )}
          </div>
          {remainingMembers > 0 && (
            <span className="text-xs text-slate-400 font-medium ml-1">+{remainingMembers}</span>
          )}
        </div>

        {/* Action Link or Join Button */}
        {membership || isMentor ? (
          <Link
            to={`/teams/${team._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors group/btn"
          >
            View Team
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <button
            onClick={() => onJoinPublic(team._id)}
            className="btn-primary btn-sm text-xs py-1 px-3"
          >
            Join Team
          </button>
        )}
      </div>
    </div>
  );
}

export default function Teams() {
  const { user, isMentor } = useAuth();
  const [myMemberships, setMyMemberships] = useState([]);
  const [publicTeams, setPublicTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const { success, error: toastError } = useToast();

  useEffect(() => { fetchTeams(); }, [isMentor]);

  const fetchTeams = async () => {
    try {
      if (isMentor) {
        const res = await teamService.getMyTeams();
        setMyMemberships(res.data?.data ?? res.data ?? []);
        setPublicTeams([]);
        return;
      }

      const [myRes, publicRes] = await Promise.all([
        teamService.getMyTeams(),
        teamService.getPublic()
      ]);
      setMyMemberships(myRes.data?.data ?? myRes.data ?? []);
      const pData = publicRes.data?.data ?? publicRes.data;
      setPublicTeams(pData?.teams ?? pData ?? []);
    } catch {
      toastError('Failed to load teams');
    } finally {
      setLoading(false);
    }
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
    } finally {
      setCreating(false);
    }
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
    } finally {
      setJoining(false);
    }
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

  // Combine joined & public teams into a consolidated list for filtering
  const joinedTeamIds = new Set(myMemberships.map(m => m.team?._id));

  // Build unified list of teams with membership metadata attached
  const allTeamsList = isMentor
    ? myMemberships.map(m => ({ team: m.team, membership: m }))
    : [
        ...myMemberships.map(m => ({ team: m.team, membership: m })),
        ...publicTeams
          .filter(t => !joinedTeamIds.has(t._id))
          .map(t => ({ team: t, membership: null }))
      ];

  // Filter based on active tab and search query
  const filteredTeams = allTeamsList.filter(({ team, membership }) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (isMentor) {
      return !!membership;
    }

    if (activeFilter === 'My Teams') return !!membership;
    if (activeFilter === 'Teams I Lead') return membership?.role === 'TEAM_LEADER' || team.createdBy?._id === user?._id;
    if (activeFilter === 'Public') return team.visibility === 'PUBLIC';
    if (activeFilter === 'Private') return team.visibility === 'PRIVATE';
    return true; // All
  });

  const filters = isMentor ? ['All'] : ['All', 'My Teams', 'Teams I Lead', 'Public', 'Private'];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="page-wrapper">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="text-slate-500 text-sm mt-1">{isMentor ? 'Your assigned teams and delivery workspace.' : 'Manage your teams, members, and collaboration.'}</p>
        </div>
        {!isMentor && (
          <div className="flex gap-2">
            <button onClick={() => setShowJoin(true)} className="btn-secondary flex items-center gap-2">
              <Hash className="h-4 w-4" /> Join by Code
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Team
            </button>
          </div>
        )}
      </div>

      {/* ── Search Bar & Filter Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams..."
            className="input pl-10 text-sm bg-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── Teams Cards Grid ── */}
      {filteredTeams.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700">No teams found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter options</p>
          {!isMentor && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Create Team</button>
              <button onClick={() => setShowJoin(true)} className="btn-secondary btn-sm">Join by Code</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {filteredTeams.map(({ team, membership }, idx) => (
            <TeamCard
              key={team._id}
              team={team}
              membership={membership}
              index={idx}
              currentUserId={user?._id}
              onJoinPublic={handlePublicJoin}
              isMentor={isMentor}
            />
          ))}
        </div>
      )}

      {/* ── Create Team Modal ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Team Name *</label>
            <input name="name" type="text" className="input" required maxLength={100} placeholder="e.g. Design System" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" className="input" rows={3} maxLength={1000} placeholder="Building the future of our design language..." />
          </div>
          <div>
            <label className="label">Visibility</label>
            <select name="visibility" className="input">
              <option value="PUBLIC">🌐 Public – searchable & open to all</option>
              <option value="PRIVATE">🔒 Private – join code required</option>
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
                className="input pl-9 uppercase tracking-widest font-mono text-sm"
                placeholder="ZVHWBK"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                required
                maxLength={12}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Enter the 6-character code shared by your team leader</p>
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
