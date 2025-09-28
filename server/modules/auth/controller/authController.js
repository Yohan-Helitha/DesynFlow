import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../../../utils/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET;

// --------------------------- REGISTER USER ---------------------------
export const registerUser = async (req, res) => {
  const { username, email, password, phone, role } = req.body;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { phone }] });
    if (userExists) return res.status(400).json({ message: "Email or phone already registered." });

    const newUser = new User({
      username,
      email: cleanEmail,
      password: password, // Let pre-save hook handle hashing
      phone,
      role: role || "client",
      isActive: true,
    });

    await newUser.save();
    
    // Generate JWT token for immediate login
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: "1h" });
    
    res.status(201).json({ 
      message: "Registration successful.",
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------- LOGIN ---------------------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Check if user is active
    if (!user.isActive) return res.status(400).json({ message: "Account is deactivated" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    
    // Return token and user info (excluding sensitive data)
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------- FORGOT PASSWORD (OTP) ---------------------------
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP for resetting password is: <b>${otp}</b></p>`,
    });

    res.json({ message: "OTP has been sent to your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------------- RESET PASSWORD USING OTP ---------------------------
export const resetPassword = async (req, res) => {
  const { otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
