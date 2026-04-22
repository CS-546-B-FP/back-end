import { sendApiError } from '../utils/api-response.js';

export const requireAuth = (req, res, next) => {
  if (!req.session.user) return sendApiError(res, 'not authenticated', { status: 401 });
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session.user) return sendApiError(res, 'not authenticated', { status: 401 });
  if (req.session.user.role !== 'admin') return sendApiError(res, 'forbidden', { status: 403 });
  next();
};
