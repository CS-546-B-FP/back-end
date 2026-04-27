import { ObjectId } from 'mongodb';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9._-]+$/;

export const BOROUGH_VALUES = Object.freeze([
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island'
]);

export const USER_ROLE_VALUES = Object.freeze(['user', 'admin']);

export const REVIEW_ISSUE_TAG_VALUES = Object.freeze([
  'heat',
  'pests',
  'repairs',
  'responsiveness',
  'maintenance',
  'violations',
  'bedbugs',
  'litigation',
  'overall'
]);

export const VALIDATION_LIMITS = Object.freeze({
  textMaxLength: 5000,
  emailMaxLength: 254,
  usernameMinLength: 3,
  usernameMaxLength: 24,
  passwordMinLength: 8,
  passwordMaxLength: 128,
  personNameMaxLength: 50,
  streetAddressMaxLength: 200,
  ownerNameMaxLength: 120,
  shortlistNameMaxLength: 80,
  privateNoteMaxLength: 1000,
  reviewTextMaxLength: 2000,
  issueTagMaxLength: 40,
  issueTagMaxItems: 10
});

const STRING_FIELD_PROFILES = Object.freeze({
  firstName: Object.freeze({
    minLength: 1,
    maxLength: VALIDATION_LIMITS.personNameMaxLength
  }),
  lastName: Object.freeze({
    minLength: 1,
    maxLength: VALIDATION_LIMITS.personNameMaxLength
  }),
  streetAddress: Object.freeze({
    minLength: 3,
    maxLength: VALIDATION_LIMITS.streetAddressMaxLength
  }),
  ownerName: Object.freeze({
    minLength: 1,
    maxLength: VALIDATION_LIMITS.ownerNameMaxLength
  }),
  shortlistName: Object.freeze({
    minLength: 1,
    maxLength: VALIDATION_LIMITS.shortlistNameMaxLength
  }),
  privateNote: Object.freeze({
    minLength: 1,
    maxLength: VALIDATION_LIMITS.privateNoteMaxLength
  }),
  reviewText: Object.freeze({
    minLength: 1,
    maxLength: VALIDATION_LIMITS.reviewTextMaxLength
  })
});

const normalizeString = (
  val,
  name = 'value',
  {
    trim = true,
    minLength = 1,
    maxLength = VALIDATION_LIMITS.textMaxLength,
    pattern,
    patternMessage
  } = {}
) => {
  if (typeof val !== 'string') throw `${name} must be a string`;

  const normalized = trim ? val.trim() : val;

  if (normalized.length < minLength) {
    if (minLength === 1) {
      throw `${name} must be a non-empty string`;
    }

    throw `${name} must be at least ${minLength} characters long`;
  }

  if (maxLength !== undefined && normalized.length > maxLength) {
    throw `${name} must be ${maxLength} characters or fewer`;
  }

  if (pattern && !pattern.test(normalized)) {
    throw patternMessage || `${name} is invalid`;
  }

  return normalized;
};

const matchAllowedValue = (val, allowedValues, { caseInsensitive = false } = {}) =>
  allowedValues.find((option) =>
    caseInsensitive
      ? String(option).toLowerCase() === val.toLowerCase()
      : option === val
  );

export const checkString = (val, name = 'value', options = {}) => {
  if (name === 'email') {
    return checkEmail(val, name, options);
  }

  if (name === 'username') {
    return checkUsername(val, name, options);
  }

  if (name === 'password') {
    return checkPassword(val, name, options);
  }

  if (name === 'borough') {
    return checkBorough(val, name, options);
  }

  if (name === 'role') {
    return checkRole(val, name, options);
  }

  const fieldProfile = STRING_FIELD_PROFILES[name];

  return normalizeString(val, name, {
    maxLength: VALIDATION_LIMITS.textMaxLength,
    ...fieldProfile,
    ...options
  });
};

export const checkBoundedText = (
  val,
  name = 'value',
  {
    trim = true,
    minLength = 1,
    maxLength = VALIDATION_LIMITS.textMaxLength
  } = {}
) => normalizeString(val, name, { trim, minLength, maxLength });

