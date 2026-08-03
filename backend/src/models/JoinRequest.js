import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  message: {
    type: String,
    maxlength: [300, 'Message cannot exceed 300 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate pending requests
joinRequestSchema.index({ user: 1, team: 1, status: 1 });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
export default JoinRequest;
