import InterviewSession from '../models/InterviewSession.js';
import { createInterviewQuestions, gradeInterviewAnswer } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const startInterview = asyncHandler(async (req, res) => {
  const {
    type = 'technical',
    mode = 'text',
    domain = 'Web Development',
    targetRole = 'MERN Developer',
    difficulty = 'Beginner'
  } = req.body;

  let generated;
  try {
    generated = await createInterviewQuestions({ type, domain, targetRole, difficulty });
  } catch (aiError) {
    console.error('AI question generation failed, using fallback:', aiError.message);
    generated = getFallbackQuestions({ domain, type, difficulty });
  }

  // Ensure we always have questions
  if (!generated.questions || generated.questions.length === 0) {
    generated = getFallbackQuestions({ domain, type, difficulty });
  }

  const session = await InterviewSession.create({
    userId: req.user._id,
    type,
    mode,
    domain,
    difficulty,
    targetRole,
    questions: generated.questions
  });

  res.status(201).json({ session });
});

export const submitInterview = asyncHandler(async (req, res) => {
  const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });

  if (!session) {
    res.status(404);
    throw new Error('Interview session not found');
  }

  let graded;
  try {
    graded = await gradeInterviewAnswer({ questions: req.body.questions || [] });
  } catch (aiError) {
    console.error('AI grading failed, using basic scoring:', aiError.message);
    graded = {
      overallScore: 50,
      questions: (req.body.questions || []).map(q => ({
        ...q,
        score: q.userAnswer && q.userAnswer.trim().length > 10 ? 60 : 20,
        strengths: ['Answer was submitted'],
        improvements: ['AI evaluation unavailable — try again later'],
        betterAnswer: q.expectedAnswer || 'N/A'
      }))
    };
  }

  Object.assign(session, graded);
  await session.save();

  res.json({ session });
});

export const listInterviews = asyncHandler(async (req, res) => {
  const sessions = await InterviewSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ sessions });
});

// ── Fallback questions when AI is unavailable ──────────────────────────
function getFallbackQuestions({ domain = 'Web Development', type = 'technical', difficulty = 'Beginner' }) {
  const fallbacks = {
    'Web Development': {
      technical: {
        Beginner: [
          { question: 'What is the difference between HTML and HTML5?', expectedAnswer: 'HTML5 introduced semantic elements like <header>, <footer>, <section>, multimedia tags <audio>, <video>, local storage, and Canvas API.' },
          { question: 'Explain the CSS Box Model.', expectedAnswer: 'Every element is a box with content, padding, border, and margin. box-sizing: border-box includes padding and border in the width.' },
          { question: 'What is the difference between let, const, and var in JavaScript?', expectedAnswer: 'var is function-scoped and hoisted. let and const are block-scoped. const cannot be reassigned after declaration.' },
          { question: 'What is the DOM?', expectedAnswer: 'The Document Object Model is a tree-like representation of HTML that JavaScript can manipulate to dynamically change content, structure, and styles.' },
          { question: 'What is responsive web design?', expectedAnswer: 'Designing websites to adapt to different screen sizes using media queries, flexible grids, and fluid images.' }
        ],
        Intermediate: [
          { question: 'Explain the event loop in JavaScript.', expectedAnswer: 'JavaScript is single-threaded. The event loop manages the call stack and callback queue, processing async operations from microtask and macrotask queues.' },
          { question: 'What is the Virtual DOM in React?', expectedAnswer: 'A lightweight in-memory representation of the real DOM. React diffs the virtual DOM to minimize real DOM updates for performance.' },
          { question: 'Explain RESTful API design principles.', expectedAnswer: 'Stateless, uniform interface, resource-based URLs, proper HTTP methods (GET, POST, PUT, DELETE), and appropriate status codes.' },
          { question: 'What is CORS and why is it important?', expectedAnswer: 'Cross-Origin Resource Sharing restricts web pages from making requests to different domains. It is a security feature controlled by HTTP headers.' },
          { question: 'What are closures in JavaScript?', expectedAnswer: 'A closure is a function that remembers variables from its outer scope even after the outer function has returned.' }
        ],
        Advanced: [
          { question: 'Explain micro-frontends architecture.', expectedAnswer: 'Breaking a frontend into independently deployable modules owned by different teams, integrated via module federation, iframes, or web components.' },
          { question: 'How does server-side rendering differ from static site generation in Next.js?', expectedAnswer: 'SSR generates HTML per request on the server. SSG generates HTML at build time. SSR is better for dynamic content, SSG for static content with better performance.' },
          { question: 'Explain WebSockets vs HTTP polling.', expectedAnswer: 'WebSockets provide full-duplex communication over a persistent connection. HTTP polling repeatedly sends requests, creating overhead. WebSockets are better for real-time apps.' },
          { question: 'How would you optimize a React application for performance?', expectedAnswer: 'Code splitting, React.memo, useMemo, useCallback, lazy loading, virtualization for long lists, proper key usage, and avoiding unnecessary re-renders.' },
          { question: 'Explain database indexing strategies for MongoDB.', expectedAnswer: 'Compound indexes, text indexes, TTL indexes, partial indexes. Use explain() to analyze query plans. Index fields used in queries, sorts, and lookups.' }
        ]
      }
    }
  };

  // Try to get domain+type+difficulty specific questions
  const domainQuestions = fallbacks[domain]?.[type]?.[difficulty];
  if (domainQuestions) {
    return {
      domain, type, difficulty,
      questions: domainQuestions.map((q) => ({ ...q }))
    };
  }

  // Generic fallback
  const genericQuestions = [
    { question: `What are the core concepts of ${domain}?`, expectedAnswer: `Key fundamentals, principles, and common tools used in ${domain}.` },
    { question: `Describe a project you have built related to ${domain}.`, expectedAnswer: `A real-world project demonstrating practical skills in ${domain}.` },
    { question: `What are current trends in ${domain}?`, expectedAnswer: `Latest technologies, frameworks, and best practices in ${domain}.` },
    { question: `How do you stay updated with ${domain} developments?`, expectedAnswer: `Following blogs, documentation, communities, and building side projects.` },
    { question: `What challenges have you faced in ${domain} and how did you solve them?`, expectedAnswer: `Problem-solving approach, debugging techniques, and learning from mistakes.` }
  ];

  return {
    domain, type, difficulty,
    questions: genericQuestions.map((q) => ({ ...q }))
  };
}
