import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['technical', 'hr', 'behavioral'], default: 'technical', index: true },
  domain: { type: String, index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
  expectedAnswer: String,
  keywords: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

interviewQuestionSchema.index({ question: 'text', domain: 1 });

export default mongoose.model('InterviewQuestion', interviewQuestionSchema);
