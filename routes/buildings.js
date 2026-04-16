import { Router } from 'express';
import { buildingData } from '../data/index.js';
import { requireAuth } from '../middleware/auth.js';
import { userData } from '../data/index.js';

const router = Router();

router.get('/buildings', async (req, res) => {
  try {
    const { search, borough, page, limit } = req.query;
    const result = await buildingData.getAllBuildings({
      search, borough,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20
    });
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.get('/buildings/:id', async (req, res) => {
  try {
    const building = await buildingData.getBuildingById(req.params.id);
    res.json({ success: true, data: building });
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

router.get('/portfolios/:ownerName', async (req, res) => {
  try {
    const items = await buildingData.getBuildingsByOwner(req.params.ownerName);
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(404).json({ error: e });
  }
});

router.post('/watchlist/toggle', requireAuth, async (req, res) => {
  try {
    const result = await userData.toggleWatchlist(req.session.user._id, req.body.buildingId);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

export default router;
