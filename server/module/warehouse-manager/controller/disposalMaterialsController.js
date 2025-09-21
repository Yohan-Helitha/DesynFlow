import {
  getAllDisposalMaterialsService,
  addDisposalMaterialsService,
  getDisposalRecordByIdService,
  updateDisposalMaterialsService,
  deleteDisposalMaterialsService
} from '../service/disposalMaterialsService.js';


import RawMaterialsModel from '../model/rawMaterialsModel.js';
import ManuProductsModel from "../model/manuProductsModel.js";
import InvLocationsModel from '../model/invLocationsModel.js';

// //  // Helper: check material stock
//  const getMaterialStock = async (materialId, inventoryId) => {
//      return await RawMaterialsModel.findOne({ materialId, inventoryId });
//  };

// // // Helper: check inventory exists
//  const isValidInventory = async (inventoryId) => {
// //     // If your invLocationsModel _id is ObjectId, you CANNOT pass a string like "INV005" directly
//      return await InvLocationsModel.findOne({ inventoryId }); 
// //     // <-- Use `inventoryId` field, not `_id`, if you store custom IDs like "INV005"
//  };


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

// Get  disposal material by id
export const getDisposalMaterialsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Look in RawMaterials
    let material = await RawMaterialsModel.findOne({ materialId: id });
    if (!material) {
      // If not in Raw, check Manufactured
      material = await ManuProductsModel.findOne({ materialId: id });
    }

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Extract inventory names from material
    let invNames = [];
    if (material.inventoryName && Array.isArray(material.inventoryName)) {
      invNames = material.inventoryName;
    } else if (material.inventoryName) {
      invNames = [material.inventoryName];
    }

    // Find inventories by name
    const inventories = await InvLocationsModel.find({
      inventoryName: { $in: invNames }
    }).select("inventoryId inventoryName -_id");


    return res.status(200).json({
      materialName: material.materialName,
      unit: material.unit,
      inventories
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getDisposalRecordById = async (req, res) => {
  try {
    const material = await getDisposalRecordByIdService(req.params.id);
    if (!material) return res.status(404).json({ message: "Material not found" });
    return res.status(200).json(material);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Add disposal material
export const addDisposalMaterials = async (req, res) => {
  try {
    const disposal_materials = await addDisposalMaterialsService(
      req.body,
      req.warehouseManagerName,
      req.managerName
    );

    return res.status(201).json({ message: "Disposal Material added", disposal_materials });
  } catch (err) {
    console.error(err);
     if (err.status === 400 && err.errors) {
       return res.status(400).json({ errors: err.errors });
     }
    return res.status(500).json({ message: "Unable to insert data" });
  }
};

// Update disposal material
export const updateDisposalMaterials = async (req, res) => {
  try {

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
     if (err.status === 400 && err.errors) {
       return res.status(400).json({ errors: err.errors });
     }
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
