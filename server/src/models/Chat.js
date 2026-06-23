import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, default: 'New chat' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],
  memorySummary: String,
  tags: [String]
}, { timestamps: true });

chatSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('Chat', chatSchema);
