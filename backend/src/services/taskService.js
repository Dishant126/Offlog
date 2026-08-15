import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TeamMember from '../models/TeamMember.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Helper to check user permission in team
const getUserTeamRole = async (userId, teamId) => {
  const user = await User.findById(userId);
  if (user && user.role === 'ADMIN') return 'ADMIN';

  const member = await TeamMember.findOne({ user: userId, team: teamId });
  if (member) return member.role;
  
  if (user && user.role === 'MENTOR') return 'MENTOR';

  return null;
};

// Helper to recalculate project progress percentage
export const updateProjectProgress = async (projectId) => {
  const totalTasks = await Task.countDocuments({ project: projectId });
  const completedTasks = await Task.countDocuments({ project: projectId, status: 'COMPLETED' });

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  let status = 'NOT_STARTED';
  if (progress === 100) {
    status = 'COMPLETED';
  } else if (progress > 0) {
    status = 'IN_PROGRESS';
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    { progress, status },
    { new: true }
  );

  return updatedProject;
};

export const createProject = async (teamId, data, userId) => {
  const role = await getUserTeamRole(userId, teamId);
  if (!role || !['ADMIN', 'TEAM_LEADER', 'MENTOR'].includes(role)) {
    throw new Error('Only Mentors, Team Leaders, or Admins can create projects');
  }

  const project = await Project.create({
    name: data.name,
    description: data.description || '',
    team: teamId,
    createdBy: userId,
    deadline: data.deadline || null
  });

  return project;
};

export const getProjectsByTeam = async (teamId, userId) => {
  const role = await getUserTeamRole(userId, teamId);
  if (!role) throw new Error('Access denied: You are not a member of this team');

  const projects = await Project.find({ team: teamId })
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });

  // Attach tasks to each project
  const projectsWithTasks = await Promise.all(
    projects.map(async (project) => {
      const tasks = await Task.find({ project: project._id })
        .populate('assignedTo', 'name email avatar')
        .populate('createdBy', 'name email avatar')
        .populate('completedBy', 'name email avatar')
        .sort({ createdAt: -1 });

      const pObj = project.toObject();
      pObj.tasks = tasks;
      return pObj;
    })
  );

  return projectsWithTasks;
};

export const createTask = async (teamId, projectId, data, userId) => {
  const role = await getUserTeamRole(userId, teamId);
  if (!role || !['ADMIN', 'TEAM_LEADER', 'MENTOR'].includes(role)) {
    throw new Error('Only Mentors, Team Leaders, or Admins can assign tasks');
  }

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const task = await Task.create({
    title: data.title,
    description: data.description || '',
    project: projectId,
    team: teamId,
    assignedTo: data.assignedTo || null,
    createdBy: userId,
    deadline: data.deadline || null
  });

  // Update project progress
  await updateProjectProgress(projectId);

  // Send notification to assigned user if applicable
  if (data.assignedTo && data.assignedTo !== userId.toString()) {
    await Notification.create({
      user: data.assignedTo,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${task.title}"`,
      type: 'TASK_ASSIGNED',
      relatedTeam: teamId
    });
  }

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  return populatedTask;
};

export const updateTaskStatus = async (taskId, status, userId, completionNotes = '', completionFile = null) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  const role = await getUserTeamRole(userId, task.team);
  if (!role) throw new Error('Access denied');

  const prevStatus = task.status;
  task.status = status;

  if (status === 'COMPLETED') {
    task.completedBy = userId;
    task.completedAt = new Date();
    if (completionNotes) task.completionNotes = completionNotes;
    if (completionFile) task.completionFile = completionFile;
  } else {
    task.completedBy = null;
    task.completedAt = null;
    task.completionNotes = '';
    task.completionFile = null;
  }

  await task.save();

  // Recalculate Project progress percentage automatically
  const updatedProject = await updateProjectProgress(task.project);

  // Notify Mentor and Project Creator if task completed
  if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
    try {
      const userWhoCompleted = await User.findById(userId).select('name');
      const mentors = await TeamMember.find({ team: task.team, role: 'MENTOR' });
      const notificationTargets = new Set([
        task.createdBy.toString(),
        ...mentors.map(m => m.user.toString())
      ]);

      notificationTargets.delete(userId.toString()); // Don't notify self

      for (const targetId of notificationTargets) {
        await Notification.create({
          user: targetId,
          title: 'Task Completed',
          message: `${userWhoCompleted?.name || 'A team member'} completed task "${task.title}". Project progress updated to ${updatedProject.progress}%.`,
          type: 'TASK_COMPLETED',
          relatedTeam: task.team
        });
      }
    } catch { /* ignore notification errors */ }
  }

  const populatedTask = await Task.findById(taskId)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('completedBy', 'name email avatar');

  return { task: populatedTask, project: updatedProject };
};

export const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  const role = await getUserTeamRole(userId, task.team);
  if (!role || !['ADMIN', 'TEAM_LEADER', 'MENTOR'].includes(role)) {
    throw new Error('Only Mentors, Team Leaders, or Admins can delete tasks');
  }

  const projectId = task.project;
  await task.deleteOne();

  // Recalculate project progress
  const updatedProject = await updateProjectProgress(projectId);
  return { projectId, project: updatedProject };
};

export const deleteProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  const role = await getUserTeamRole(userId, project.team);
  if (!role || !['ADMIN', 'TEAM_LEADER', 'MENTOR'].includes(role)) {
    throw new Error('Only Mentors, Team Leaders, or Admins can delete projects');
  }

  await Task.deleteMany({ project: projectId });
  await project.deleteOne();

  return true;
};
