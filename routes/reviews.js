import { Router } from 'express';
import { reviewData } from '../data/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/buildings/:id/reviews', async (req, res) => {
  try {
    const items = await reviewData.getReviewsByBuilding(req.params.id);
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

router.post('/buildings/:id/reviews', requireAuth, async (req, res) => {
  try {
    const { reviewText, rating, issueTags } = req.body;
    const result = await reviewData.createReview(
      req.params.id, req.session.user._id, reviewText, rating, issueTags
    );
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.put('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const { reviewText, rating, issueTags } = req.body;
    const result = await reviewData.updateReview(
      req.params.id, req.session.user._id, reviewText, rating, issueTags
    );
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.delete('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const result = await reviewData.deleteReview(req.params.id, req.session.user._id);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

export default router;
