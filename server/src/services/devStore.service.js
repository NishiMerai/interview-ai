import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);
const users = new Map();

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function comparePassword(password, passwordHash) {
  if (!passwordHash || typeof passwordHash !== "string") {
    return false;
  }

  const [salt, storedHash] = passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt, 64);

  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    derivedKey
  );
}

function makeId() {
  return crypto.randomUUID();
}

export async function createMemoryUser({ name, email, password, role = 'user' }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (users.has(normalizedEmail)) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const user = {
    _id: makeId(),
    name,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    role,
    avatarUrl: '',
    isSuspended: false,
    subscriptionPlan: 'free',
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.set(normalizedEmail, user);
  return publicUser(user);
}

export async function loginMemoryUser({ email, password }) {
  const user = users.get(email.trim().toLowerCase());

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.isSuspended) {
    const error = new Error('Account suspended');
    error.statusCode = 403;
    throw error;
  }

  user.lastLoginAt = new Date();
  return publicUser(user);
}

export async function bootstrapMemoryAdmin() {
  const email = process.env.DEMO_ADMIN_EMAIL || 'admin@interviewai.local';
  const password = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';
  const normalizedEmail = email.trim().toLowerCase();

  const existing = users.get(normalizedEmail);
  if (existing) {
    existing.name = 'Interview AI Admin';
    existing.role = 'admin';
    existing.isSuspended = false;
    existing.passwordHash = await hashPassword(password);
    existing.updatedAt = new Date();
    return { admin: publicUser(existing), credentials: { email, password } };
  }

  const admin = await createMemoryUser({
    name: 'Interview AI Admin',
    email,
    password,
    role: 'admin'
  });

  return { admin, credentials: { email, password } };
}

export function getMemoryUserById(id) {
  for (const user of users.values()) {
    if (user._id === id) return publicUser(user);
  }
  return null;
}

export function getMemoryUserByEmail(email) {
  return publicUser(users.get(email.trim().toLowerCase()));
}

export function listMemoryUsers() {
  return [...users.values()].map(publicUser).sort((a, b) => b.createdAt - a.createdAt);
}

export async function ensureDefaultMemoryAdmin() {
  const email = process.env.DEMO_ADMIN_EMAIL || 'admin@interviewai.local';
  if (!getMemoryUserByEmail(email)) {
    await bootstrapMemoryAdmin();
  }
}
