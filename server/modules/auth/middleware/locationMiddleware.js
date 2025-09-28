
import InspectorLocation from '../model/inspectorLocation.model.js';
import haversine from 'haversine-distance'; // You need to install this package or use your own distance function

// Middleware to update inspector's live location
export const updateInspectorLocation = async (req, res, next) => {
	try {
		const { inspectorId, lat, lng, status } = req.body;
		if (!inspectorId || lat === undefined || lng === undefined) {
			return res.status(400).json({ message: 'Missing required fields.' });
		}
		const update = {
			location: { type: 'Point', coordinates: [lng, lat] },
			status: status || 'available',
			updatedAt: new Date(),
		};
		await InspectorLocation.findOneAndUpdate(
			{ inspector: inspectorId },
			update,
			{ upsert: true, new: true }
		);
		next();
	} catch (error) {
		res.status(500).json({ message: 'Failed to update location', error: error.message });
	}
};

// Middleware to find nearest available inspector
export const findNearestAvailableInspector = async (req, res, next) => {
	try {
		const { lat, lng, maxDistance = 10000 } = req.body; // maxDistance in meters
		if (lat === undefined || lng === undefined) {
			return res.status(400).json({ message: 'Missing coordinates.' });
		}
		const inspectors = await InspectorLocation.find({ status: 'available' });
		let nearest = null;
		let minDist = Infinity;
		for (const inspector of inspectors) {
			if (inspector.location && inspector.location.coordinates) {
				const [ilng, ilat] = inspector.location.coordinates;
				const dist = haversine({ lat, lng }, { lat: ilat, lng: ilng });
				if (dist < minDist && dist <= maxDistance) {
					minDist = dist;
					nearest = inspector;
				}
			}
		}
		if (!nearest) {
			return res.status(404).json({ message: 'No available inspector found nearby.' });
		}
		req.nearestInspector = nearest;
		next();
	} catch (error) {
		res.status(500).json({ message: 'Failed to find nearest inspector', error: error.message });
	}
};
