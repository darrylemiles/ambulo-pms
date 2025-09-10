import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { 
  authUser,
  logoutUser,
  createUser, 
  getUsers, 
  getSingleUserById, 
  updateSingleUserById, 
  deleteUserById } from '../controllers/usersControllers.js';

import createUploadMiddleware from '../middlewares/multer/uploadMiddleware.js';
const router = express.Router();

router.post('/login', authUser);
router.post('/logout', logoutUser);

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
  protect,
  createUser
);

router.get('/', getUsers);
router.get('/:user_id', getSingleUserById);

router.patch(
  '/:user_id',
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
  protect,
  updateSingleUserById
);

router.delete('/:user_id', protect, deleteUserById);

export default router;