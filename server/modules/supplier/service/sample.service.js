import Sample from '../model/sampleOrder.model.js';

const uploadSample = async (data) => {
  const sample = new Sample(data);
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
