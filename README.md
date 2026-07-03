# Student Grading Dashboard

A full-stack gradebook application for classrooms. Teachers can create assignments, review and grade student submissions (including file uploads), and track class progress; students can submit work, see their grades, and view their grade trend over time. Built as the final project for our web development course, extending our MVP into a deployed, authenticated, and tested application.

## Tech Stack

**Backend**
- Express.js
- TypeORM (ORM)
- Aiven MySQL (cloud database)
- jsonwebtoken (JWT authentication)
- bcrypt (password hashing)
- express-validator (request validation middleware)
- multer + Supabase Storage (assignment submission file uploads)
- pdfkit (PDF grade report export)
- Jest + Supertest (testing)
- Deployed on Render

**Frontend**
- React 19 + TypeScript
- Vite
- react-router-dom
- recharts (student grade progress chart)
- lucide-react (icons)

## Live Links

- Backend API: https://student-grading-system-nxfc.onrender.com/
- Frontend: _TODO — not deployed yet_
- Figma: _TODO — no Figma file yet_

## Team

| Name | GitHub Username |
|---|---|
| Anzor Tsiskarishvili | AleksandreJapharidze |
| Zurab Chanturidze | zurabchanturidze |
| Aleksandre Japharidze | adzoi |

## Setup

### Backend
```bash
cd server
npm install
tsc
npm start
```

Copy `server/.env.example` to `server/.env` and fill in:
- `DB_HOSTNAME`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET_STRING`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` (required for file uploads)

### Frontend
```bash
cd client
npm install
npm run dev
```

### Tests
```bash
cd server
npm install
tsc
npm test
```
