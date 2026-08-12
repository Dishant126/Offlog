import mongoose from 'mongoose';

const fileUploadSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const FileUpload = mongoose.model('FileUpload', fileUploadSchema);
export default FileUpload;
