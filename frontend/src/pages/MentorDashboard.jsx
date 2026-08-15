import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mentorService } from '../services/mentorService';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import {
  Users, Award, Calendar, CheckCircle, Clock, AlertTriangle,
  Search, ArrowRight, TrendingUp, Sparkles, Filter, ChevronRight
} from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { error: toastError } = useToast();

  useEffect(() => {
    fetchMentorDashboard();
  }, []);

  const fetchMentorDashboard = async () => {
    try {
      const res = await mentorService.getDashboard();
      const d = res.data?.data ?? res.data;
      setData(d);
    } catch (err) {
      toastError('Failed to load mentor workspace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;
  if (!data) return <div className="page-wrapper text-slate-500">Failed to load workspace.</div>;

  const {
    assignedTeamsCount = 0,
    totalMembersCount = 0,
    activeProjectsCount = 0,
    overallProgress = 0,
    pendingTasksCount = 0,
    overdueTasksCount = 0,
    teams = [],
    upcomingDeadlines = []
  } = data;

  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-wrapper space-y-8 animate-fade-in">
      {/* ── Top Header Banner ── */}
      <div className="card bg-white p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 mb-3 uppercase tracking-wider">
              <Award className="h-3.5 w-3.5 text-blue-600" />
              Mentor Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Mentor'}.
            </h1>
            <p className="text-slate-500 text-sm mt-1.5 max-w-xl">
              Monitor every team, review project delivery progress, and steer results with confidence.
            </p>
          </div>

          {/* Overall Progress Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center min-w-[200px] flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Overall Project Progress
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 mt-1 block">
              {overallProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 7 Metrics Grid (matching Screenshot 4) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Teams</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{assignedTeamsCount}</p>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Members</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalMembersCount}</p>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Projects</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeProjectsCount}</p>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Upcoming Deadlines</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{upcomingDeadlines.length}</p>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Tasks</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingTasksCount}</p>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue Tasks</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 text-rose-600">{overdueTasksCount}</p>
        </div>

        <div className="card p-4 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Progress</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 text-blue-600">{overallProgress}%</p>
        </div>
      </div>

      {/* ── Team Overview Section ── */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Team Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">View every assigned team, monitor status, and assign project tasks.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams..."
                className="input pl-9 text-xs py-1.5 w-48 sm:w-56"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="input text-xs py-1.5 w-36 font-semibold"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Team Cards */}
        {filteredTeams.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No teams found</p>
            <p className="text-xs text-slate-400">Ask Admin to assign you as Mentor to a team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((t) => (
              <div
                key={t._id}
                onClick={() => navigate(`/mentor/teams/${t._id}`)}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description || 'No team description'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                    t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-blue-600">{t.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Details Row */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span>Leader: <strong className="text-slate-800">{t.leaderName}</strong></span>
                    <span>Members: <strong className="text-slate-800">{t.memberCount}</strong></span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    View & Assign Tasks <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
