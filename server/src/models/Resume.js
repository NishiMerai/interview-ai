import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fileUrl: String,
  originalFileName: String,
  fileType: { type: String, enum: ['pdf', 'docx'], required: true },
  extractedText: String,
  parsedData: {
    skills: [String],
    education: [String],
    experience: [String],
    projects: [String],
    certifications: [String],
    achievements: [String],
    languages: [String]
  },
  atsScore: Number,
  resumeScore: Number,
  keywordAnalysis: {
    matchedKeywords: [String],
    missingKeywords: [String],
    keywordDensity: [{ keyword: String, count: Number }]
  },
  versionNumber: Number,
  matchedSkills: [mongoose.Schema.Types.Mixed],
  missingSkills: [mongoose.Schema.Types.Mixed],
  requiredSkills: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

resumeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);
