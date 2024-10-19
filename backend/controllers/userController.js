// controllers/userController.js
import User from '../models/User.js'; // Import your User model
import { uploadImage } from '../config/cloudinary.js'; // Cloudinary upload function
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import axios from 'axios'; // Import axios for fetching images
import { Buffer } from 'buffer'; // Import Buffer for image conversion

export const registerUser = async (req, res) => {
    try {
        console.log("Incoming registration request body:", req.body); // Log the request body
        console.log("Uploaded file:", req.file); // Log the uploaded file (if any)

        const { name, email, password, phone, userType, address, organization, dob, isGoogleSignUp } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        let profilePicture = {}; // Initialize profilePicture object

        // Function to upload profile picture to Cloudinary
        const uploadProfilePicture = async (fileBuffer) => {
            try {
                const uploadResult = await uploadImage(fileBuffer, 'space-venture/users/profile_picture');
                return {
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                };
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                throw new Error("Error uploading profile picture.");
            }
        };

        // **Separate Handling for Google and Regular Sign-Up**

        // Case 1: Google Sign-Up
        if (isGoogleSignUp === 'true') {
            // Expect the Google profile picture URL
            try {
                const googleProfilePictureUrl = req.body.profilePicture; // Google profile picture URL
                const response = await axios.get(googleProfilePictureUrl, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(response.data, 'binary'); // Convert response to buffer
                profilePicture = await uploadProfilePicture(imageBuffer); // Upload the image buffer to Cloudinary
            } catch (error) {
                console.error("Error fetching or uploading Google profile picture:", error);
                return res.status(500).json({ success: false, message: "Error uploading Google profile picture." });
            }
        }

        // Case 2: Regular Sign-Up (Form Submission)
        else if (isGoogleSignUp === 'false') {
            // Check if there's an uploaded profile picture
            if (req.file) {
                try {
                    const imageBuffer = req.file.buffer; // Use the file buffer from multer
                    profilePicture = await uploadProfilePicture(imageBuffer); // Upload the image to Cloudinary
                } catch (error) {
                    console.error("Error uploading profile picture:", error);
                    return res.status(500).json({ success: false, message: "Error uploading profile picture." });
                }
            }
            // No default case here
        }

        // Hash the password if it's not a Google sign-up
        let hashedPassword = password;
        if (isGoogleSignUp === 'false') {
            if (!password) {
                return res.status(400).json({ success: false, message: "Password is required." });
            }
            hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        }

        // Create the user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            userType,
            address,
            organization,
            dob,
            profilePicture, // This will remain empty if no profile picture is uploaded
            isGoogleSignUp: isGoogleSignUp === 'true',
        });

        await newUser.save();

        return res.status(201).json({ success: true, message: "Registration successful!" });

    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ success: false, message: "An error occurred during registration." });
    }
};
