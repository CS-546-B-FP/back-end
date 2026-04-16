import { ObjectId } from 'mongodb';

export const checkString = (val, name = 'value') => {
  if (typeof val !== 'string' || val.trim().length === 0)
    throw `${name} must be a non-empty string`;
  return val.trim();
};

export const checkId = (id, name = 'id') => {
  id = checkString(id, name);
  if (!ObjectId.isValid(id)) throw `${name} is not a valid ObjectId`;
  return id;
};

export const checkEmail = (email) => {
  email = checkString(email, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw 'invalid email address';
  return email.toLowerCase();
};

export const checkInt = (val, name = 'value', min, max) => {
  if (typeof val !== 'number' || !Number.isInteger(val)) throw `${name} must be an integer`;
  if (min !== undefined && val < min) throw `${name} must be >= ${min}`;
  if (max !== undefined && val > max) throw `${name} must be <= ${max}`;
  return val;
};