export const checkOptionalBoundedText = (
  val,
  name = 'value',
  {
    trim = true,
    maxLength = VALIDATION_LIMITS.textMaxLength,
    emptyValue = ''
  } = {}
) => {
  if (val === undefined || val === null) {
    return emptyValue;
  }

  if (typeof val !== 'string') {
    throw `${name} must be a string`;
  }

  const normalized = trim ? val.trim() : val;

  if (normalized.length === 0) {
    return emptyValue;
  }

  return normalizeString(normalized, name, {
    trim: false,
    minLength: 1,
    maxLength
  });
};

export const checkId = (id, name = 'id') => {
  id = normalizeString(id, name);
  if (!ObjectId.isValid(id)) throw `${name} is not a valid ObjectId`;
  return id;
};

export const checkEmail = (email, name = 'email', options = {}) => {
  const { lowercase = true, ...stringOptions } = options;
  email = normalizeString(email, name, {
    maxLength: VALIDATION_LIMITS.emailMaxLength,
    ...stringOptions
  });
  if (!EMAIL_REGEX.test(email)) throw `${name} must be a valid email address`;
  return lowercase ? email.toLowerCase() : email;
};

export const checkUsername = (username, name = 'username', options = {}) => {
  const { lowercase = true, ...stringOptions } = options;
  username = normalizeString(username, name, {
    minLength: VALIDATION_LIMITS.usernameMinLength,
    maxLength: VALIDATION_LIMITS.usernameMaxLength,
    ...stringOptions
  });

  if (!USERNAME_REGEX.test(username) || username.startsWith('.') || username.endsWith('.')) {
    throw `${name} can only use letters, numbers, periods, underscores, and hyphens`;
  }

  return lowercase ? username.toLowerCase() : username;
};

export const checkPassword = (
  password,
  name = 'password',
  options = {}
) => {
  const {
    enforceStrength = true,
    allowSpaces = false,
    minLength = enforceStrength ? VALIDATION_LIMITS.passwordMinLength : 1,
    maxLength = VALIDATION_LIMITS.passwordMaxLength,
    trim: _trimIgnored,
    ...stringOptions
  } = options;

  password = normalizeString(password, name, {
    trim: false,
    minLength,
    maxLength,
    ...stringOptions
  });

  if (!allowSpaces && /\s/.test(password)) {
    throw `${name} cannot contain spaces`;
  }

  if (!enforceStrength) {
    return password;
  }

  if (!/[a-z]/.test(password)) throw `${name} must include at least one lowercase letter`;
  if (!/[A-Z]/.test(password)) throw `${name} must include at least one uppercase letter`;
  if (!/[0-9]/.test(password)) throw `${name} must include at least one number`;
  if (!/[^A-Za-z0-9]/.test(password)) throw `${name} must include at least one special character`;

  return password;
};

export const checkBorough = (borough, name = 'borough', options = {}) =>
  checkEnum(borough, BOROUGH_VALUES, name, {
    caseInsensitive: true,
    ...options
  });

export const checkRole = (role, name = 'role', options = {}) =>
  checkEnum(role, USER_ROLE_VALUES, name, {
    caseInsensitive: true,
    ...options
  });

export const checkOptionalEnum = (
  val,
  allowedValues,
  name = 'value',
  {
    caseInsensitive = false,
    emptyValue = undefined
  } = {}
) => {
  if (val === undefined || val === null) {
    return emptyValue;
  }

  if (typeof val === 'string' && val.trim().length === 0) {
    return emptyValue;
  }

  return checkEnum(val, allowedValues, name, { caseInsensitive });
};

export const checkOptionalBorough = (borough, name = 'borough', options = {}) =>
  checkOptionalEnum(borough, BOROUGH_VALUES, name, {
    caseInsensitive: true,
    ...options
  });

export const checkEnum = (
  val,
  allowedValues,
  name = 'value',
  { caseInsensitive = false } = {}
) => {
  if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
    throw new Error('allowedValues must be a non-empty array');
  }

  const normalized = normalizeString(val, name);
  const matched = matchAllowedValue(normalized, allowedValues, { caseInsensitive });

  if (!matched) {
    throw `${name} must be one of: ${allowedValues.join(', ')}`;
  }

  return matched;
};

