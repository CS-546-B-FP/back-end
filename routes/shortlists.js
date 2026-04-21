import { Router } from 'express';
import { shortlistData } from '../data/index.js';
import { requireAuth } from '../middleware/auth.js';
import { createApiHandler } from '../utils/api-response.js';

const router = Router();

router.get(
  '/shortlists',
  requireAuth,
  createApiHandler(
    async (req) => shortlistData.getShortlistsByUser(req.session.user._id)
  )
);

router.post(
  '/shortlists',
  requireAuth,
  createApiHandler(
    async (req) => shortlistData.createShortlist(req.session.user._id, req.body.shortlistName),
    { successStatus: 201, errorStatus: 400 }
  )
);

router.post(
  '/shortlists/:id/items',
  requireAuth,
  createApiHandler(
    async (req) =>
      shortlistData.addItemToShortlist(req.params.id, req.session.user._id, req.body.buildingId),
    { errorStatus: 400 }
  )
);

router.patch(
  '/shortlists/:id/items/:buildingId/note',
  requireAuth,
  createApiHandler(
    async (req) =>
      shortlistData.updateItemNote(
        req.params.id,
        req.session.user._id,
        req.params.buildingId,
        req.body.privateNote
      ),
    { errorStatus: 400 }
  )
);

router.delete(
  '/shortlists/:id/items/:buildingId',
  requireAuth,
  createApiHandler(
    async (req) =>
      shortlistData.removeItemFromShortlist(
        req.params.id,
        req.session.user._id,
        req.params.buildingId
      ),
    { errorStatus: 400 }
  )
);

router.delete(
  '/shortlists/:id',
  requireAuth,
  createApiHandler(
    async (req) => shortlistData.deleteShortlist(req.params.id, req.session.user._id),
    { errorStatus: 400 }
  )
);

export default router;
