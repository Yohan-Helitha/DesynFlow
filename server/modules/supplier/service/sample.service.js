import Sample from '../model/sampleOrder.model.js';

const uploadSample = async (data) => {
  try {
    const mongoose = (await import('mongoose')).default;
    
    // Validate required fields
    if (!data.supplierId) {
      throw new Error('Supplier ID is required');
    }
    if (!data.materialId) {
      throw new Error('Material ID is required');
    }
    if (!data.requestedBy) {
      throw new Error('Requested By is required');
    }
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(data.supplierId)) {
      throw new Error(`Invalid supplier ID format: ${data.supplierId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(data.materialId)) {
      throw new Error(`Invalid material ID format: ${data.materialId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(data.requestedBy)) {
      throw new Error(`Invalid requester ID format: ${data.requestedBy}`);
    }
    
    // Create sample document
    const sample = new Sample({
      supplierId: new mongoose.Types.ObjectId(data.supplierId),
      materialId: new mongoose.Types.ObjectId(data.materialId),
      requestedBy: new mongoose.Types.ObjectId(data.requestedBy),
      reviewNote: data.reviewNote || '',
      status: 'Requested'
    });
    
    return await sample.save();
  } catch (error) {
    console.error('Error in uploadSample service:', error);
    throw error;
  }
};

const reviewSample = async (id, { status, reviewNote }) => {
  if (!['Approved', 'Rejected'].includes(status)) throw new Error('Invalid status');
  return await Sample.findByIdAndUpdate(id, { status, reviewNote }, { new: true });
};

const getSamples = async (supplierId) => {
  return await Sample.find({ supplierId });
};

const getAllSamples = async () => {
  return await Sample.find({})
    .populate('supplierId', 'companyName name')
    .populate('materialId', 'materialName name')
    .populate('requestedBy', 'name email')
    .sort({ createdAt: -1 });
};

export default {
  uploadSample,
  reviewSample,
  getSamples,
  getAllSamples
};
