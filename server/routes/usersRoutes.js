import express from 'express';
import { 
    createUser, 
    getUsers, 
    getSingleUserById, 
    updateSingleUserById, 
    deleteUserById } from '../controllers/usersControllers.js';

import createUploadMiddleware from '../middlewares/multer/uploadMiddleware.js';
const router = express.Router();

router.post(
  '/create-user',
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

router.get('/', getUsers);
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

router.delete('/:user_id', deleteUserById)

export default router;