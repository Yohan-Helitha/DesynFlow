import InspectorLocation from '../model/inspectorLocation.model.js';
import User from '../model/user.model.js';

// Update or create inspector's live location
export const updateLocation = async (req, res) => {
  try {
    const { inspectorId, lat, lng, status, address, region } = req.body;
    if (!inspectorId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Upsert location
    const updateData = {
      inspector_latitude: lat,
      inspector_longitude: lng,
      updateAt: new Date(),
      status: status || 'available'
    };
    
    // Add address if provided
    if (address) {
      updateData.current_address = address;
    }
    
    // Add region if provided
    if (region) {
      updateData.region = region;
    }
    
    const location = await InspectorLocation.findOneAndUpdate(
      { inspector_ID: inspectorId },
      updateData,
      { new: true, upsert: true }
    );
    res.status(200).json({ message: 'Location updated.', location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all inspectors' locations (for CSR dashboard)
export const getAllLocations = async (req, res) => {
  try {
    const locations = await InspectorLocation.find({ status: { $ne: 'offline' } })
      .populate('inspector_ID', 'username email phone role');
    res.status(200).json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single inspector's location
export const getInspectorLocation = async (req, res) => {
  try {
    const { inspectorId } = req.params;
    const location = await InspectorLocation.findOne({ inspector_ID: inspectorId })
      .populate('inspector_ID', 'name email phone role');
    if (!location) return res.status(404).json({ message: 'Location not found.' });
    res.status(200).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};