export const checkStringArray = (
  val,
  name = 'value',
  {
    trim = true,
    minItems = 0,
    maxItems,
    unique = false,
    itemMinLength = 1,
    itemMaxLength = VALIDATION_LIMITS.textMaxLength,
    allowedValues,
    caseInsensitive = false,
    pattern,
    patternMessage
  } = {}
) => {
  if (!Array.isArray(val)) throw `${name} must be an array of strings`;
  if (allowedValues !== undefined && (!Array.isArray(allowedValues) || allowedValues.length === 0)) {
    throw new Error('allowedValues must be a non-empty array');
  }

  if (val.length < minItems) {
    throw `${name} must contain at least ${minItems} item${minItems === 1 ? '' : 's'}`;
  }

  if (maxItems !== undefined && val.length > maxItems) {
    throw `${name} must contain at most ${maxItems} item${maxItems === 1 ? '' : 's'}`;
  }

  const normalized = val.map((item, index) => {
    const normalizedItem = normalizeString(item, `${name}[${index}]`, {
      trim,
      minLength: itemMinLength,
      maxLength: itemMaxLength,
      pattern,
      patternMessage
    });

    if (!allowedValues) {
      return normalizedItem;
    }

    const matched = matchAllowedValue(normalizedItem, allowedValues, { caseInsensitive });

    if (!matched) {
      throw `${name}[${index}] must be one of: ${allowedValues.join(', ')}`;
    }

    return matched;
  });

  if (unique) {
    const seen = new Set();

    for (const item of normalized) {
      const key = caseInsensitive ? String(item).toLowerCase() : item;

      if (seen.has(key)) {
        throw `${name} must not contain duplicate values`;
      }

      seen.add(key);
    }
  }

  return normalized;
};

export const checkIssueTags = (val, name = 'issueTags', options = {}) => {
  const {
    maxItems = VALIDATION_LIMITS.issueTagMaxItems,
    allowedValues: _allowedValuesIgnored,
    caseInsensitive: _caseInsensitiveIgnored,
    unique: _uniqueIgnored,
    ...arrayOptions
  } = options;
  const normalizedTags = checkStringArray(val, name, {
    trim: true,
    caseInsensitive: true,
    allowedValues: REVIEW_ISSUE_TAG_VALUES,
    maxItems,
    itemMaxLength: VALIDATION_LIMITS.issueTagMaxLength,
    ...arrayOptions
  });
  const uniqueTags = [];
  const seen = new Set();

  for (const tag of normalizedTags) {
    if (!seen.has(tag)) {
      seen.add(tag);
      uniqueTags.push(tag);
    }
  }

  return uniqueTags;
};

export const checkInt = (val, name = 'value', min, max) => {
  if (typeof val !== 'number' || !Number.isInteger(val)) throw `${name} must be an integer`;
  if (min !== undefined && val < min) throw `${name} must be >= ${min}`;
  if (max !== undefined && val > max) throw `${name} must be <= ${max}`;
  return val;
};

export const checkQueryNumber = (
  val,
  name = 'value',
  {
    required = false,
    integer = false,
    min,
    max,
    defaultValue
  } = {}
) => {
  if (val === undefined || val === null || val === '') {
    if (required && defaultValue === undefined) {
      throw `${name} is required`;
    }

    return defaultValue;
  }

  if (Array.isArray(val)) {
    throw `${name} must be a single value`;
  }

  let parsed;

  if (typeof val === 'number') {
    parsed = val;
  } else if (typeof val === 'string') {
    const normalized = val.trim();

    if (normalized.length === 0) {
      if (required && defaultValue === undefined) {
        throw `${name} is required`;
      }

      return defaultValue;
    }

    parsed = Number(normalized);
  } else {
    throw `${name} must be a valid number`;
  }

  if (!Number.isFinite(parsed)) {
    throw `${name} must be a valid number`;
  }

  if (integer && !Number.isInteger(parsed)) {
    throw `${name} must be an integer`;
  }

  if (min !== undefined && parsed < min) {
    throw `${name} must be >= ${min}`;
  }

  if (max !== undefined && parsed > max) {
    throw `${name} must be <= ${max}`;
  }

  return parsed;
};

export const checkQueryInt = (val, name = 'value', options = {}) =>
  checkQueryNumber(val, name, { ...options, integer: true });
