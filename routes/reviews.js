import { Router } from 'express';
import { reviewData, buildingData } from "../data/index.js";
import { requireAuth } from '../middleware/auth.js';
import { createApiHandler } from '../utils/api-response.js';

const router = Router();

router.get(
  '/buildings/:id/reviews',
  createApiHandler(
    async (req) => {
      const buildingId = req.params.id;
      await buildingData.getBuildingById(buildingId);
      return reviewData.getReviewsByBuilding(buildingId);
    },
    {
      getErrorStatus: (error) =>
        error === 'building not found' ? 404 : 400
    }
  )
);

router.post(
  '/buildings/:id/reviews',
  requireAuth,
  createApiHandler(
    async (req) => {
      const { reviewText, rating, issueTags } = req.body;
      const buildingId = req.params.id;
      await buildingData.getBuildingById(buildingId);

      return reviewData.createReview(
        buildingId,
        req.session.user._id,
        reviewText,
        rating,
        issueTags,
      );
    },
    {
      successStatus: 201,
      getErrorStatus: (error) =>
        error === 'building not found' ? 404 : 400
    }
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
