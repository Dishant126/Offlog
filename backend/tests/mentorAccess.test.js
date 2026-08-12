import test from 'node:test';
import assert from 'node:assert/strict';
import { isMentorAssignedToTeam } from '../src/utils/mentorAccess.js';

test('returns true when the mentor is assigned to the team', () => {
  const team = { mentors: ['64f0c4d4898d4d9c34d3c001'] };
  assert.equal(isMentorAssignedToTeam(team, '64f0c4d4898d4d9c34d3c001'), true);
});

test('returns false when the mentor is not assigned to the team', () => {
  const team = { mentors: ['64f0c4d4898d4d9c34d3c001'] };
  assert.equal(isMentorAssignedToTeam(team, '64f0c4d4898d4d9c34d3c002'), false);
});
