import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  skillGapReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillGapReport' },
  title: String,
  domain: String,
role: String,
  stages: [{
    name: String,
    topics: [String],
    resources: [{ title: String, type: String, url: String }],
    projects: [String],
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' }
  }],
  progressPercentage: { type: Number, default: 0 },
  estimatedCompletionDays: Number
}, { timestamps: true });

roadmapSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Roadmap', roadmapSchema);
