import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Announcement from '../models/Announcement.js';
import FileUpload from '../models/FileUpload.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ActivityLog from '../models/ActivityLog.js';
import { ensureMentorTeamAccess, getAssignedTeamIdsForMentor } from '../utils/mentorAccess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureMentorAccess = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  if (user.role !== 'ADMIN' && user.role !== 'MENTOR') {
    throw new Error('Mentor access required');
  }
  return { user };
};

export const getMentorDashboard = async (userId) => {
  await ensureMentorAccess(userId);

  const assignedTeamIds = await getAssignedTeamIdsForMentor(userId);
  if (!assignedTeamIds.length) {
    return {
      stats: {
        totalTeams: 0,
        totalActiveProjects: 0,
        totalAssignedTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        overallProgress: 0
      },
      teams: []
    };
  }

  const teams = await Team.find({ _id: { $in: assignedTeamIds } }).populate('createdBy', 'name email avatar');
  const teamIds = teams.map(team => team._id);
  const projects = await Project.find({ team: { $in: teamIds } });
  const tasks = await Task.find({ team: { $in: teamIds } }).populate('assignee', 'name email avatar');
  const memberships = await TeamMember.find({ team: { $in: teamIds } });

  const stats = {
    totalTeams: teams.length,
    totalMembers: memberships.length,
    totalActiveProjects: projects.filter(project => project.status === 'IN_PROGRESS').length,
    upcomingDeadlines: tasks.filter(task => task.deadline && new Date(task.deadline) >= new Date()).length,
    totalAssignedTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'COMPLETED').length,
    pendingTasks: tasks.filter(task => task.status === 'PENDING' || task.status === 'IN_PROGRESS').length,
    overdueTasks: tasks.filter(task => task.status === 'OVERDUE' || (task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED')).length,
    overallProgress: projects.length ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0
  };

  const teamSummaries = await Promise.all(teams.map(async (team) => {
    const memberships = await TeamMember.find({ team: team._id }).populate('user', 'name email avatar');
    const leader = memberships.find(member => member.role === 'TEAM_LEADER');
    const project = await Project.findOne({ team: team._id });
    const teamTasks = await Task.find({ team: team._id });
    return {
      _id: team._id,
      name: team.name,
      description: team.description,
      leader: leader?.user || null,
      membersCount: memberships.length,
      projectName: project?.name || 'No Project',
      projectStatus: project?.status || 'NOT_STARTED',
      progress: project?.progress || 0,
      dueDate: project?.deadline ? project.deadline : null,
      pendingTasks: teamTasks.filter(task => task.status !== 'COMPLETED').length,
      completedTasks: teamTasks.filter(task => task.status === 'COMPLETED').length,
      lastActivity: team.updatedAt
    };
  }));

  return { stats, teams: teamSummaries };
};

export const getMentorTeamOverview = async (userId, teamId) => {
  await ensureMentorAccess(userId);
  await ensureMentorTeamAccess(userId, teamId);

  const team = await Team.findById(teamId).populate('createdBy', 'name email avatar');
  if (!team) throw new Error('Team not found');

  const memberships = await TeamMember.find({ team: teamId }).populate('user', 'name email avatar bio');
  const leader = memberships.find(member => member.role === 'TEAM_LEADER');
  const project = await Project.findOne({ team: teamId });
  const tasks = await Task.find({ team: teamId }).populate('assignee', 'name email avatar').sort({ createdAt: -1 });
  const announcements = await Announcement.find({ team: teamId }).populate('author', 'name avatar').sort({ createdAt: -1 });
  const files = await FileUpload.find({ team: teamId }).populate('uploadedBy', 'name avatar').sort({ createdAt: -1 });
  const activity = await ActivityLog.find({
    $or: [
      { targetId: teamId },
      { 'details.teamId': teamId }
    ]
  }).populate('user', 'name email avatar').sort({ createdAt: -1 }).limit(8);
  const upcomingEvents = [
    ...(project?.deadline ? [{ title: `${project.name || 'Project'} due date`, date: project.deadline, type: 'deadline' }] : []),
    ...tasks.filter(task => task.deadline).map(task => ({ title: task.title, date: task.deadline, type: 'task' }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  return {
    team,
    leader: leader?.user || null,
    members: memberships,
    project: project || null,
    tasks,
    completedTasks: tasks.filter(task => task.status === 'COMPLETED').length,
    pendingTasks: tasks.filter(task => task.status !== 'COMPLETED').length,
    overdueTasks: tasks.filter(task => task.status === 'OVERDUE' || (task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED')).length,
    announcements,
    files,
    recentActivity: activity,
    upcomingEvents
  };
};

export const createMentorTask = async (userId, teamId, taskData) => {
  await ensureMentorAccess(userId);
  await ensureMentorTeamAccess(userId, teamId);
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  let project = await Project.findOne({ team: teamId });
  if (!project) {
    project = await Project.create({ team: teamId, name: `${team.name} Project`, status: 'IN_PROGRESS', progress: 10 });
  }

  const task = await Task.create({
    team: teamId,
    project: project._id,
    title: taskData.title,
    description: taskData.description || '',
    assignee: taskData.assignee || null,
    priority: taskData.priority || 'MEDIUM',
    deadline: taskData.deadline || null,
    status: taskData.status || 'PENDING'
  });

  return task;
};

export const updateMentorTask = async (userId, taskId, updateData) => {
  await ensureMentorAccess(userId);
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');
  await ensureMentorTeamAccess(userId, task.team);

  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined) task[key] = value;
  });

  if (updateData.status && updateData.status !== task.status) {
    task.status = updateData.status;
  }

  if (updateData.deadline !== undefined) task.deadline = updateData.deadline;
  if (updateData.priority !== undefined) task.priority = updateData.priority;
  if (updateData.description !== undefined) task.description = updateData.description;
  if (updateData.title !== undefined) task.title = updateData.title;
  if (updateData.assignee !== undefined) task.assignee = updateData.assignee || null;

  await task.save();
  return task;
};

export const addMentorTaskComment = async (userId, taskId, payload) => {
  await ensureMentorAccess(userId);
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');
  await ensureMentorTeamAccess(userId, task.team);

  const comment = { author: userId, message: payload.message || '', createdAt: new Date() };
  task.comments.push(comment);
  await task.save();
  return comment;
};

export const createMentorAnnouncement = async (userId, teamId, payload) => {
  await ensureMentorAccess(userId);
  await ensureMentorTeamAccess(userId, teamId);
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  return Announcement.create({ team: teamId, author: userId, title: payload.title, message: payload.message });
};

export const uploadMentorFile = async (userId, teamId, file) => {
  await ensureMentorAccess(userId);
  await ensureMentorTeamAccess(userId, teamId);
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  const uploadDir = path.join(__dirname, '../../uploads/mentor-files');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  const uploadPath = path.join(uploadDir, safeName);
  fs.writeFileSync(uploadPath, file.buffer);

  return FileUpload.create({
    team: teamId,
    uploadedBy: userId,
    filename: safeName,
    originalName: file.originalname,
    path: `/uploads/mentor-files/${safeName}`,
    mimeType: file.mimetype
  });
};
