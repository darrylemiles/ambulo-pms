import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';
import { 
  authUser,
  createUser, 
  getUsers, 
  getSingleUserById, 
  updateSingleUserById, 
  deleteUserById } from '../controllers/usersControllers.js';

import createUploadMiddleware from '../middlewares/multer/uploadMiddleware.js';
const router = express.Router();

router.use(authenticateToken);

router.post('/login', authUser);

router.post(
  '/create-user', requireRole('ADMIN'),
  createUploadMiddleware({
    fields: [
      { name: 'avatar', maxCount: 1 },
    ],
    fieldFolders: {
      avatar: 'user_avatars',
    },
  }),
//   createValidator,
  createUser
);

router.get('/', requireRole('ADMIN'), getUsers);
router.get('/:user_id', getSingleUserById);

router.patch(
  '/:user_id',
  createUploadMiddleware({
    fields: [
      { name: 'avatar', maxCount: 1 },
    ],
    fieldFolders: {
      avatar: 'user_avatars',
    },
  }),
  updateSingleUserById
);

router.delete('/:user_id', requireRole('ADMIN'), deleteUserById);

export default router;