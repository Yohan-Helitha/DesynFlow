import {
  getAllInvLocationsService,
  getInvLocationByIdService,
  addInvLocationsService,
  updateInvLocationsService,
  deleteInvLocationsService
} from '../service/invLocationsService.js';

// Get all inventory locations
export const getAllInvLocations = async (req, res) => {
  try {
    const inv_locations = await getAllInvLocationsService();
    if (inv_locations.length === 0) {
      return res.status(404).json({ message: "Inventory Location not found" });
    }
    return res.status(200).json({ inv_locations });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

// Get  by ID
export const getInvLocationById = async (req, res) => {
  try {
    const location = await getInvLocationByIdService(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });
    return res.status(200).json(location);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add inventory location
export const addInvLocations = async (req, res) => {
  try {
    const inv_locations = await addInvLocationsService(req.body);
    return res.status(201).json({ message: "Inventory Location added", inv_locations });
  } catch (err) {
    if (err.status === 400 && err.errors) {
       return res.status(400).json({ errors: err.errors });
     }
    return res.status(500).json({ message: "Unable to insert data" });
  }
};

// Update inventory location
export const updateInvLocations = async (req, res) => {
  try {
    const inv_locations = await updateInvLocationsService(req.params.id, req.body);

    if (!inv_locations) {
      return res.status(404).json({ message: "Unable to update Inventory Locations" });
    }

    return res.status(200).json({ inv_locations });
  } catch (err) {
    console.error(err);
     if (err.status === 400 && err.errors) {
       return res.status(400).json({ errors: err.errors });
     }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete inventory location
export const deleteInvLocations = async (req, res) => {
  try {
    const inv_locations = await deleteInvLocationsService(req.params.id);
    if (!inv_locations) {
      return res.status(404).json({ message: "Unable to delete Inventory Location" });
    }
    return res.status(200).json({ inv_locations });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};
