import {
    getAllRawMaterialsService,
    getRawMaterialByIdService,
    addRawMaterialsService,
    updateRawMaterialsService,
    deleteRawMaterialsService
} from '../service/rawMaterialsService.js';

// Get all raw materials
export const getAllRawMaterials = async (req, res) => {
    try {
        const raw_materials = await getAllRawMaterialsService();
        if (raw_materials.length === 0) {
            return res.status(404).json({ message: "Raw Materials not found" });
        }
        return res.status(200).json({ raw_materials });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get single manufactured raw materials by ID
export const getRawMaterialById = async (req, res) => {
  try {
    const raw_materials = await getRawMaterialByIdService(req.params.id);
    if (!raw_materials) return res.status(404).json({ message: "Material not found" });
    return res.status(200).json(raw_materials);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add raw material
export const addRawMaterials = async (req, res) => {
    try {
        const raw_materials = await addRawMaterialsService(req.body, req.userId);
        return res.status(201).json({ message: "Material added", raw_materials });
    } catch (err) {
        console.error(err);
         if (err.status === 400 && err.errors) {
             return res.status(400).json({ errors: err.errors });
         }
        return res.status(500).json({ message: "Unable to insert data" });
    }
};

// Update raw material
export const updateRawMaterials = async (req, res) => {
    try {
        const raw_materials = await updateRawMaterialsService(req.params.id, req.body, req.userId);
        
        if (!raw_materials) {
            return res.status(404).json({ message: "Unable to update Raw Material" });
        }

        return res.status(200).json({ raw_materials });
    } catch (err) {
        console.error(err);
        if (err.status === 400 && err.errors) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ message: "Server error" });

    }
};

// Delete raw material
export const deleteRawMaterials = async (req, res) => {
    try {
        const raw_materials = await deleteRawMaterialsService(req.params.id, req.userId);
        if (!raw_materials) {
            return res.status(404).json({ message: "Unable to delete Raw Material" });
        }
        return res.status(200).json({ raw_materials });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
