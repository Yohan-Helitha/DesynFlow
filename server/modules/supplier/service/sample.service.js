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
  if (!['Approved', 'Rejected', 'Dispatched'].includes(status)) throw new Error('Invalid status');
  
  const sample = await Sample.findByIdAndUpdate(id, { 
    status, 
    reviewNote,
    reviewedAt: new Date() 
  }, { new: true })
    .populate('supplierId', 'companyName name')
    .populate('materialId', 'materialName name')
    .populate('requestedBy', 'username email');

  // Create notification for procurement team
  try {
    const SupplierRequestNotification = (await import('../model/supplierRequestNotification.model.js')).default;
    
    let message = '';
    if (status === 'Approved') {
      message = `Sample request for ${sample.materialId.materialName} has been approved by supplier`;
    } else if (status === 'Rejected') {
      message = `Sample request for ${sample.materialId.materialName} has been rejected by supplier`;
    } else if (status === 'Dispatched') {
      message = `Sample for ${sample.materialId.materialName} has been dispatched by supplier`;
    }
    
    await SupplierRequestNotification.create({
      type: 'sample_status_update',
      supplierId: sample.supplierId._id,
      materialId: sample.materialId._id,
      message: message,
      details: {
        sampleId: sample._id,
        status: status,
        reviewNote: reviewNote,
        supplierName: sample.supplierId.companyName || sample.supplierId.name,
        materialName: sample.materialId.materialName
      }
    });
  } catch (notificationError) {
    console.error('Failed to create notification:', notificationError);
    // Don't fail the whole operation if notification fails
  }

  return sample;
};

const getSamples = async (supplierId) => {
  return await Sample.find({ supplierId })
    .populate('supplierId', 'companyName name')
    .populate('materialId', 'materialName name')
    .populate('requestedBy', 'username email')
    .sort({ createdAt: -1 });
};

const getAllSamples = async () => {
  return await Sample.find({})
    .populate('supplierId', 'companyName name')
    .populate('materialId', 'materialName name')
    .populate('requestedBy', 'username email')
    .sort({ createdAt: -1 });
};

const getSampleById = async (id) => {
  return await Sample.findById(id)
    .populate('supplierId', 'companyName name')
    .populate('materialId', 'materialName name')
    .populate('requestedBy', 'username email');
};

export default {
  uploadSample,
  reviewSample,
  getSamples,
  getAllSamples,
  getSampleById
};
