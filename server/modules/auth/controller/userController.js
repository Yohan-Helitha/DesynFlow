import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import sendVerificationEmail from "../utils/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.NODE_ENV === "production" ? "7d" : "24h";


function isStrongPassword(password) {
  
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

export const registerUser = async (req, res) => {
  const { username, email, password, phone, role } = req.body;

  try {
    if (!isStrongPassword(password)) {

      return res.status(400).json({ message: "Password must be at least 8 characters and include upper/lowercase, number, and symbol." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { phone }] });

    if (userExists){

        return res.status(400).json({ message: "Email or phone already registered." });
    } 

    const hashedPassword = await bcrypt.hash(password, 12);
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

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: "Invalid or expired verification token." });

    user.isActive = true;
    user.verificationToken = undefined;

    await user.save();

    res.json({ message: "Email verified. You can now log in." });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};


export const loginUser = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase().trim() },
        { phone: emailOrPhone }
      ]
    });
    if (!user || !user.isActive) return res.status(400).json({ message: "Invalid credentials or account not active." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.email) updates.email = req.body.email.toLowerCase().trim();
    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters and include upper/lowercase, number, and symbol." });
      }
      updates.password = await bcrypt.hash(req.body.password, 12);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -verificationToken");

    if (!user) return res.status(404).json({ message: "user not found" });
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setActiveStatus = async (req, res) => {
  const { userId, isActive } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${isActive ? "activated" : "deactivated"}.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};