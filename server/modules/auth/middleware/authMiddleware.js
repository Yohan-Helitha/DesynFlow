import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const authMiddleware = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {

		return res.status(401).json({ message: "No token provided" });
	}
	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const user = await User.findById(decoded.id).select("-password");

		if (!user || !user.isActive) {

			return res.status(401).json({ message: "User not found or inactive" });
		}

		req.user = user;
		next();

	} catch (error) {
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};

// Role-based access control middleware
export const roleMiddleware = (roles = []) => {

	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {

			return res.status(403).json({ message: "Access denied: insufficient permissions" });
		}
		next();
	};
};
