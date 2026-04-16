import { ObjectId } from 'mongodb';
import xss from 'xss';
import { reviews } from '../config/mongoCollections.js';
import { checkString, checkId, checkInt } from './validation.js';

export const getReviewsByBuilding = async (buildingId) => {
  buildingId = checkId(buildingId, 'buildingId');
  const col = await reviews();
  return col.find({ buildingId: new ObjectId(buildingId), status: 'published' })
    .sort({ createdAt: -1 }).toArray();
};

export const createReview = async (buildingId, userId, reviewText, rating, issueTags = []) => {
  buildingId = checkId(buildingId, 'buildingId');
  userId = checkId(userId, 'userId');
  reviewText = xss(checkString(reviewText, 'reviewText'));
  checkInt(rating, 'rating', 1, 5);
  const now = new Date();
  const col = await reviews();
  const { insertedId } = await col.insertOne({
    buildingId: new ObjectId(buildingId),
    userId: new ObjectId(userId),
    reviewText, rating, issueTags,
    status: 'published',
    createdAt: now, updatedAt: now
  });
  return { _id: insertedId.toString() };
};

export const updateReview = async (id, userId, reviewText, rating, issueTags) => {
  id = checkId(id);
  userId = checkId(userId, 'userId');
  reviewText = xss(checkString(reviewText, 'reviewText'));
  checkInt(rating, 'rating', 1, 5);
  const col = await reviews();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { reviewText, rating, issueTags, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!result) throw 'review not found or not owned by user';
  return result;
};

export const deleteReview = async (id, userId) => {
  id = checkId(id);
  userId = checkId(userId, 'userId');
  const col = await reviews();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id), userId: new ObjectId(userId) },
    { $set: { status: 'deleted', updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!result) throw 'review not found or not owned by user';
  return { deleted: true };
};
