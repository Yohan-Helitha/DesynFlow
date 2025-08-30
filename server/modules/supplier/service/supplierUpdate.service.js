import Supplier from '../model/supplier.model.js';

const updateSupplier = async (id, data) => {
  return await Supplier.findByIdAndUpdate(id, data, { new: true });
};

export default {
  updateSupplier
};
