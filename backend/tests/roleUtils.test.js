import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSignupRole, canManageMemberRoles } from '../src/utils/roleUtils.js';

test('signup always resolves to a regular user role', () => {
  assert.equal(normalizeSignupRole('MENTOR'), 'USER');
  assert.equal(normalizeSignupRole('USER'), 'USER');
  assert.equal(normalizeSignupRole(undefined), 'USER');
});

test('mentors can manage member and mentor roles but not transfer leadership', () => {
  assert.equal(canManageMemberRoles('MENTOR', 'MEMBER', 'MEMBER'), true);
  assert.equal(canManageMemberRoles('MENTOR', 'MEMBER', 'MENTOR'), true);
  assert.equal(canManageMemberRoles('MENTOR', 'TEAM_LEADER', 'MEMBER'), false);
  assert.equal(canManageMemberRoles('MENTOR', 'MEMBER', 'TEAM_LEADER'), false);
});
