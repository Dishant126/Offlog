import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import Loader from '../components/common/Loader';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, CalendarDays, ClipboardList, MessageSquare, Paperclip, Sparkles, Users, Flag } from 'lucide-react';

const statusStyles = {
  NOT_STARTED: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  ON_HOLD: 'bg-amber-50 text-amber-700'
};

export default function MentorTeamOverview() {
  const { teamId } = useParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignee: '', priority: 'MEDIUM', deadline: '', status: 'PENDING' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [commentForm, setCommentForm] = useState({});
  const [file, setFile] = useState(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadOverview();
  }, [teamId]);

  const loadOverview = async () => {
    try {
      const res = await api.get(`/mentors/teams/${teamId}/overview`);
      setOverview(res.data?.data ?? res.data);
    } catch (err) {
      toastError('Failed to load team overview');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/mentors/teams/${teamId}/tasks`, { ...taskForm, assignee: taskForm.assignee || null, deadline: taskForm.deadline || null });
      success('Task created');
      setTaskForm({ title: '', description: '', assignee: '', priority: 'MEDIUM', deadline: '', status: 'PENDING' });
      loadOverview();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      await api.put(`/mentors/tasks/${taskId}`, { status });
      success('Task updated');
      loadOverview();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleAddComment = async (taskId) => {
    const message = commentForm[taskId];
    if (!message?.trim()) return;
    try {
      await api.post(`/mentors/tasks/${taskId}/comments`, { message });
      success('Comment added');
      setCommentForm(prev => ({ ...prev, [taskId]: '' }));
      loadOverview();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/mentors/teams/${teamId}/announcements`, announcementForm);
      success('Announcement posted');
      setAnnouncementForm({ title: '', message: '' });
      loadOverview();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/mentors/teams/${teamId}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      success('File uploaded');
      setFile(null);
      loadOverview();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload file');
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader size="lg" /></div>;
  if (!overview) return <div className="page-wrapper">Unable to load team overview.</div>;

  const { team, leader, members, project, tasks, announcements, files, completedTasks, pendingTasks, overdueTasks, recentActivity = [], upcomingEvents = [] } = overview;

  return (
    <div className="page-wrapper">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/mentor" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
          <ArrowLeft className="h-4 w-4" /> Back to Mentor Dashboard
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Team Overview</p>
            <h1 className="text-3xl font-bold">{team?.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">{team?.description || 'Mentor workspace for this team.'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Project Progress</p>
            <p className="text-2xl font-semibold text-slate-900">{project?.progress || 0}%</p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-4">
        <StatCard label="Team Leader" value={leader?.name || 'Unassigned'} />
        <StatCard label="Members" value={members?.length || 0} />
        <StatCard label="Completed" value={completedTasks || 0} />
        <StatCard label="Pending" value={pendingTasks || 0} />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <div className="card">
          <h2 className="section-title">Project Details</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Project Name</span><span className="font-semibold text-slate-800">{project?.name || 'No project yet'}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Status</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[project?.status] || statusStyles.NOT_STARTED}`}>{formatStatus(project?.status)}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Start Date</span><span>{project?.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"><span>Due Date</span><span>{project?.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}</span></div>
            <div className="rounded-xl bg-slate-50 px-3 py-2"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Description</p><p className="mt-1 text-slate-700">{project?.description || 'Add a project description to guide the team.'}</p></div>
          </div>
        </div>

        <div className="card xl:col-span-2">
          <h2 className="section-title">Create Task</h2>
          <form onSubmit={handleCreateTask} className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select className="input" value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
              <option value="">Unassigned</option>
              {members?.map((member) => (
                <option key={member.user._id} value={member.user._id}>{member.user.name}</option>
              ))}
            </select>
            <select className="input" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <input className="input md:col-span-2" type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
            <textarea className="input md:col-span-2" rows="3" placeholder="Task detail" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
            <div className="md:col-span-2 flex justify-end">
              <button className="btn-primary" type="submit">Create Task</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="mt-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming milestones yet.</p>
            ) : upcomingEvents.map((event, idx) => (
              <div key={`${event.title}-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{event.title}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500">{event.type === 'deadline' ? 'Deadline' : 'Task'}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity yet.</p>
            ) : recentActivity.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{item.user?.name || 'System'}</p>
                <p className="mt-1 text-sm text-slate-600">{item.action?.replace(/_/g, ' ') || 'Activity recorded'}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Tasks</h2>
            <div className="text-sm text-slate-500">{tasks?.length || 0} total</div>
          </div>
          <div className="mt-4 space-y-3">
            {tasks?.map((task) => (
              <div key={task._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.description || 'No description'}</p>
                  </div>
                  <select className="input min-w-[140px]" value={task.status} onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-2.5 py-1">Assignee: {task.assignee?.name || 'Unassigned'}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Priority: {task.priority}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                </div>
                <div className="mt-4 rounded-xl bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><MessageSquare className="h-4 w-4" /> Comments</div>
                  {task.comments?.length ? task.comments.map((comment, idx) => <div key={`${task._id}-${idx}`} className="mb-2 text-sm text-slate-600">• {comment.message}</div>) : <p className="text-sm text-slate-500">No comments yet.</p>}
                  <div className="mt-3 flex gap-2">
                    <input className="input flex-1" value={commentForm[task._id] || ''} onChange={(e) => setCommentForm(prev => ({ ...prev, [task._id]: e.target.value }))} placeholder="Add feedback" />
                    <button type="button" className="btn-secondary" onClick={() => handleAddComment(task._id)}>Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="section-title">Announcements</h2>
            <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-3">
              <input className="input" placeholder="Announcement title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
              <textarea className="input" rows="3" placeholder="Share an update" value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} required />
              <button className="btn-primary" type="submit">Publish</button>
            </form>
            <div className="mt-4 space-y-3">
              {announcements?.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Uploaded Files</h2>
            <form onSubmit={handleUploadFile} className="mt-4 flex gap-2">
              <input type="file" className="input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <button className="btn-secondary" type="submit">Upload</button>
            </form>
            <div className="mt-4 space-y-2">
              {files?.map((fileItem) => (
                <a key={fileItem._id} href={fileItem.path} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <Paperclip className="h-4 w-4" /> {fileItem.originalName}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatStatus(status) {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Not Started';
}
