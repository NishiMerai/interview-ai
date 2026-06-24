# Interview AI

Interview AI is a MERN-based placement preparation platform with resume analysis, ATS scoring, skill-gap detection, personalized learning roadmaps, AI mock interviews, chatbot guidance, dashboard metrics, and an admin panel.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Redux Toolkit, TanStack Query, Recharts, React Hook Form, Zod
- Backend: Node.js, Express.js, MongoDB Atlas, JWT auth, Multer uploads
- AI: OpenAI-ready service layer with fallback demo mode

## How to run

```bash
cd interview-ai
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `"https://interview-ai-back-d6w7.onrender.com"`

## Important environment variables

Set these in `server/.env`:

```env
MONGO_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/interview_ai
JWT_SECRET=interview_ai_access_secret_2026_nishi_123_xyz
OPENAI_API_KEY=optional_for_real_ai
```

If `OPENAI_API_KEY` is empty, the app still runs using realistic demo AI responses.

## Demo admin login

Open `/admin-login` and click **Create/repair demo admin**.

Default demo admin:

```txt
Email: admin@interviewai.local
Password: Admin@123
```

Normal users can register from `/register`.

## Project structure

```txt
interview-ai/
  client/       React frontend
  server/       Express backend
  .github/      CI workflow
```
