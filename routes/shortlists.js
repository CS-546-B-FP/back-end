import { Router } from 'express';
import { shortlistData } from '../data/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/shortlists', requireAuth, async (req, res) => {
  try {
    const items = await shortlistData.getShortlistsByUser(req.session.user._id);
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post('/shortlists', requireAuth, async (req, res) => {
  try {
    const result = await shortlistData.createShortlist(req.session.user._id, req.body.shortlistName);
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.post('/shortlists/:id/items', requireAuth, async (req, res) => {
  try {
    const result = await shortlistData.addItemToShortlist(req.params.id, req.session.user._id, req.body.buildingId);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.patch('/shortlists/:id/items/:buildingId/note', requireAuth, async (req, res) => {
  try {
    const result = await shortlistData.updateItemNote(req.params.id, req.session.user._id, req.params.buildingId, req.body.privateNote);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.delete('/shortlists/:id/items/:buildingId', requireAuth, async (req, res) => {
  try {
    const result = await shortlistData.removeItemFromShortlist(req.params.id, req.session.user._id, req.params.buildingId);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.delete('/shortlists/:id', requireAuth, async (req, res) => {
  try {
    const result = await shortlistData.deleteShortlist(req.params.id, req.session.user._id);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

export default router;
