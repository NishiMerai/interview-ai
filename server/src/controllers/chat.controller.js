import Chat from '../models/Chat.js';
import { chatWithCareerCoach, callAI } from '../services/ai.service.js';
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

export const chatHandler = asyncHandler(async (req, res) => {
  console.log("Chat route hit");
  const { message } = req.body;
  console.log("Message:", message);
  console.log("Groq key exists:", !!process.env.GROQ_API_KEY);
  console.log("Model:", process.env.AI_MODEL || "llama-3.3-70b-versatile");

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  const answerText = await callAI([
    {
      role: 'system',
      content: 'You are Interview AI, a helpful placement preparation assistant. Answer clearly in easy words.'
    },
    {
      role: 'user',
      content: message
    }
  ]);

  console.log("AI answer length:", answerText?.length);

  res.json({ answer: answerText });
});
