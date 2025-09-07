import express from 'express';
import {
    createAboutUs,
    getAboutUs,
    updateAboutUs
} from "../controllers/aboutUsControllers.js"

const router = express.Router();

router.post('/create-about-us', createAboutUs);
router.get('/', getAboutUs);
router.patch('/:id', updateAboutUs);

export default router;