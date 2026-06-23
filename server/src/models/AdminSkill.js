import mongoose from 'mongoose';

const adminSkillSchema = new mongoose.Schema({
  name: { type: String, required: true, index: 'text' },
  category: { type: String, required: true, index: true },
  aliases: [String],
  importanceScore: { type: Number, default: 50 },
  relatedRoles: [String],
  resources: [{ title: String, url: String, type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('AdminSkill', adminSkillSchema);
