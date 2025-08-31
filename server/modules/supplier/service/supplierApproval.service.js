import Supplier from '../model/supplier.model.js';

const updateSupplierStatus = async (id, status) => {
  if (!['Approved', 'Rejected'].includes(status)) {
    throw new Error('Status must be Approved or Rejected');
  }
  return await Supplier.findByIdAndUpdate(id, { status }, { new: true });
};

export default {
  updateSupplierStatus
};
