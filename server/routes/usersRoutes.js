import express from 'express';
import { createUser, getUsers, getSingleUserById, updateSingleUserById, deleteUserById } from '../controllers/usersControllers.js';

const router = express.Router();

router.post('/create-user', createUser);
router.get('/', getUsers);
router.get('/:user_id', getSingleUserById);
router.patch('/:user_id', updateSingleUserById);
router.delete('/:user_id', deleteUserById)

export default router;