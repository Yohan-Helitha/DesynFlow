import User from "../model/user.model.js";
import Supplier from "../../supplier/model/supplier.model.js"; // Added for supplier authentication
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
    
    // First try User collection (existing logic - unchanged)
    let user = await User.findOne({ email: cleanEmail });
    let userType = 'user';
    
    // If not found in User collection, try Supplier collection
    if (!user) {
      user = await Supplier.findOne({ email: cleanEmail });
      userType = 'supplier';
    }
    
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Check if user/supplier is active
    if (!user.isActive) return res.status(400).json({ message: "Account is deactivated" });

    // Generate JWT token with userType info
    const token = jwt.sign({ 
      id: user._id, 
      role: userType === 'supplier' ? 'supplier' : user.role,
      userType 
    }, JWT_SECRET, { expiresIn: "1h" });
    
    // Return token and user info based on type
    if (userType === 'supplier') {
      res.json({ 
        token,
        user: {
          id: user._id,
          email: user.email,
          role: 'supplier',
          name: user.contactName,
          companyName: user.companyName,
          phone: user.phone,
          userType: 'supplier'
        }
      });
    } else {
      // Original user response (unchanged)
      res.json({ 
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
          userType: 'user'
        }
      });
    }
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

    // Send OTP via email (with graceful handling for development)
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP for resetting password is: <b>${otp}</b></p>`,
      });
      
      // Check if SMTP is configured for response message
      const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
      const message = hasSmtpConfig 
        ? "OTP has been sent to your email." 
        : `Development Mode: OTP is ${otp} (Check server console)`;
        
      res.json({ message });
    } catch (emailError) {
      console.error('Email sending failed, but continuing with OTP generation:', emailError.message);
      // Still return success but mention the issue
      res.json({ 
        message: `OTP generated: ${otp} (Email service unavailable - use this OTP directly)`,
        developmentOtp: otp // Include OTP in response for development
      });
    }
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
