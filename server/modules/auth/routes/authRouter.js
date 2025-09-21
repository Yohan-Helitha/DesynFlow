import express from "express";

import {
	registerUser,
	loginUser,
	requestPasswordReset,
	resetPassword,
	verify2FA
} from "../controller/authController.js";

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verify2FA);

export default router;