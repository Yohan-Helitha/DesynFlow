import InvLocations from '../model/invLocationsModel.js';
//import { validateInvLocationsInsert, validateInvLocationsUpdate } from '../validators/invLocationsValidator.js';

// Get all inventory locations
export const getAllInvLocationsService = async () => {
  return await InvLocations.find();
};

// Get a single product by ID
export const getInvLocationByIdService = async (id) => {
  const product = await InvLocations.findById(id);
  return product; // null if not found
};

// Add new inventory location
export const addInvLocationsService = async (data) => {
  // Validate
  // const errors = validateInvLocationsInsert(data);
  // if (errors.length > 0) {
  //   const error = new Error(errors.join(', '));
  //   error.status = 400;
  //   throw error;
  // }

  // Check for duplicate address
  const existing = await InvLocations.findOne({ inventoryAddress: data.inventoryAddress });
  if (existing) {
    const error = new Error('Inventory address already exists');
    error.status = 400;
    throw error;
  }

  const inv_locations = new InvLocations({ ...data });
  await inv_locations.save();
  return inv_locations;
};

// Update inventory location
export const updateInvLocationsService = async (id, data) => {
  // Validate
  // const errors = validateInvLocationsUpdate(data);
  // if (errors.length > 0) {
  //   const error = new Error(errors.join(', '));
  //   error.status = 400;
  //   throw error;
  // }

  const inv_locations = await InvLocations.findByIdAndUpdate(id, { ...data }, { new: true });
  if (!inv_locations) return null;

  return inv_locations;
};

// Delete inventory location
export const deleteInvLocationsService = async (id) => {
  const inv_locations = await InvLocations.findByIdAndDelete(id);
  if (!inv_locations) return null;
  return inv_locations;
};
