import Supplier from '../model/supplier.model.js';

const saveSupplier = async (data) => {
  const supplier = new Supplier(data);
  return await supplier.save();
};

export default {
  saveSupplier
};
