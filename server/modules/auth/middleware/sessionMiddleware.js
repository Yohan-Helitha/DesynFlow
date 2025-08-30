
const SESSION_TIMEOUT_MINUTES = 30; 

export default function sessionMiddleware(req, res, next) {
	
	if (!req.user) {
        
        return next();

    } 

	const now = Date.now();
	
	if (!req.session) req.session = {};

	if (req.session.lastActivity) {
		const diffMinutes = (now - req.session.lastActivity) / (1000 * 60);
		if (diffMinutes > SESSION_TIMEOUT_MINUTES) {
			
			return res.status(440).json({ message: "Session expired due to inactivity" });
		}
	}
	req.session.lastActivity = now;
	next();
}
