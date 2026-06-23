import mongoose from 'mongoose';

const skillGapReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  targetType: { type: String, enum: ['role', 'company', 'job_description', 'industry_standard'], default: 'role' },
  targetName: String,
  requiredSkills: [String],
  matchedSkills: [String],
  missingSkills: [String],
  strengthAreas: [String],
  weakAreas: [String],
  matchScore: Number,
  radarData: [{ category: String, score: Number }]
}, { timestamps: true });

skillGapReportSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SkillGapReport', skillGapReportSchema);
