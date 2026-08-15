import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import { taskService } from '../services/taskService';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import {
  ChevronLeft, Users, Crown, CheckCircle, Clock, Calendar,
  Plus, Trash2, CheckSquare, Square, AlertCircle, FileText
} from 'lucide-react';

export default function MentorTeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);

  // Project details state
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectDueDate, setProjectDueDate] = useState('');
  const [activeProject, setActiveProject] = useState(null);

  // Create Task form state (matching Screenshot 3)
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskStatus, setTaskStatus] = useState('PENDING');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDetail, setTaskDetail] = useState('');

  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchTeamAndProjects();
  }, [teamId]);

  const fetchTeamAndProjects = async () => {
    try {
      const teamRes = await teamService.getById(teamId);
      const teamData = teamRes.data?.data ?? teamRes.data;
      setTeam(teamData.team);
      setMembers(teamData.members ?? []);

      const projRes = await taskService.getProjects(teamId);
      const projList = projRes.data?.data ?? projRes.data ?? [];
      setProjects(projList);

      if (projList.length > 0) {
        const p = projList[0];
        setActiveProject(p);
        setProjectName(p.name);
        setProjectDesc(p.description || '');
        if (p.deadline) setProjectDueDate(new Date(p.deadline).toISOString().split('T')[0]);
      }
    } catch (err) {
      toastError('Failed to load team project details');
      navigate('/mentor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    try {
      const res = await taskService.createProject(teamId, {
        name: projectName.trim(),
        description: projectDesc,
        deadline: projectDueDate || null
      });
      const p = res.data?.data ?? res.data;
      success('Project details saved!');
      fetchTeamAndProjects();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save project details');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toastError('Please enter a task title');
      return;
    }

    let targetProjectId = activeProject?._id;

    // Auto-create project if none exists
    if (!targetProjectId) {
      try {
        const pRes = await taskService.createProject(teamId, {
          name: projectName.trim() || `${team?.name || 'Team'} Project`,
          description: projectDesc || 'Default project',
          deadline: projectDueDate || null
        });
        const createdP = pRes.data?.data ?? pRes.data;
        targetProjectId = createdP._id;
      } catch (err) {
        toastError('Failed to create project for tasks');
        return;
      }
    }

    setCreatingTask(true);
    try {
      await taskService.createTask(teamId, targetProjectId, {
        title: taskTitle.trim(),
        description: taskDetail,
        assignedTo: assignedTo || null,
        status: taskStatus,
        deadline: taskDueDate || null
      });

      success('Task assigned to team successfully!');
      setTaskTitle('');
      setTaskDetail('');
      setTaskDueDate('');
      setAssignedTo('');
      fetchTeamAndProjects();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await taskService.updateTaskStatus(taskId, nextStatus);
      const data = res.data?.data ?? res.data;
      if (data?.task && data?.project) {
        setProjects(prevProj =>
          prevProj.map(p => {
            if (p._id === data.project._id) {
              const updatedTasks = (p.tasks || []).map(t => t._id === taskId ? data.task : t);
              return {
                ...p,
                progress: data.project.progress,
                status: data.project.status,
                tasks: updatedTasks
              };
            }
            return p;
          })
        );
      }
      success(`Task marked as ${nextStatus === 'COMPLETED' ? 'Completed' : 'Pending'}`);
      fetchTeamAndProjects();
    } catch (err) {
      toastError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      success('Task deleted');
      fetchTeamAndProjects();
    } catch {
      toastError('Failed to delete task');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;
  if (!team) return null;

  const leaderMember = members.find(m => m.role === 'TEAM_LEADER') || { user: team.createdBy };
  const allTasks = activeProject?.tasks || [];
  const completedTasksCount = allTasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasksCount = allTasks.filter(t => t.status !== 'COMPLETED').length;
  const projectProgress = activeProject ? activeProject.progress : (allTasks.length > 0 ? Math.round((completedTasksCount / allTasks.length) * 100) : 0);

  return (
    <div className="page-wrapper space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <Link
        to="/mentor"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Mentor Workspace
      </Link>

      {/* ── Top Header Banner (matching Screenshot 3) ── */}
      <div className="card bg-white p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block mb-1">
              Team Overview
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {team.name}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {team.description || 'Offline Team Management'}
            </p>
          </div>

          {/* PROJECT PROGRESS Badge Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center min-w-[220px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Project Progress
            </span>
            <span className="text-4xl font-black text-blue-600 mt-1 block">
              {projectProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 Stat Boxes (matching Screenshot 3) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Team Leader</span>
          <p className="text-xl font-bold text-slate-900 truncate">
            {leaderMember.user?.name || 'Leader'}
          </p>
        </div>

        <div className="card p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Members</span>
          <p className="text-2xl font-bold text-slate-900">
            {members.length}
          </p>
        </div>

        <div className="card p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Completed</span>
          <p className="text-2xl font-bold text-slate-900">
            {completedTasksCount}
          </p>
        </div>

        <div className="card p-5">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Pending</span>
          <p className="text-2xl font-bold text-slate-900">
            {pendingTasksCount}
          </p>
        </div>
      </div>

      {/* ── 2 Main Columns: Project Details + Create Task (matching Screenshot 3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left Card: Project Details ── */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Project Details</h2>
            
            <form onSubmit={handleCreateOrUpdateProject} className="space-y-4">
              <div>
                <label className="label text-xs font-semibold text-slate-400">Project Name</label>
                <input
                  type="text"
                  className="input bg-slate-50 font-semibold"
                  placeholder="e.g. Drdo Auth Project"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs font-semibold text-slate-400">Status</label>
                  <span className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 w-full">
                    {activeProject ? activeProject.status.replace('_', ' ') : 'Not Started'}
                  </span>
                </div>

                <div>
                  <label className="label text-xs font-semibold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    className="input bg-slate-50 text-xs"
                    value={projectDueDate}
                    onChange={e => setProjectDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  className="input bg-slate-50 text-sm"
                  placeholder="Add a project description to guide the team."
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-secondary btn-sm w-full">
                Save Project Details
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Card: Create Task (matching Screenshot 3) ── */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Create Task</h2>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <input
                  type="text"
                  className="input"
                  placeholder="Task title *"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <select
                  className="input text-xs font-semibold"
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value)}
                >
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  className="input text-xs font-semibold"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                >
                  <option value="">Entire Team (All Members)</option>
                  {members.map(m => (
                    <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
                      {m.user?.name || 'Member'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="input text-xs font-semibold"
                  value={taskStatus}
                  onChange={e => setTaskStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <input
                type="date"
                className="input text-xs"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
              />
            </div>

            <div>
              <textarea
                rows={3}
                className="input text-sm"
                placeholder="Task detail"
                value={taskDetail}
                onChange={e => setTaskDetail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={creatingTask || !taskTitle.trim()}
              className="btn-primary w-full py-2.5 rounded-xl font-bold"
            >
              {creatingTask ? <Loader size="sm" className="border-white/40 border-t-white" /> : 'Create Task'}
            </button>
          </form>
        </div>

      </div>

      {/* ── Assigned Tasks List & Automated Progress Percentage ── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Project Tasks ({allTasks.length})</h2>
          <span className="text-xs font-semibold text-slate-400">
            Automated Progress: <strong className="text-blue-600">{projectProgress}%</strong>
          </span>
        </div>

        {allTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 italic border border-dashed border-slate-200 rounded-xl">
            No tasks created yet. Use the form above to assign tasks to team members.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allTasks.map(task => {
              const isDone = task.status === 'COMPLETED';
              return (
                <div key={task._id} className="py-3.5 flex items-start justify-between gap-4 group">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTaskStatus(task._id, task.status)}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                    >
                      {isDone ? (
                        <CheckSquare className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                        <span>Assigned to: <strong className="text-slate-700">{task.assignedTo?.name || 'Entire Team'}</strong></span>
                        {task.deadline && (
                          <span>Due: <strong>{new Date(task.deadline).toLocaleDateString()}</strong></span>
                        )}
                        {isDone && task.completedBy && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                            Completed by: {task.completedBy?.name || 'Team Member'}
                          </span>
                        )}
                      </div>

                      {isDone && (task.completionNotes || task.completionFile) && (
                        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                          {task.completionNotes && (
                            <p className="text-slate-700">
                              <strong className="text-slate-900">Member Report:</strong> {task.completionNotes}
                            </p>
                          )}
                          {task.completionFile && (
                            <div className="pt-1">
                              <a
                                href={task.completionFile.startsWith('http') ? task.completionFile : `http://localhost:5000${task.completionFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                              >
                                <FileText className="h-4 w-4 text-blue-600" />
                                View / Download Uploaded Report ↗
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
