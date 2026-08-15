import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (req.uploadType === 'avatar') {
      cb(null, path.join(uploadPath, 'avatars'));
    } else if (req.uploadType === 'team-logo') {
      cb(null, path.join(uploadPath, 'team-logos'));
    } else {
      cb(null, uploadPath);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|xls|xlsx|ppt|pptx|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, XLS, PPT, ZIP, Images'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFileFilter
});

export const documentUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: documentFileFilter
});

export const setUploadType = (type) => (req, res, next) => {
  req.uploadType = type;
  next();
};
