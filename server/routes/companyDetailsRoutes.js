import express from 'express';
import { createCompanyDetails, getCompanyDetails, updateCompanyDetails } from '../controllers/companyDetailsControllers.js';

const router = express.Router();

router.post("/create", createCompanyDetails);
router.get("/", getCompanyDetails);
router.patch("/", updateCompanyDetails);

export default router;
