import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  logo: {
    type: String,
    default: null
  },
  joinCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PRIVATE'
  },
  allowJoinRequests: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for members
teamSchema.virtual('members', {
  ref: 'TeamMember',
  localField: '_id',
  foreignField: 'team'
});

// Virtual for join requests
teamSchema.virtual('joinRequests', {
  ref: 'JoinRequest',
  localField: '_id',
  foreignField: 'team'
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
