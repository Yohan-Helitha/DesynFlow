import * as claimService from '../service/claimService.js';

// POST /api/claims
export const createClaim = async (req, res) => {
  try {
    const { warrantyId, clientId, description, attachments } = req.body;
    const claim = await claimService.createClaim({ warrantyId, clientId, description, attachments });
    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/claims
export const getClaims = async (req, res) => {
  try {
    const { status, clientId, projectId } = req.query;
    const claims = await claimService.getClaims({ status, clientId, projectId });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/claims/:id
export const getClaimById = async (req, res) => {
  try {
    const claim = await claimService.getClaimById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Not found' });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/claims/:id/approve
export const approveClaim = async (req, res) => {
  try {
    const claim = await claimService.approveClaim(req.params.id);
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/claims/:id/reject
export const rejectClaim = async (req, res) => {
  try {
    const claim = await claimService.rejectClaim(req.params.id);
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/claims/resolved
// Returns claims whose status is one of Approved, Rejected, Replaced
export const getResolvedClaims = async (_req, res) => {
  try {
    const claims = await claimService.getResolvedClaims();
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/claims/pending
// Returns claims whose status is one of Submitted, UnderReview
export const getPendingClaims = async (_req, res) => {
  try {
    const claims = await claimService.getPendingClaims();
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
