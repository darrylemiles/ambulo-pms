import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid';

const createUploadMiddleware = ({ fields = [], fieldFolders = {} }) => {
  const allowedFormats = [
    'jpg', 'jpeg', 'png', 'svg', 'svg+xml', 'heic',
    'pdf', 'doc', 'docx',
    'ppt', 'pptx',
    'xls', 'xlsx',
    'mp4', 'mov', 'avi',
  ];

  const mimeToExtension = {
    'jpeg': 'jpeg',
    'jpg': 'jpg',
    'png': 'png',
    'svg': 'svg',
    'svg+xml': 'svg',
    'heic': 'heic',
    'pdf': 'pdf',
    'msword': 'doc',
    'vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'vnd.ms-powerpoint': 'ppt',
    'vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'vnd.ms-excel': 'xls',
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'mp4': 'mp4',
    'quicktime': 'mov',
    'x-msvideo': 'avi',
  };

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const mimePart = file.mimetype.split('/')[1];
      const ext = mimeToExtension[mimePart] || mimePart;

      const isRawFile = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);
      const isVideoFile = ['mp4', 'mov', 'avi'].includes(ext);

      const folder = fieldFolders[file.fieldname] || 'uploads';

      return {
        folder,
        public_id: uuidv4(),
        format: ext,
        resource_type: isRawFile ? 'raw' : isVideoFile ? 'video' : 'image',
      };
    },
  });

  const fileFilter = (req, file, cb) => {
    const fileExtension = file.mimetype.split('/')[1]?.toLowerCase();
    const normalizedExtension = mimeToExtension[fileExtension] || fileExtension;

    if (allowedFormats.includes(normalizedExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file format: ${fileExtension}. Allowed formats: ${allowedFormats.join(', ')}`
        ),
        false
      );
    }
  };

  const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

  return (req, res, next) => {
    const handler = upload.fields(fields);
    handler(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

export default createUploadMiddleware;