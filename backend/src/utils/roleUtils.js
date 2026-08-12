export const normalizeSignupRole = (role) => {
  const normalized = typeof role === 'string' ? role.trim().toUpperCase() : '';
  return normalized === 'USER' ? 'USER' : 'USER';
};

export const canManageMemberRoles = (actorRole, targetRole, nextRole) => {
  if (actorRole === 'ADMIN') return true;
  if (actorRole !== 'TEAM_LEADER' && actorRole !== 'MENTOR') return false;
  if (targetRole === 'TEAM_LEADER') return false;
  return ['MEMBER', 'MENTOR'].includes(nextRole);
};
