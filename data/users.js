import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import {
  checkString,
  checkId,
  checkEmail,
  checkUsername,
  checkPassword,
  checkRole
} from './validation.js';

export const createUser = async (firstName, lastName, email, username, password, role = 'user') => {
  firstName = checkString(firstName, 'firstName');
  lastName = checkString(lastName, 'lastName');
  email = checkEmail(email);
  username = checkUsername(username, 'username');
  password = checkPassword(password, 'password');
  role = checkRole(role, 'role');

  const col = await users();
  if (await col.findOne({ $or: [{ email }, { username }] }))
    throw 'email or username already taken';

  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date();
  const { insertedId } = await col.insertOne({
    firstName, lastName, email, username, hashedPassword,
    role, watchlist: [], createdAt: now, updatedAt: now
  });
  return { _id: insertedId.toString() };
};

export const loginUser = async (username, password) => {
  username = checkUsername(username, 'username');
  password = checkPassword(password, 'password', { enforceStrength: false });

  const col = await users();
  const user = await col.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.hashedPassword)))
    throw 'invalid username or password';

  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    role: user.role
  };
};

export const getUserById = async (id) => {
  id = checkId(id);
  const col = await users();
  const user = await col.findOne({ _id: new ObjectId(id) });
  if (!user) throw 'user not found';
  return user;
};

export const toggleWatchlist = async (userId, buildingId) => {
  userId = checkId(userId, 'userId');
  buildingId = checkId(buildingId, 'buildingId');
  const col = await users();
  const user = await col.findOne({ _id: new ObjectId(userId) });
  if (!user) throw 'user not found';

  const bid = new ObjectId(buildingId);
  const inList = user.watchlist.some(id => id.equals(bid));
  const op = inList ? { $pull: { watchlist: bid } } : { $addToSet: { watchlist: bid } };
  await col.updateOne({ _id: new ObjectId(userId) }, { ...op, $set: { updatedAt: new Date() } });
  return { watching: !inList };
};
