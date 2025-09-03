import express from "express";

import {
	registerUser,
	loginUser,
	verifyEmail,
	logoutUser,
	requestPasswordReset,
	resetPassword
} from "../controller/authController.js";

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.post("/logout", logoutUser);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verify2FA);

export default router;