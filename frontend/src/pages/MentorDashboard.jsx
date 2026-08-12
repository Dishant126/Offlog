import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Loader from '../components/common/Loader';
import { Search, Users, Briefcase, ClipboardList, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, CalendarDays } from 'lucide-react';

const statusStyles = {
  NOT_STARTED: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  ON_HOLD: 'bg-amber-50 text-amber-700'
};

export default function MentorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/mentors/dashboard');
        setDashboard(res.data?.data ?? res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTeams = useMemo(() => {
    if (!dashboard?.teams) return [];
    return dashboard.teams.filter((team) => {
      const matchSearch = `${team.name} ${team.projectName || ''} ${team.leader?.name || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'ALL' || team.projectStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [dashboard, search, filter]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader size="lg" /></div>;

  if (!dashboard?.teams?.length) {
    return (
      <div className="page-wrapper">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Mentor Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">No assigned teams yet</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Your mentor access will appear here once an administrator assigns you to teams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Mentor Workspace</p>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0] || 'Mentor'}.</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor every team, review progress, and steer delivery with confidence.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Overall Project Progress</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{dashboard?.stats?.overallProgress ?? 0}%</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Assigned Teams" value={dashboard?.stats?.totalTeams ?? 0} tone="blue" />
        <MetricCard icon={Briefcase} label="Total Members" value={dashboard?.stats?.totalMembers ?? 0} tone="emerald" />
        <MetricCard icon={ClipboardList} label="Active Projects" value={dashboard?.stats?.totalActiveProjects ?? 0} tone="violet" />
        <MetricCard icon={CheckCircle2} label="Upcoming Deadlines" value={dashboard?.stats?.upcomingDeadlines ?? 0} tone="green" />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <MetricCard icon={AlertTriangle} label="Pending Tasks" value={dashboard?.stats?.pendingTasks ?? 0} tone="amber" />
        <MetricCard icon={AlertTriangle} label="Overdue Tasks" value={dashboard?.stats?.overdueTasks ?? 0} tone="rose" />
        <MetricCard icon={Sparkles} label="Progress" value={`${dashboard?.stats?.overallProgress ?? 0}%`} tone="cyan" />
      </div>

      <div className="card p-0">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Team Overview</h2>
            <p className="text-sm text-slate-500">View every team in the system, monitor status, and drill into progress.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams" className="input pl-9" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input min-w-[180px]">
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {filteredTeams.map((team) => (
            <div key={team._id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{team.description || 'Assigned team overview and project status.'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[team.projectStatus] || statusStyles.NOT_STARTED}`}>{formatStatus(team.projectStatus)}</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Team Leader: {team.leader?.name || 'Unassigned'}</span>
                  <span className="font-semibold text-slate-800">{team.progress || 0}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200">
                  <div className="h-2.5 rounded-full bg-primary-600" style={{ width: `${team.progress || 0}%` }} />
                </div>
                <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <div className="rounded-xl bg-white px-3 py-2"><p className="text-xs text-slate-400">Members</p><p className="font-semibold text-slate-800">{team.membersCount}</p></div>
                  <div className="rounded-xl bg-white px-3 py-2"><p className="text-xs text-slate-400">Project</p><p className="font-semibold text-slate-800">{team.projectName || 'No Project'}</p></div>
                  <div className="rounded-xl bg-white px-3 py-2"><p className="text-xs text-slate-400">Due</p><p className="font-semibold text-slate-800">{team.dueDate ? new Date(team.dueDate).toLocaleDateString() : '—'}</p></div>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {team.lastActivity ? `Updated ${new Date(team.lastActivity).toLocaleDateString()}` : 'No activity yet'}</span>
                  <Link to={`/mentor/teams/${team._id}`} className="inline-flex items-center gap-1 font-semibold text-primary-600">View Team <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    cyan: 'bg-cyan-50 text-cyan-600'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneMap[tone] || toneMap.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function formatStatus(status) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Not Started';
}
