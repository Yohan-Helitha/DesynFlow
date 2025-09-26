import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Generate a JWT token for a user
export function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify a JWT token
export function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (err) {
		return null;
	}
}

// Optionally, invalidate tokens (for blacklisting, implement a store)
// export function invalidateToken(token) { ... }
