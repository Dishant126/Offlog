import TeamMember from '../models/TeamMember.js';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export const getMentorDashboardData = async (userId) => {
  const user = await User.findById(userId);
  let memberships = [];

  if (user && user.role === 'ADMIN') {
    const allTeams = await Team.find();
    memberships = allTeams.map(t => ({ team: t, role: 'MENTOR' }));
  } else {
    memberships = await TeamMember.find({
      user: userId,
      role: { $in: ['MENTOR', 'TEAM_LEADER'] }
    }).populate({
      path: 'team',
      populate: [
        { path: 'createdBy', select: 'name email avatar' },
        { path: 'members', populate: { path: 'user', select: 'name email avatar' } }
      ]
    });
  }

  const teamIds = memberships.map(m => m.team?._id || m.team).filter(Boolean);

  // Fetch all teams if admin or populated
  const teamsData = await Team.find({ _id: { $in: teamIds } })
    .populate('createdBy', 'name email avatar')
    .populate({ path: 'members', populate: { path: 'user', select: 'name email avatar' } });

  // Unique members count
  const memberSet = new Set();
  teamsData.forEach(t => {
    (t.members || []).forEach(m => {
      if (m.user?._id) memberSet.add(m.user._id.toString());
    });
  });

  // Projects across assigned teams
  const projects = await Project.find({ team: { $in: teamIds } });
  const tasks = await Task.find({ team: { $in: teamIds } })
    .populate('assignedTo', 'name email avatar')
    .populate('project', 'name')
    .populate('team', 'name');

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'COMPLETED');

  // Calculate overall project progress
  let totalProgress = 0;
  if (projects.length > 0) {
    totalProgress = Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length);
  } else if (tasks.length > 0) {
    totalProgress = Math.round((completedTasks.length / tasks.length) * 100);
  }

  // Format team overview items with progress
  const formattedTeams = await Promise.all(
    teamsData.map(async (team) => {
      const teamProjects = await Project.find({ team: team._id });
      const teamTasks = await Task.find({ team: team._id });
      
      const teamCompletedTasks = teamTasks.filter(t => t.status === 'COMPLETED');
      const teamProgress = teamProjects.length > 0 
        ? Math.round(teamProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / teamProjects.length)
        : teamTasks.length > 0 
          ? Math.round((teamCompletedTasks.length / teamTasks.length) * 100) 
          : 0;

      const leader = (team.members || []).find(m => m.role === 'TEAM_LEADER')?.user || team.createdBy;

      return {
        _id: team._id,
        name: team.name,
        description: team.description,
        visibility: team.visibility,
        joinCode: team.joinCode,
        logo: team.logo,
        leaderName: leader?.name || 'Unassigned',
        memberCount: (team.members || []).length,
        projectCount: teamProjects.length,
        taskCount: teamTasks.length,
        completedTaskCount: teamCompletedTasks.length,
        progress: teamProgress,
        status: teamProgress === 100 ? 'COMPLETED' : teamProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
      };
    })
  );

  return {
    assignedTeamsCount: teamsData.length,
    totalMembersCount: memberSet.size,
    activeProjectsCount: projects.length,
    overallProgress: totalProgress,
    pendingTasksCount: pendingTasks.length,
    completedTasksCount: completedTasks.length,
    overdueTasksCount: overdueTasks.length,
    teams: formattedTeams,
    upcomingDeadlines: tasks.filter(t => t.deadline && t.status !== 'COMPLETED').slice(0, 5)
  };
};
