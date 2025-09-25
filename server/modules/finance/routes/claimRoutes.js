import express from 'express';
import * as claimController from '../controller/claimController.js';

const router = express.Router();

router.post('/', claimController.createClaim);
router.get('/', claimController.getClaims);
// Resolved (terminal) claim statuses: Approved, Rejected, Replaced
router.get('/resolved', claimController.getResolvedClaims);
// Pending claim statuses: Submitted, UnderReview
router.get('/pending', claimController.getPendingClaims);
router.get('/:id', claimController.getClaimById);
router.put('/:id/approve', claimController.approveClaim);
router.put('/:id/reject', claimController.rejectClaim);

export default router;
