import { Router } from 'express';
import { buildingData } from '../data/index.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/admin/buildings', requireAdmin, async (req, res) => {
  try {
    const result = await buildingData.createBuilding(req.body, req.session.user._id);
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.put('/admin/buildings/:id', requireAdmin, async (req, res) => {
  try {
    const result = await buildingData.updateBuilding(req.params.id, req.body, req.session.user._id);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.delete('/admin/buildings/:id', requireAdmin, async (req, res) => {
  try {
    const result = await buildingData.deleteBuilding(req.params.id);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

export default router;
