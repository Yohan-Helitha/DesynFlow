import Supplier from '../model/supplier.model.js';

const createSupplier = async (data) => {
  const supplier = new Supplier({ ...data, status: 'Pending' });
  return await supplier.save();
};

const updateSupplier = async (id, data) => {
  return await Supplier.findByIdAndUpdate(id, data, { new: true });
};

const approveSupplier = async (id, status) => {
  if (!['Approved', 'Rejected'].includes(status)) throw new Error('Invalid status');
  return await Supplier.findByIdAndUpdate(id, { status }, { new: true });
};

const getAllSuppliers = async () => {
  return await Supplier.find();
};

export default {
  createSupplier,
  updateSupplier,
  approveSupplier,
  getAllSuppliers
};
