import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['technical', 'hr', 'behavioral', 'mixed'], default: 'technical' },
  mode: {
    type: String,
    enum: ["technical", "hr", "behavioral", "mixed", "Technical Interview", "HR Interview", "Behavioral Interview", "Mixed Interview"],
    default: "technical",
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard", "beginner", "intermediate", "advanced", "Beginner", "Intermediate", "Advanced"],
    default: "easy",
  },

  questions: [{
    question: String,
    expectedAnswer: String,
    userAnswer: String,
    score: Number,
    feedback: String,
    strengths: [String],
    improvements: [String],
    betterAnswer: String
  }],
  recordingUrl: String,
  transcript: String,
  communicationScore: Number,
  confidenceScore: Number,
  technicalScore: Number,
  overallScore: Number,
  finalFeedback: String
}, { timestamps: true });

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('InterviewSession', interviewSessionSchema);
