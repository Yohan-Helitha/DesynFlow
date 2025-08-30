import express from "express";

import {
	getUserProfile,
	updateUserProfile,
	getAllUsers,
	setActiveStatus
} from "../controller/userController.js";

//Import your authentication and (optionally) role middleware
// import authMiddleware from "../middleware/authMiddleware.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get current user's profile
// router.get("/profile", authMiddleware, getUserProfile);

// Update current user's profile
// router.put("/profile", authMiddleware, updateUserProfile);

// Get all users (admin only)
// router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

// Activate/deactivate user (admin only)
// router.patch("/activate", authMiddleware, roleMiddleware(["admin"]), setActiveStatus);

export default router;
