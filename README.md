## Journal AI App

An AI‑assisted mood journaling app. The frontend lets you record how you feel and view your history; the backend stores entries in PostgreSQL and generates short supportive responses using Google’s Gemini API.

### Project structure

- **backend** – Express API, Prisma, PostgreSQL, Gemini integration  
- **frontend** – Vite + vanilla JS single‑page UI  
- **docker-compose.yml** – Local Docker setup for the backend and Postgres

### Prerequisites

- Node.js 20+
- npm
- Docker (for the containerised setup)
- A Gemini API key from Google AI Studio

### Environment variables

#### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in:

- **`GEMINI_API_KEY`** – your Gemini API key  
- **`DATABASE_URL`** – PostgreSQL connection string  
  - For Docker setup (matches `docker-compose.yml`):  
    `postgresql://postgres:postgres@db:5432/journal_db?schema=public`
- **`PORT`** – backend port (default `3000`)

> When running the backend directly on your host instead of Docker, point `DATABASE_URL` at your local Postgres instance (for example `postgresql://postgres:postgres@localhost:5433/journal_db?schema=public` if you expose the container on `5433`).

### Running without Docker (local dev)

1. **Install backend deps and apply schema**

   ```bash
   cd backend
   npm install
   npx prisma db push
   ```

2. **Start the backend**

   ```bash
   npm run dev
   ```

   The API will listen on `http://localhost:3000`.

3. **Install and start the frontend**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

   Open the URL printed by Vite (usually `http://localhost:5173`).  
   The frontend is already configured to call `http://localhost:3000` by default.

### Running with Docker

1. Ensure `backend/.env` is configured for the Docker network, for example:

   ```env
   GEMINI_API_KEY=your-key
   DATABASE_URL=postgresql://postgres:postgres@db:5432/journal_db?schema=public
   PORT=3000
   ```

2. From the project root, build and start services:

   ```bash
   docker compose up --build
   ```

   This starts:

   - `journal-db` (Postgres on host port `5433`, container port `5432`)
   - `journal-backend` (Express API on port `3000`)

3. Start the frontend as in the local dev section, and use `http://localhost:3000` as the API base.

### Key endpoints

- `GET /entries` – list all journal entries  
- `POST /entries` – create a new entry and get an AI response  
  - Request body: `{ "mood": "string" }`

### Notes

- Prisma migrations/schema live in `backend/prisma`.  
- If you see errors about missing tables (`P2021`), run `npx prisma db push` from `backend` to sync the schema to the database.

