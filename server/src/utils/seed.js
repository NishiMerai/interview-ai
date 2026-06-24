import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import AdminSkill from '../models/AdminSkill.js';
import InterviewQuestion from '../models/InterviewQuestion.js';

dotenv.config();
await connectDB();

const adminEmail = 'admin@interviewai.local';
const passwordHash = await User.hashPassword('Admin@123');

const admin = await User.findOneAndUpdate(
  { email: adminEmail },
  { name: 'Interview AI Admin', email: adminEmail, passwordHash, role: 'admin' },
  { upsert: true, new: true }
);

await AdminSkill.deleteMany({});
await AdminSkill.insertMany([
  { name: 'HTML', domain: 'Web Development', category: 'Frontend', aliases: ['html5'], createdBy: admin._id },
  { name: 'CSS', domain: 'Web Development', category: 'Frontend', aliases: ['css3', 'tailwind', 'sass'], createdBy: admin._id },
  { name: 'JavaScript', domain: 'Web Development', category: 'Frontend', aliases: ['js', 'ecmascript'], createdBy: admin._id },
  { name: 'React', domain: 'Web Development', category: 'Frontend', aliases: ['reactjs', 'react.js'], createdBy: admin._id },
  { name: 'Node.js', domain: 'Web Development', category: 'Backend', aliases: ['node', 'nodejs'], createdBy: admin._id },
  { name: 'MongoDB', domain: 'Web Development', category: 'Database', aliases: ['mongo', 'nosql'], createdBy: admin._id },
  { name: 'GitHub', domain: 'Web Development', category: 'Tools', aliases: ['git'], createdBy: admin._id },
]);

await InterviewQuestion.deleteMany({});
await InterviewQuestion.insertMany([
  {
    question: 'Explain REST API and its common HTTP methods.',
    type: 'technical',
    domain: 'Web Development',
    difficulty: 'easy',
    expectedAnswer: 'REST is an architectural style using resources and HTTP methods such as GET, POST, PUT, PATCH and DELETE.',
    keywords: ['REST', 'GET', 'POST', 'PUT', 'DELETE'],
    createdBy: admin._id
  },
  {
    question: 'Tell me about a difficult project problem you solved.',
    type: 'behavioral',
    domain: 'General',
    difficulty: 'medium',
    expectedAnswer: 'Use STAR: situation, task, action and result.',
    keywords: ['STAR', 'problem', 'action', 'result'],
    createdBy: admin._id
  }
]);

console.log('Seed complete');
console.log('Admin login:', adminEmail, 'Admin@123');
process.exit(0);
