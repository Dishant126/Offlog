import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  role: {
    type: String,
    enum: ['TEAM_LEADER', 'MENTOR', 'MEMBER'],
    default: 'MEMBER'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only have one membership per team
teamMemberSchema.index({ user: 1, team: 1 }, { unique: true });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;
