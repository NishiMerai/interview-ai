import mongoose from 'mongoose';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user', index: true },
  avatarUrl: String,
  isSuspended: { type: Boolean, default: false, index: true },
  subscriptionPlan: { type: String, enum: ['free', 'premium'], default: 'free' },
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: Date
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
  if (!this.passwordHash || typeof this.passwordHash !== "string") {
    return false;
  }

  const [salt, storedHash] = this.passwordHash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = await scryptAsync(password, salt, 64);

  return crypto.timingSafeEqual(
    Buffer.from(storedHash, "hex"),
    derivedKey
  );
};

userSchema.statics.hashPassword = async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
};

export default mongoose.model('User', userSchema);
