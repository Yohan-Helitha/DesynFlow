import SupplierStoreService from '../service/supplierStore.service.js';

// Store new supplier data
export const storeSupplier = async (req, res) => {
  try {
    const supplier = await SupplierStoreService.saveSupplier(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
