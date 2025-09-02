import Supplier from '../model/supplier.model.js';

const createSupplier = async (data) => {
  const supplier = new Supplier(data);
  return await supplier.save();
};

const updateSupplier = async (id, data) => {
  return await Supplier.findByIdAndUpdate(id, data, { new: true });
};

const getAllSuppliers = async () => {
  return await Supplier.find();
};

  const deleteSupplier = async (id) => {
    return await Supplier.findByIdAndDelete(id);
  };

export default {
  createSupplier,
  updateSupplier,
  getAllSuppliers
    ,deleteSupplier
};
