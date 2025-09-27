import express from "express";

import {
	getUserProfile,
	updateUserProfile,
	getAllUsers,
	setActiveStatus,
	deleteAccount
} from "../controller/userController.js";


import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getUserProfile); // Add /me endpoint for Profile component
router.get("/profile", authMiddleware, getUserProfile);

router.put("/profile", authMiddleware, updateUserProfile);

router.get("/", authMiddleware, roleMiddleware(["admin", "customer service representative"]), getAllUsers);

router.patch("/activate", authMiddleware, roleMiddleware(["admin"]), setActiveStatus);

router.delete("/account", authMiddleware, roleMiddleware(["client"]), deleteAccount);

export default router;
