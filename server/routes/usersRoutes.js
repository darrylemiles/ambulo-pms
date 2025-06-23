import express from 'express';
import { createUser, getUsers, getSingleUserById, updateSingleUserById, deleteUserById } from '../controllers/usersControllers.js';

const router = express.Router();

router.post('/create-user', createUser);
router.get('/', getUsers);
router.get('/:userId', getSingleUserById);
router.patch('/:userId', updateSingleUserById);
router.delete('/:userId', deleteUserById)

export default router;