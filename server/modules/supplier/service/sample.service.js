import Sample from '../model/sampleOrder.model.js';

const uploadSample = async (data) => {
  const mongoose = (await import('mongoose')).default;
  if (!data.supplierId || !mongoose.Types.ObjectId.isValid(data.supplierId)) {
    throw new Error('Invalid or missing supplierId');
  }
  if (!data.materialId || !mongoose.Types.ObjectId.isValid(data.materialId)) {
    throw new Error('Invalid or missing materialId');
  }
  if (!data.requestedBy || !mongoose.Types.ObjectId.isValid(data.requestedBy)) {
    throw new Error('Invalid or missing requestedBy');
  }
  const sample = new Sample({
    ...data,
    supplierId: mongoose.Types.ObjectId(data.supplierId),
    materialId: mongoose.Types.ObjectId(data.materialId),
    requestedBy: mongoose.Types.ObjectId(data.requestedBy)
  });
  return await sample.save();
};

const reviewSample = async (id, { status, reviewNote }) => {
  if (!['Approved', 'Rejected'].includes(status)) throw new Error('Invalid status');
  return await Sample.findByIdAndUpdate(id, { status, reviewNote }, { new: true });
};

const getSamples = async (supplierId) => {
  return await Sample.find({ supplierId });
};

export default {
  uploadSample,
  reviewSample,
  getSamples
};
