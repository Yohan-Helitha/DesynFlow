import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../../../utils/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.NODE_ENV === "production" ? "7d" : "24h";

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

// --------------------------- REGISTER USER ---------------------------
export const registerUser = async (req, res) => {
  const { username, email, password, phone, role } = req.body;
  try {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include upper/lowercase, number, and symbol." });
    }

    const cleanEmail = email.trim();
    const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { phone }] });

    if (userExists) {
      return res.status(400).json({ message: "Email or phone already registered." });
    } 

    const hashedPassword = await bcrypt.hash(password, 8);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      username,
      email: cleanEmail,
      password: hashedPassword,
      phone,
      role: role || "client",
      isActive: false,
      verificationToken
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful. Please verify your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------- LOGIN USER (WITH 2FA) ---------------------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Generate 2FA PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorPin = pin;
    user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // ✅ Send 2FA email
    await sendEmail({
      to: user.email,
      subject: "Your 2FA PIN",
      html: `<p>Your verification code is: <b>${pin}</b></p>`,
    });

    // ✅ Return require2FA flag for frontend
    return res.status(200).json({ 
      message: "2FA PIN sent to your email.",
      require2FA: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------- VERIFY 2FA PIN ---------------------------
export const verify2FA = async (req, res) => {
  const { email, pin } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.twoFactorPin || !user.twoFactorExpires) {
      return res.status(400).json({ message: "2FA not initiated." });
    }

    if (user.twoFactorPin !== pin || user.twoFactorExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired PIN." });
    }

    // Clear 2FA fields
    user.twoFactorPin = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "30m" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------- PASSWORD RESET ---------------------------
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href='${resetLink}'>here</a> to reset your password. This link will expire in 1 hour.</p>`
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
