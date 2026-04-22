import { Router } from 'express';
import { userData } from '../data/index.js';

const router = Router();

router.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    const result = await userData.createUser(firstName, lastName, email, username, password);
    res.status(201).json({ success: true, data: result });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const user = await userData.loginUser(req.body.username, req.body.password);
    req.session.user = user;
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(401).json({ error: e });
  }
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

export default router;
