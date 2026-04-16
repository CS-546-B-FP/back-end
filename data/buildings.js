import { ObjectId } from 'mongodb';
import { buildings } from '../config/mongoCollections.js';
import { checkString, checkId } from './validation.js';

export const getAllBuildings = async ({ search, borough, page = 1, limit = 20 } = {}) => {
  const col = await buildings();
  const query = {};
  if (search) query.$text = { $search: search };
  if (borough) query.borough = borough;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    col.find(query).skip(skip).limit(limit).toArray(),
    col.countDocuments(query)
  ]);
  return { items, total, page, limit };
};

export const getBuildingById = async (id) => {
  id = checkId(id);
  const col = await buildings();
  const building = await col.findOne({ _id: new ObjectId(id) });
  if (!building) throw 'building not found';
  return building;
};

export const createBuilding = async (data, adminId) => {
  adminId = checkId(adminId, 'adminId');
  checkString(data.streetAddress, 'streetAddress');
  checkString(data.borough, 'borough');
  const now = new Date();
  const col = await buildings();
  const doc = {
    ...data,
    riskSummary: data.riskSummary ?? { highlights: [], lastCalculatedAt: now },
    housingRecords: data.housingRecords ?? [],
    createdByAdminId: new ObjectId(adminId),
    updatedByAdminId: new ObjectId(adminId),
    createdAt: now,
    updatedAt: now
  };
  const { insertedId } = await col.insertOne(doc);
  return { _id: insertedId.toString() };
};

export const updateBuilding = async (id, data, adminId) => {
  id = checkId(id);
  adminId = checkId(adminId, 'adminId');
  const col = await buildings();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedByAdminId: new ObjectId(adminId), updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  if (!result) throw 'building not found';
  return result;
};

export const deleteBuilding = async (id) => {
  id = checkId(id);
  const col = await buildings();
  const result = await col.findOneAndDelete({ _id: new ObjectId(id) });
  if (!result) throw 'building not found';
  return { deleted: true };
};

export const getBuildingsByOwner = async (ownerName) => {
  ownerName = checkString(ownerName, 'ownerName');
  const col = await buildings();
  return col.find({ ownerName }).toArray();
};
