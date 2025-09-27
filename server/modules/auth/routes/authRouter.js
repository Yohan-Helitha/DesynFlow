import express from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/request-password-reset", requestPasswordReset); // send OTP
router.post("/reset-password", resetPassword); // verify OTP + reset

export default router;
