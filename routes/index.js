import authRoutes from './auth.js';
import buildingRoutes from './buildings.js';
import reviewRoutes from './reviews.js';
import shortlistRoutes from './shortlists.js';
import adminRoutes from './admin.js';

export default function registerRoutes(app) {
  app.use(authRoutes);
  app.use(buildingRoutes);
  app.use(reviewRoutes);
  app.use(shortlistRoutes);
  app.use(adminRoutes);

  app.use((req, res) => res.status(404).json({ error: 'not found' }));
  app.use((err, req, res, next) => res.status(500).json({ error: 'internal server error' }));
}
