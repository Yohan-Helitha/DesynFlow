import WarrantyClaim from '../model/warrenty_claim.js';

export const createClaim = async ({ warrantyId, clientId, description, attachments, proofUrl }) => {
  const claim = new WarrantyClaim({
    warrantyId,
    clientId,
    issueDescription: description,
    // attachments may exist in older payloads; schema may not define it explicitly
    attachments,
    proofUrl,
    status: 'Submitted',
  });
  await claim.save();
  return claim;
};

export const getClaims = async (filter) => {
  const query = {};
  if (filter.status) query.status = new RegExp(filter.status, 'i');
  if (filter.clientId) query.clientId = filter.clientId;
  if (filter.projectId) query.projectId = filter.projectId;
  return WarrantyClaim.find(query)
    .populate('clientId', 'username email')
    .populate({
      path: 'warrantyId',
      select: 'projectId itemId warrantyStart warrantyEnd',
      populate: [
        { path: 'itemId', select: 'materialName category type' },
        { path: 'projectId', select: 'projectName location' }
      ]
    });
};

export const getClaimById = async (id) => WarrantyClaim.findById(id)
  .populate('clientId', 'username email')
  .populate({
    path: 'warrantyId',
    select: 'projectId itemId warrantyStart warrantyEnd',
    populate: [
      { path: 'itemId', select: 'materialName category type' },
      { path: 'projectId', select: 'projectName location' }
    ]
  });

export const approveClaim = async (id) => {
  return WarrantyClaim.findByIdAndUpdate(id, { status: 'Approved' }, { new: true });
};

export const rejectClaim = async (id) => {
  return WarrantyClaim.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });
};

// Get claims that are in a terminal/resolved state (Approved, Rejected, Replaced)
export const getResolvedClaims = async () => {
  return WarrantyClaim.find({ status: { $in: ['Approved', 'Rejected', 'Replaced'] } })
    .populate('clientId', 'username email')
    .populate({
      path: 'warrantyId',
      select: 'projectId itemId warrantyStart warrantyEnd',
      populate: [
        { path: 'itemId', select: 'materialName category type' },
        { path: 'projectId', select: 'projectName location' }
      ]
    });
};

// Get claims that are still pending (Submitted, UnderReview)
export const getPendingClaims = async () => {
  return WarrantyClaim.find({ status: { $in: ['Submitted', 'UnderReview'] } })
    .populate('clientId', 'username email')
    .populate({
      path: 'warrantyId',
      select: 'projectId itemId warrantyStart warrantyEnd',
      populate: [
        { path: 'itemId', select: 'materialName category type' },
        { path: 'projectId', select: 'projectName location' }
      ]
    });
};
