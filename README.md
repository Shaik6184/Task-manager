# TaskFlow (Task Manager)

Backend: Node/Express/TypeScript + Prisma + JWT + Postgres
Frontend: React + Vite (TypeScript)

## Local setup

Backend
1. cd backend
2. cp .env.example .env and set `DATABASE_URL` and `JWT_SECRET`
3. npm install
4. npm run prisma:push
5. npm run dev

Frontend
1. cd frontend
2. echo "VITE_API_URL=http://localhost:8080" > .env.local
3. npm install
4. npm run dev

## API summary
- POST /auth/register { email, password, name? }
- POST /auth/login { email, password }
- GET /tasks (Bearer)
- POST /tasks { title, description? }
- PUT /tasks/:id { title?, description?, completed? }
- PATCH /tasks/:id/toggle
- DELETE /tasks/:id

## Deploy (Render)
1. Push repo to GitHub.
2. Use Render Blueprint and select the repo; it reads `backend/render.yaml`.
3. Render provisions a free Postgres and sets `DATABASE_URL`.
4. Start command runs `prisma db push` before starting the server.

## Demo
Record a short 2-min screen capture: register, login, add/edit/toggle/delete tasks, show counters.

