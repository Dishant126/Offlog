import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['JOIN_REQUEST', 'JOIN_ACCEPTED', 'JOIN_REJECTED', 'ROLE_CHANGED', 'REMOVED_FROM_TEAM', 'MEMBER_REMOVED', 'LEADERSHIP_TRANSFERRED', 'TEAM_DELETED', 'TEAM_JOINED', 'TEAM_LEFT', 'TASK_COMPLETED', 'SYSTEM'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
