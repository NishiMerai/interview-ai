# Interview AI Implementation Notes

## Architecture

The app uses a MERN split:

- `client`: Vite React SPA with lazy-loaded routes.
- `server`: Express REST API with MongoDB models and JWT auth.
- `server/uploads`: local development upload storage. Use Cloudinary/Firebase Storage in production.

## Main routes

Frontend:

- `/` landing
- `/login`
- `/register`
- `/app`
- `/app/resume`
- `/app/skill-gap`
- `/app/roadmap`
- `/app/interview`
- `/app/chatbot`
- `/app/admin`

Backend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `GET /api/dashboard`
- `POST /api/resumes/upload`
- `GET /api/resumes`
- `POST /api/skill-gap/analyze`
- `GET /api/skill-gap/reports`
- `POST /api/roadmaps`
- `GET /api/roadmaps`
- `POST /api/interviews/start`
- `PUT /api/interviews/:id/submit`
- `GET /api/chats`
- `POST /api/chats/message`
- `GET /api/admin/stats`
- `GET /api/admin/users`

## Production checklist

- Add MongoDB Atlas connection string.
- Add long random JWT secrets.
- Add OpenAI API key for real AI outputs.
- Replace local upload storage with Cloudinary or Firebase Storage.
- Add Google/GitHub OAuth.
- Add background queue for heavy resume parsing.
- Add Redis caching for dashboard/admin analytics.
- Add real DOCX parsing through `mammoth`.
- Add test suites for controllers and API contracts.
