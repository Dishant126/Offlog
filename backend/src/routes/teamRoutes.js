import express from 'express';
import {
  createTeam, getTeam, getMyTeams, getPublicTeams, updateTeam, deleteTeam,
  uploadTeamLogo, regenerateCode, requestJoin, getJoinRequests,
  respondJoinRequest, removeMember, updateMemberRole, transferLeadership, leaveTeam, joinPublicTeam,
  getTeamActivities, cancelJoinRequest
} from '../controllers/teamController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTeamValidator, updateTeamValidator, joinRequestValidator, teamIdParamValidator } from '../validators/teamValidator.js';
import { upload, setUploadType } from '../middlewares/upload.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createTeamValidator), createTeam);
router.get('/my-teams', getMyTeams);
router.get('/public', getPublicTeams);
router.get('/:teamId', validate(teamIdParamValidator), getTeam);
router.get('/:teamId/activities', validate(teamIdParamValidator), getTeamActivities);
router.put('/:teamId', validate([...teamIdParamValidator, ...updateTeamValidator]), updateTeam);
router.delete('/:teamId', validate(teamIdParamValidator), deleteTeam);
router.post('/:teamId/logo', validate(teamIdParamValidator), setUploadType('team-logo'), upload.single('logo'), uploadTeamLogo);
router.post('/:teamId/regenerate-code', validate(teamIdParamValidator), regenerateCode);
router.post('/:teamId/join', validate(teamIdParamValidator), joinPublicTeam);
router.post('/join', validate(joinRequestValidator), requestJoin);
router.delete('/join-requests/:requestId', cancelJoinRequest);
router.get('/:teamId/join-requests', validate(teamIdParamValidator), getJoinRequests);
router.put('/:teamId/join-requests/:requestId', validate(teamIdParamValidator), respondJoinRequest);
router.delete('/:teamId/members/:memberId', validate(teamIdParamValidator), removeMember);
router.put('/:teamId/members/:memberId/role', validate(teamIdParamValidator), updateMemberRole);
router.post('/:teamId/transfer-leadership', validate(teamIdParamValidator), transferLeadership);
router.post('/:teamId/leave', validate(teamIdParamValidator), leaveTeam);

export default router;
