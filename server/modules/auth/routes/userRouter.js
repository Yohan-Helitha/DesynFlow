import express from "express";

import {
	getUserProfile,
	updateUserProfile,
	getAllUsers,
	setActiveStatus
} from "../controller/userController.js";


import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);

router.put("/profile", authMiddleware, updateUserProfile);

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

router.patch("/activate", authMiddleware, roleMiddleware(["admin"]), setActiveStatus);

export default router;
