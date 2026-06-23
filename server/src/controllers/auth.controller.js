import User from '../models/User.js';
import { isDatabaseReady } from '../config/db.js';
import {
  bootstrapMemoryAdmin,
  createMemoryUser,
  getMemoryUserById,
  loginMemoryUser
} from '../services/devStore.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setRefreshCookie, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

function userDto(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    subscriptionPlan: user.subscriptionPlan
  };
}

export const register = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim()?.toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
    const user = await createMemoryUser({ name, email, password, role: 'user' });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      user: userDto(user),
      accessToken,
      mode: 'in-memory-demo'
    });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ user: userDto(user), accessToken });
});

export const bootstrapAdmin = asyncHandler(async (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403);
    throw new Error('Demo admin bootstrap is disabled in production');
  }

  const email = process.env.DEMO_ADMIN_EMAIL || 'admin@interviewai.local';
  const password = process.env.DEMO_ADMIN_PASSWORD || 'Admin@123';

  if (!isDatabaseReady()) {
    const { admin, credentials } = await bootstrapMemoryAdmin();
    return res.status(201).json({
      message: 'Demo admin is ready in in-memory mode',
      admin: userDto(admin),
      credentials
    });
  }

  const passwordHash = await User.hashPassword(password);

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name: 'Interview AI Admin',
      email,
      passwordHash,
      role: 'admin',
      isSuspended: false
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    message: 'Demo admin is ready',
    admin: userDto(admin),
    credentials: { email, password }
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim()?.toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
    const user = await loginMemoryUser({ email, password });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    return res.json({
      user: userDto(user),
      accessToken,
      mode: 'in-memory-demo'
    });
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isSuspended) {
    res.status(403);
    throw new Error('Account suspended');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  res.json({ user: userDto(user), accessToken });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('Refresh token missing');
  }

  const decoded = verifyRefreshToken(token);

  if (!isDatabaseReady() && process.env.NODE_ENV !== 'production') {
    const user = getMemoryUserById(decoded.sub);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.status(401);
      throw new Error('Refresh token invalid');
    }

    return res.json({ user: userDto(user), accessToken: signAccessToken(user) });
  }

  const user = await User.findById(decoded.sub);

  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    res.status(401);
    throw new Error('Refresh token invalid');
  }

  res.json({ user: userDto(user), accessToken: signAccessToken(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: userDto(req.user) });
});
