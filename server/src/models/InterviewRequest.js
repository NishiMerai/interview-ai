import mongoose from 'mongoose';

const interviewRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  interviewType: {
    type: String,
    enum: ['HR Interview', 'Technical Interview', 'Final Interview'],
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  adminScheduledDate: {
    type: Date
  },
  adminScheduledTime: {
    type: String
  },
  googleMeetLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending',
    index: true
  },
  adminRemark: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('InterviewRequest', interviewRequestSchema);
