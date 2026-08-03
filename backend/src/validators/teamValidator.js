import { body, param } from 'express-validator';

export const createTeamValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Team name is required')
    .isLength({ max: 100 }).withMessage('Team name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('visibility')
    .optional()
    .isIn(['PUBLIC', 'PRIVATE']).withMessage('Visibility must be PUBLIC or PRIVATE')
];

export const updateTeamValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Team name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('visibility')
    .optional()
    .isIn(['PUBLIC', 'PRIVATE']).withMessage('Visibility must be PUBLIC or PRIVATE'),
  body('allowJoinRequests')
    .optional()
    .isBoolean().withMessage('allowJoinRequests must be a boolean')
];

export const joinRequestValidator = [
  body('joinCode')
    .trim()
    .notEmpty().withMessage('Join code is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Message cannot exceed 300 characters')
];

export const teamIdParamValidator = [
  param('teamId')
    .notEmpty().withMessage('Team ID is required')
    .isMongoId().withMessage('Invalid team ID')
];
