import SupplierUpdateService from '../service/supplierUpdate.service.js';

// Update supplier details
export const updateSupplierDetails = async (req, res) => {
  try {
    const supplier = await SupplierUpdateService.updateSupplier(req.params.id, req.body);
    res.status(200).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
