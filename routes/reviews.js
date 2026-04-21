import { Router } from 'express';
import { reviewData } from '../data/index.js';
import { requireAuth } from '../middleware/auth.js';
import { createApiHandler } from '../utils/api-response.js';

const router = Router();

router.get(
  '/buildings/:id/reviews',
  createApiHandler(
    async (req) => reviewData.getReviewsByBuilding(req.params.id),
    { errorStatus: 404 }
  )
);

router.post(
  '/buildings/:id/reviews',
  requireAuth,
  createApiHandler(
    async (req) => {
      const { reviewText, rating, issueTags } = req.body;
      return reviewData.createReview(
        req.params.id,
        req.session.user._id,
        reviewText,
        rating,
        issueTags
      );
    },
    { successStatus: 201, errorStatus: 400 }
  )
);

router.put(
  '/reviews/:id',
  requireAuth,
  createApiHandler(
    async (req) => {
      const { reviewText, rating, issueTags } = req.body;
      return reviewData.updateReview(
        req.params.id,
        req.session.user._id,
        reviewText,
        rating,
        issueTags
      );
    },
    { errorStatus: 400 }
  )
);

router.delete(
  '/reviews/:id',
  requireAuth,
  createApiHandler(
    async (req) => reviewData.deleteReview(req.params.id, req.session.user._id),
    { errorStatus: 400 }
  )
);

export default router;
