import { ObjectId } from 'mongodb';
import xss from 'xss';
import { reviews } from '../config/mongoCollections.js';
import {
  VALIDATION_LIMITS,
  checkBoundedText,
  checkId,
  checkInt,
  checkIssueTags
} from './validation.js';

export const DUPLICATE_REVIEW_ERROR =
  'review already exists for this building; please edit your existing review instead';

export const getReviewsByBuilding = async (buildingId) => {
  buildingId = checkId(buildingId, 'buildingId');
  const col = await reviews();
  return col.find({ buildingId: new ObjectId(buildingId), status: 'published' })
    .sort({ createdAt: -1 }).toArray();
};

export const createReview = async (buildingId, userId, reviewText, rating, issueTags = []) => {
  buildingId = checkId(buildingId, 'buildingId');
  userId = checkId(userId, 'userId');
  reviewText = xss(
    checkBoundedText(reviewText, 'reviewText', {
      maxLength: VALIDATION_LIMITS.reviewTextMaxLength
    })
  );
  checkInt(rating, 'rating', 1, 5);
  issueTags = checkIssueTags(issueTags, 'issueTags');
  const now = new Date();
  const col = await reviews();
  const buildingObjectId = new ObjectId(buildingId);
  const userObjectId = new ObjectId(userId);
  const existingReview = await col.findOne({
    buildingId: buildingObjectId,
    userId: userObjectId,
    status: 'published'
  });

  if (existingReview) {
    throw DUPLICATE_REVIEW_ERROR;
  }

  const { insertedId } = await col.insertOne({
    buildingId: buildingObjectId,
    userId: userObjectId,
    reviewText, rating, issueTags,
    status: 'published',
    createdAt: now, updatedAt: now
  });
  return { _id: insertedId.toString() };
};

export const updateReview = async (id, userId, reviewText, rating, issueTags) => {
  id = checkId(id);
  userId = checkId(userId, 'userId');
  reviewText = xss(
    checkBoundedText(reviewText, 'reviewText', {
      maxLength: VALIDATION_LIMITS.reviewTextMaxLength
    })
  );
  checkInt(rating, 'rating', 1, 5);
  issueTags = checkIssueTags(issueTags ?? [], 'issueTags');
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
