import express from 'express';
import { registerUser } from '../controllers/userController.js';
import upload from '../config/multer.js'; // Import multer config

const router = express.Router();

// Route for user registration with file upload
router.post('/register', upload.single('profilePicture'), registerUser);

export default router;
