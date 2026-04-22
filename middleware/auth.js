export const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'not authenticated' });
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ error: 'not authenticated' });
  if (req.session.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
};
