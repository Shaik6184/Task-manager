# Task Manager Backend

Express + TypeScript + Prisma + JWT

## Prerequisites
- Node 18+
- Postgres database (local or hosted)

## Setup
1. Copy environment variables
```bash
cp .env.example .env
# edit DATABASE_URL and JWT_SECRET
```
2. Install deps & generate Prisma client
```bash
npm install
npm run prisma:generate
```
3. Apply schema to DB
```bash
# dev (creates migrations)
npm run prisma:migrate -- --name init
# or simple push
npm run prisma:push
```

## Develop
```bash
npm run dev
```
- API at http://localhost:8080
- Routes:
  - POST /auth/register { email, password, name? }
  - POST /auth/login { email, password }
  - GET /tasks (Bearer token)
  - POST /tasks { title, description? }
  - PUT /tasks/:id { title?, description?, completed? }
  - PATCH /tasks/:id/toggle
  - DELETE /tasks/:id

## Build & Run
```bash
npm run build
npm start
```

## Deploy on Render
1. Push to GitHub.
2. In Render, New + Blueprint, pick this repo.
3. Confirm `render.yaml`.
4. Render creates a free Postgres and sets `DATABASE_URL`.
5. Start command runs `npm run start:prod` which runs `prisma db push` then starts the server.

## Notes
- JWT expiry: 7 days
- Update CORS as needed in `src/index.ts`.
