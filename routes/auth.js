import { Router } from 'express';
import { userData } from '../data/index.js';
import { createApiHandler, sendApiSuccess } from '../utils/api-response.js';

const router = Router();

router.post(
  '/auth/register',
  createApiHandler(
    async (req) => {
      const { firstName, lastName, email, username, password } = req.body;
      return userData.createUser(firstName, lastName, email, username, password);
    },
    { successStatus: 201, errorStatus: 400 }
  )
);

router.post(
  '/auth/login',
  createApiHandler(
    async (req) => {
      const user = await userData.loginUser(req.body.username, req.body.password);
      req.session.user = user;
      return user;
    },
    { errorStatus: 401 }
  )
);

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => sendApiSuccess(res));
});

export default router;
