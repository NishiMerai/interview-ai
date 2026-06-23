import Chat from '../models/Chat.js';
import { chatWithCareerCoach } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(30);
  res.json({ chats });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, message } = req.body;

  let chat = chatId
    ? await Chat.findOne({ _id: chatId, userId: req.user._id })
    : await Chat.create({ userId: req.user._id, title: message.slice(0, 50), messages: [] });

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  chat.messages.push({ role: 'user', content: message });
  const assistantReply = await chatWithCareerCoach(chat.messages);
  chat.messages.push({ role: 'assistant', content: assistantReply });
  await chat.save();

  res.json({ chat, reply: assistantReply });
});
