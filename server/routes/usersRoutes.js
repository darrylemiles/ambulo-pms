import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import { 
  authUser,
  logoutUser, // ADD THIS
  createUser, 
  getUsers, 
  getSingleUserById, 
  updateSingleUserById, 
  deleteUserById } from '../controllers/usersControllers.js';

import createUploadMiddleware from '../middlewares/multer/uploadMiddleware.js';
const router = express.Router();

router.post('/login', authUser);
router.post('/logout', logoutUser); // ADD THIS LINE

router.post(
  '/create-user',
  createUploadMiddleware({
    fields: [
      { name: 'avatar', maxCount: 1 },
      { name: 'tenant_id_file', maxCount: 4 }
    ],
    fieldFolders: {
      avatar: 'user_avatars',
      tenant_id_file: 'tenant_id_files'
    },
  }),
  createUser
);

router.get('/', authenticateToken, getUsers);
router.get('/:user_id', getSingleUserById);

router.patch(
  '/:user_id',
  createUploadMiddleware({
    fields: [
      { name: 'avatar', maxCount: 1 },
      { name: 'tenant_id_file', maxCount: 1 }
    ],
    fieldFolders: {
      avatar: 'user_avatars',
      tenant_id_file: 'tenant_id_files'
    },
  }),
  updateSingleUserById
);

router.delete('/:user_id', deleteUserById);

export default router;