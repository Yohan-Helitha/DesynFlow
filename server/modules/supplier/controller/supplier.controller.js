
import SupplierService from '../service/supplier.service.js';

// Add new supplier
export const addSupplier = async (req, res) => {
  try {
    const supplier = await SupplierService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update supplier details
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierService.getAllSuppliers();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
  // Delete supplier
  export const deleteSupplier = async (req, res) => {
    try {
      await SupplierService.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
