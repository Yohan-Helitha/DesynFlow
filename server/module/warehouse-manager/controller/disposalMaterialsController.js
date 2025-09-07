import {
  getAllDisposalMaterialsService,
  addDisposalMaterialsService,
  updateDisposalMaterialsService,
  deleteDisposalMaterialsService
} from '../service/disposalMaterialsService.js';
// import {
//   validateDisposalMaterialsInsert,
//   validateDisposalMaterialsUpdate
// } from '../validators/disposalMaterialsValidator.js';


// Get all disposal materials
export const getAllDisposalMaterials = async (req, res) => {
  try {
    const disposal_materials = await getAllDisposalMaterialsService();
    if (disposal_materials.length === 0) {
      return res.status(404).json({ message: "Disposal Materials not found" });
    }
    return res.status(200).json({ disposal_materials });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add disposal material
export const addDisposalMaterials = async (req, res) => {
  try {
    // Validate input
    const errors = await validateDisposalMaterialsInsert(req.body, getMaterialStock, isValidInventory);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation errors", errors });
    }

    const disposal_materials = await addDisposalMaterialsService(
      req.body,
      req.warehouseManagerName,
      req.managerName
    );

    return res.status(201).json({ message: "Disposal Material added", disposal_materials });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to insert data" });
  }
};

// Update disposal material
export const updateDisposalMaterials = async (req, res) => {
  try {
    // Validate input
    const errors = await validateDisposalMaterialsUpdate(req.body, getMaterialStock, isValidInventory);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation errors", errors });
    }

    const disposal_materials = await updateDisposalMaterialsService(
      req.params.id,
      req.body,
      req.warehouseManagerName
    );

    if (!disposal_materials) {
      return res.status(404).json({ message: "Unable to update Disposal Materials" });
    }

    return res.status(200).json({ disposal_materials });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete disposal material
export const deleteDisposalMaterials = async (req, res) => {
  try {
    const disposal_materials = await deleteDisposalMaterialsService(
      req.params.id,
      req.warehouseManagerName
    );

    if (!disposal_materials) {
      return res.status(404).json({ message: "Unable to delete Disposal Materials" });
    }

    return res.status(200).json({ disposal_materials });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
