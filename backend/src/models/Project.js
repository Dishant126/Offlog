import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Project Setup'
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
    default: 'NOT_STARTED'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
