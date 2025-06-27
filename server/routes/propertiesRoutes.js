import express from 'express';
import { createProperty, getProperties, getSinglePropertyById, editPropertyById, deletePropertyById } from '../controllers/propertiesControllers.js';

const router = express.Router();

router.post('/create-property', createProperty);
router.get('/', getProperties);
router.get('/:property_id', getSinglePropertyById);
router.patch('/:property_id', editPropertyById);
router.delete('/:property_id', deletePropertyById);

export default router;