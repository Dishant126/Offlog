import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { Plus, Search, Users, Globe, Lock, Copy, Check } from 'lucide-react';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [publicTeams, setPublicTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const [myRes, publicRes] = await Promise.all([
        teamService.getMyTeams(),
        teamService.getPublic()
      ]);
      setTeams(myRes.data?.data ?? myRes.data ?? []);
      setPublicTeams(publicRes.data?.data?.teams ?? publicRes.data?.teams ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await teamService.create({
        name: formData.get('name'),
        description: formData.get('description'),
        visibility: formData.get('visibility')
      });
      setShowCreate(false);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      await teamService.join(joinCode);
      setShowJoin(false);
      setJoinCode('');
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join team');
    }
  };

  const handlePublicJoin = async (teamId) => {
    try {
      await teamService.joinPublic(teamId);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join team');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPublic = publicTeams.filter(t => 
    !teams.some(mt => mt.team?._id === t._id) &&
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8"><Loader size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowJoin(true)} className="btn-secondary flex items-center gap-2">
            <Users className="h-4 w-4" /> Join Team
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Team
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Teams</h2>
        {teams.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>You haven't joined any teams yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((m) => (
              <Link key={m._id} to={`/teams/${m.team._id}`}>
                <Card className="hover:shadow-lg transition-all h-full">
                  <div className="flex items-start justify-between mb-3">
                    {m.team.logo ? (
                      <img src={m.team.logo} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600" />
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      m.role === 'TEAM_LEADER' ? 'bg-purple-100 text-purple-700' :
                      m.role === 'MENTOR' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {m.role.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{m.team.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{m.team.description}</p>
                  {m.role === 'TEAM_LEADER' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <span>Code: {m.team.joinCode}</span>
                      <button onClick={(e) => { e.preventDefault(); copyCode(m.team.joinCode); }}>
                        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Public Teams</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              className="input pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {filteredPublic.length === 0 ? (
          <Card className="text-center py-8 text-gray-500">No public teams found</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPublic.map((team) => (
              <Card key={team._id} className="opacity-75">
                <div className="flex items-start justify-between mb-3">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{team.description}</p>
                <p className="text-xs text-gray-400 mt-2">By {team.createdBy.name}</p>
                <button
                  onClick={() => handlePublicJoin(team._id)}
                  className="mt-4 w-full btn-primary text-sm"
                >
                  Join Team
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Team Name *</label>
            <input name="name" type="text" className="input" required maxLength={100} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" className="input" rows={3} maxLength={1000} />
          </div>
          <div>
            <label className="label">Visibility</label>
            <select name="visibility" className="input">
              <option value="PRIVATE">Private (Join code required)</option>
              <option value="PUBLIC">Public (Searchable)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Team</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Join a Team">
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="label">Private Team Join Code</label>
            <input
              type="text"
              className="input uppercase"
              placeholder="TEAM-XXXXXX"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowJoin(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Join Private Team</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
