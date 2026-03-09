---
name: journal-ai-app-setup
overview: Set up a full-stack AI-powered journaling app with Node.js/Express, Prisma/PostgreSQL, Vite frontend, Docker, and deploy it to Railway/Vercel, explaining each step in very simple terms.
todos:
  - id: phase-01-setup
    content: Create project root with backend/frontend, initialize Node.js backend, install dependencies, scaffold Vite frontend, and set up .env/.gitignore.
    status: completed
  - id: phase-02-db
    content: Initialize Prisma, define JournalEntry model, configure local PostgreSQL connection, run first migration, and verify with Prisma Studio.
    status: completed
  - id: phase-03-backend-api
    content: Implement Express server with POST/GET /entries, integrate Prisma and Anthropic SDK, and add error handling.
    status: in_progress
  - id: phase-04-frontend
    content: Build Vite + Vanilla JS UI, connect to backend, display AI responses and history, and add basic styling.
    status: pending
  - id: phase-05-docker
    content: Add backend Dockerfile, docker-compose.yml for backend+Postgres, .dockerignore, and run local end-to-end test via Docker.
    status: pending
  - id: phase-06-sharing
    content: Initialize git, push to GitHub, write README, test fresh-clone onboarding, and set up ngrok preview.
    status: pending
  - id: phase-07-deploy
    content: Deploy backend and PostgreSQL to Railway, frontend to Vercel, configure environment, and verify live app end-to-end.
    status: pending
isProject: false
---

## Goal

Build a small journaling web app where a user types feelings into a box, the backend sends them to Claude, stores both the text and reply in PostgreSQL, and shows history. We will do it in clear, tiny steps, explaining each like to a beginner.

---

## Technology & concept reference (what to use and why)

Use this section as a glossary. Everything we use in the project is listed here with a short “what it is” and “why we use it.”

### Runtime and package management

- **Node.js** — A JavaScript runtime that runs JS outside the browser (on your machine or a server). We use it to run the backend API. You need it installed (e.g. from nodejs.org or via nvm).
- **npm** — Node’s default package manager. It reads `package.json` and installs dependencies into `node_modules`. Commands: `npm init`, `npm install`, `npm run <script>`.
- **package.json** — A manifest file that lists the project name, version, and **dependencies** (libraries the app needs) and **scripts** (e.g. `npm run dev` runs the dev server). Created by `npm init -y`.
- **package-lock.json** — Lockfile that pins exact versions of every installed package so everyone gets the same versions. Commit this to git.
- **npx** — Runs a package without installing it globally (e.g. `npx prisma init` runs the `prisma` CLI from the project).

### Backend (Node.js + Express)

- **Express** — A minimal HTTP framework for Node.js. It lets you define **routes** (e.g. “when someone POSTs to /entries, run this function”) and **middleware** (e.g. parse JSON body, enable CORS). We use it as the only HTTP server library.
- **Package to install:** `express`. We use it to create the app, add `app.use(express.json())`, `app.get('/entries', ...)`, `app.post('/entries', ...)`, and `app.listen(PORT)`.

### Database and ORM

- **PostgreSQL** — A relational database: it stores data in **tables** (rows and columns). We use it to store journal entries so they persist across restarts and can be queried. It runs as a separate process (or container); our app connects to it via a URL.
- **Prisma** — An ORM (Object–Relational Mapper) for Node.js. You define your **schema** (tables and columns) in `prisma/schema.prisma` in a readable language; Prisma generates SQL migrations and a **client** (`@prisma/client`) so you can run commands like `prisma.journalEntry.create({ data: { ... } })` instead of raw SQL.
- **Packages:** `prisma` (CLI, dev dependency) and `@prisma/client` (runtime client, dependency). The CLI is used for `prisma init`, `prisma migrate dev`, `prisma studio`; the client is imported in code to read/write the database.
- **schema.prisma** — Single source of truth for your DB shape (data source URL, generator, and models like `JournalEntry`). Editing it and running `prisma migrate dev` updates the real database.
- **Migration** — A set of SQL changes (e.g. “create table JournalEntry”) that Prisma generates from schema changes. `prisma migrate dev` creates and applies migrations in development; `prisma migrate deploy` only applies existing migrations (used in production).
- **Prisma Studio** — A small web UI (`npx prisma studio`) that opens a local page where you can browse and edit tables. Useful to verify data.

### AI integration

- **Anthropic Claude API** — Anthropic’s API to send text to Claude and get a response. You need an **API key** from the Anthropic console (dashboard.anthropic.com) to authenticate. Never put the key in code; use an environment variable.
- **Package:** `@anthropic-ai/sdk` — Official Node.js SDK. You create a client with the API key and call methods to send a message and receive the model’s reply. We use it in one place: “send the user’s journal text to Claude and return the response.”

### Frontend (Vite + Vanilla JS)

- **Vite** — A frontend build tool and dev server. It serves your HTML/JS/CSS, supports ES modules, and can bundle for production. We use the **vanilla** template (no React/Vue) so the frontend is plain HTML + JS + CSS.
- **Vanilla JS** — Plain JavaScript in the browser, no framework. We use the browser’s built-in `fetch()` to call the backend and the DOM API to update the page (e.g. `document.querySelector`, `element.textContent`, `element.innerHTML`).
- **Why Vite and not plain files?** — Vite gives a fast dev server, env variable injection (e.g. `import.meta.env.VITE_API_BASE_URL`), and a single command to build for production (e.g. for Vercel).
- **Frontend entry points:** `index.html` is the single page; it loads `src/main.js`, which handles form submit and fetching entries. `src/style.css` is for layout and styling.

### Environment and configuration

- **.env** — A file (in project root or in `backend/`) that holds **environment variables** as `KEY=value` lines. The app reads them at runtime (e.g. `process.env.ANTHROPIC_API_KEY` in Node). Never commit `.env` to git (it contains secrets).
- **.gitignore** — Tells git which files/folders to ignore. We include `node_modules`, `.env`, `.env.*`, build outputs, and OS/editor files so they are not committed.
- **Environment variables we use:**
  - **Backend:** `PORT` (server port, default 3000), `DATABASE_URL` (PostgreSQL connection string), `ANTHROPIC_API_KEY` (Claude API key).
  - **Frontend (Vite):** `VITE_API_BASE_URL` — only variables prefixed with `VITE_` are exposed to the browser; we use this for the backend URL in production (e.g. your Railway URL).

### Networking and browser–server communication

- **CORS (Cross-Origin Resource Sharing)** — Browsers block frontend (e.g. localhost:5173) from calling a different origin (e.g. localhost:3000) unless the server sends specific headers. We add the `cors` middleware to Express so the frontend can call the API.
- **Package (backend):** `cors` — `app.use(cors())` allows requests from any origin in development; in production you can restrict to your Vercel domain.
- **fetch()** — Browser API to send HTTP requests. We use `fetch('http://localhost:3000/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood: '...' }) })` and then `.then(res => res.json())` to get the response.

### Docker

- **Docker** — Runs apps in **containers**: lightweight, isolated environments so “it works on my machine” becomes “it runs the same everywhere.” We use it so teammates and production run the same Node + Postgres setup.
- **Dockerfile** — Recipe to build one **image** (e.g. “Node 20, copy app, run npm install, start the server”). We have one Dockerfile in `backend/` for the API.
- **docker-compose.yml** — Defines multiple **services** (e.g. `db` and `backend`) and their options: which image or build, ports, environment variables, and that `backend` depends on `db`. One command (`docker compose up`) starts both.
- **.dockerignore** — Like .gitignore but for the Docker build context. We exclude `node_modules`, `.env`, and other unneeded files so the image stays small and secure.
- **Why backend connects to hostname `db`** — In Docker Compose, services talk to each other by **service name**. So `DATABASE_URL` uses `db` as the host (e.g. `postgresql://user:pass@db:5432/journal_db`), not `localhost`.

### Deployment and sharing

- **Git** — Version control. We use it to track changes and push to GitHub so the code is in one place and deployable by Railway/Vercel.
- **GitHub** — Hosts the git repository. Railway and Vercel connect to this repo to pull code and deploy on push.
- **Railway** — Hosting for the backend and PostgreSQL. We deploy the backend as a Docker container (or Node service) and add a managed Postgres database, then link them with `DATABASE_URL`.
- **Vercel** — Hosting for static frontends. We point it at the `frontend` folder of the repo; it runs `npm run build` and serves the built files. We set `VITE_API_BASE_URL` so the frontend calls the Railway backend URL.
- **ngrok** — Creates a temporary public URL (e.g. `https://abc123.ngrok.io`) that tunnels to a port on your machine (e.g. 3000). Useful to share the running app with someone without deploying.

### Summary: one sentence per piece


| Piece           | What to use                      | Why                                                 |
| --------------- | -------------------------------- | --------------------------------------------------- |
| Backend runtime | Node.js                          | Runs our Express server.                            |
| HTTP server     | Express                          | Routes and middleware for POST/GET /entries.        |
| Database        | PostgreSQL                       | Stores journal entries.                             |
| DB access       | Prisma (schema + @prisma/client) | Type-safe queries and migrations.                   |
| AI              | Anthropic SDK + Claude API       | Get AI reply from journal text.                     |
| Frontend tool   | Vite (vanilla template)          | Dev server and production build.                    |
| Frontend code   | Vanilla JS + fetch               | No framework; call API and update DOM.              |
| Env vars        | .env + .gitignore                | Keep API key and DB URL out of git.                 |
| Cross-origin    | cors middleware                  | Let frontend call backend from another port/domain. |
| Containers      | Docker + docker-compose          | Same backend + DB everywhere.                       |
| Deploy backend  | Railway                          | Run Node + Postgres in the cloud.                   |
| Deploy frontend | Vercel                           | Host static site, set API URL.                      |
| Sharing         | GitHub + README                  | One place for code; docs for clone and run.         |
| Demo            | ngrok                            | Temporary public URL to local app.                  |


### Exact package names and commands (copy-paste reference)

- **Backend install (from `backend/`):**
  - `npm install express @prisma/client @anthropic-ai/sdk cors`
  - `npm install -D prisma nodemon`
- **Prisma (from `backend/`):**
  - `npx prisma init`
  - `npx prisma migrate dev --name init_journal`
  - `npx prisma generate` (run after schema or migration changes if needed)
  - `npx prisma studio`
  - `npx prisma migrate deploy` (production only)
- **Vite frontend (from project root then `frontend/`):**
  - `npm create vite@latest frontend -- --template vanilla`
  - `cd frontend && npm install`
  - `npm run dev` (dev server), `npm run build` (production build)
- **Docker (from project root):**
  - `docker compose up --build`
  - `docker compose down` (stop services)

### Key files and what they are for


| File or folder                       | Purpose                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| `backend/package.json`               | Backend dependencies and scripts (`dev`, `start`).      |
| `backend/src/server.js`              | Express app: routes, middleware, listen.                |
| `backend/src/prismaClient.js`        | Single Prisma client instance for DB.                   |
| `backend/src/anthropicClient.js`     | Anthropic client and `getJournalingResponse()`.         |
| `backend/prisma/schema.prisma`       | Data model (JournalEntry) and DB connection.            |
| `backend/prisma/migrations/`         | SQL migrations; do not edit by hand.                    |
| `backend/.env`                       | `DATABASE_URL`, `ANTHROPIC_API_KEY` (never commit).     |
| `backend/Dockerfile`                 | How to build the backend container.                     |
| `frontend/index.html`                | Single HTML page; loads `src/main.js`.                  |
| `frontend/src/main.js`               | Fetch to API, form submit, render history and response. |
| `frontend/src/style.css`             | Layout and styling.                                     |
| `frontend/.env` or `.env.production` | Optional: `VITE_API_BASE_URL` for production.           |
| `docker-compose.yml` (root)          | Defines `db` and `backend` services.                    |
| `backend/.dockerignore`              | Excludes node_modules, .env from Docker build.          |
| `.gitignore` (root)                  | Excludes node_modules, .env, dist from git.             |


---

## High-level architecture

- **Frontend (`/frontend`)**: Vite + Vanilla JS single page that talks to the backend via HTTP.
- **Backend (`/backend`)**: Node.js + Express server exposing `/entries` POST/GET, using Prisma to talk to PostgreSQL and the Anthropic SDK to talk to Claude.
- **Database**: PostgreSQL, with a single `JournalEntry` table.
- **Containerization**: Docker and `docker-compose` to run backend + Postgres locally and later on Railway.
- **Deployments**: Backend + DB to Railway, frontend to Vercel, code stored in GitHub.

We will follow the phases you listed, keeping each step small and explicit.

---

## Phase 01 — Project setup

**What this phase does:** Creates the folder structure, turns the backend into a real Node project with a dependency list, scaffolds the frontend with Vite, and prepares a place for secrets (API key, DB URL) that must never be committed.

- **Create folders**
  - Make a root project folder, for example `journal-ai-app` (e.g. `mkdir journal-ai-app && cd journal-ai-app`).
  - Inside it, create two subfolders: `backend` and `frontend`. Everything that runs on the server (API, Prisma, DB connection) lives in `backend`; everything the user sees in the browser (HTML, JS, CSS) lives in `frontend`.
- **Initialize Node.js in backend**
  - `cd backend` then run `npm init -y`. The `-y` flag accepts default answers so you get a `package.json` without prompts. That file will list dependencies and scripts; we add dependencies next.
- **Install backend dependencies**
  - **Runtime dependencies** (needed when the app runs):
    - `express` — HTTP server and routing.
    - `@prisma/client` — Generated client to query the database from code (used after we run `prisma generate`).
    - `@anthropic-ai/sdk` — Official SDK to call the Claude API.
    - `cors` — Middleware so the browser (frontend) is allowed to call this API from another port or domain.
  - **Dev dependencies** (only for development):
    - `prisma` — CLI for schema, migrations, and Prisma Studio (`npx prisma ...`).
    - `nodemon` — Watches file changes and restarts the Node server so you don’t restart by hand.
  - Example command: `npm install express @prisma/client @anthropic-ai/sdk cors` then `npm install -D prisma nodemon`.
  - **Scripts in package.json:** Add `"start": "node src/server.js"` and `"dev": "nodemon src/server.js"` so `npm run dev` starts the server with auto-restart. Optionally add `"prisma:generate": "prisma generate"` and run it after pulling or after schema changes.
- **Initialize Vite frontend**
  - From the **project root** (not inside `frontend`), run: `npm create vite@latest frontend -- --template vanilla`. This creates or fills the `frontend` folder with `index.html`, `src/main.js`, `src/style.css`, and a minimal Vite config. Then `cd frontend` and run `npm install` to install Vite and its dependencies. You will run the frontend with `npm run dev` from inside `frontend` (typically on port 5173).
- **Environment variables setup**
  - Create a `.env` file. Common approach: put it in **backend** (e.g. `backend/.env`) so the backend and Prisma both use it, or at project root if you prefer a single file. It should contain at least:
    - `ANTHROPIC_API_KEY=sk-ant-...` (you get this from the Anthropic console; leave a placeholder until you have it).
    - `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public` — for local Docker we’ll set this to point at the `db` service (e.g. `postgresql://postgres:postgres@localhost:5432/journal_db?schema=public` when using compose with port 5432 exposed).
  - Create a **.gitignore** at the project root (and ensure backend’s .gitignore doesn’t commit secrets) with lines such as: `node_modules/`, `.env`, `.env.`*, `dist/`, `.DS_Store`, `*.log`. This keeps secrets and generated files out of git.

---

## Phase 02 — Database setup with Prisma + PostgreSQL

**What this phase does:** Defines how journal data is stored (one table with id, mood text, AI response, and timestamp), connects the app to PostgreSQL, and creates that table in the database. Prisma is the only layer that talks to the DB; we never write raw SQL in the app.

- **Initialize Prisma in backend**
  - From the `backend` folder run `npx prisma init`. This creates a `prisma` directory with `schema.prisma` and may add a `.env` line for `DATABASE_URL`. Keep your env in one place (e.g. `backend/.env`) and ensure `schema.prisma` reads from the same file.
- **Define the `JournalEntry` model**
  - Open `backend/prisma/schema.prisma`. You’ll see a `datasource db` block (pointing at `env("DATABASE_URL")`) and a `generator client` block. Add a model:
    - **id** — Unique identifier. Use `Int @id @default(autoincrement())` or `String @id @default(uuid())`; we use this when returning or querying a single entry.
    - **mood** — `String` — the user’s journal text (required).
    - **aiResponse** — `String` — Claude’s reply (we can use `?` for optional if we ever save before the AI responds; for our flow it’s required after we get the response).
    - **createdAt** — `DateTime @default(now())` — when the row was created.
  - Prisma will map this to a table named `JournalEntry` (or the name you give the model). No other tables are required for this app.
- **Configure PostgreSQL connection**
  - In `backend/.env` set `DATABASE_URL`. For **local Docker** (Phase 05) we’ll use a Postgres container; you can use the same URL format now if Postgres is already running (e.g. via Docker), e.g. `postgresql://postgres:postgres@localhost:5432/journal_db?schema=public`. The `schema=public` is standard for Prisma. When we add docker-compose, the backend container will use host `db` instead of `localhost`.
- **Run first migration**
  - From `backend` run `npx prisma migrate dev --name init_journal`. Prisma will create a migration file under `prisma/migrations/` and apply it to the database, creating the `JournalEntry` table. It also runs `prisma generate`, which updates `node_modules/@prisma/client` so your code can use the model.
- **Verify with Prisma Studio**
  - From `backend` run `npx prisma studio`. A browser tab opens; select the `JournalEntry` table and confirm it has columns `id`, `mood`, `aiResponse`, `createdAt`. You can add a test row by hand to confirm writes work.

---

## Phase 03 — Backend API with Node.js + Express

**What this phase does:** Builds the HTTP API that the frontend will call: one endpoint to create an entry (user text + AI response saved to DB) and one to list all entries. The server also calls the Claude API and uses Prisma for all database access.

- **Basic Express server**
  - Create `backend/src/server.js` as the single entry point. In it: `const express = require('express')`; create the app with `const app = express()`; add `app.use(express.json())` so request bodies are parsed as JSON; add `app.use(cors())` (after `require('cors')`) so the browser can call this server from another origin. Read `PORT` from `process.env.PORT || 3000` and start the server with `app.listen(PORT, () => console.log(...))`. All route handlers will be added to this same `app`.
- **Prisma client wiring**
  - Create `backend/src/prismaClient.js` that does `const { PrismaClient } = require('@prisma/client')`, then `module.exports = new PrismaClient()`. We use a single shared instance so we don’t open multiple DB connections. In `server.js` (or in route files), require this module and use it for all DB operations (e.g. `prisma.journalEntry.create`, `prisma.journalEntry.findMany`).
- **Integrate Anthropic SDK**
  - Create `backend/src/anthropicClient.js`. Require the SDK and read `ANTHROPIC_API_KEY` from `process.env`. Instantiate the Anthropic client with that key. Export a function such as `async function getJournalingResponse(userText)` that calls the messages API (or the equivalent in the SDK you use) with: a **system** prompt that says the AI is a supportive journaling assistant and should respond briefly and encouragingly; the **user** message set to `userText`. Return the assistant’s text response. If the key is missing, you can throw a clear error so the API returns 500 with a “server misconfiguration” style message.
- **POST `/entries` endpoint**
  - In `server.js`, add `app.post('/entries', async (req, res) => { ... })`. Read `mood` from `req.body.mood` (or `req.body.text` if you prefer; keep the same name as the frontend). If missing or empty, send `res.status(400).json({ error: 'Missing mood/text' })`. Otherwise call `getJournalingResponse(mood)`, then use the Prisma client to `prisma.journalEntry.create({ data: { mood, aiResponse: responseFromClaude } })`. Return `res.status(201).json(createdEntry)`. Wrap the logic in try/catch: on Anthropic or DB errors, log the error and send `res.status(500).json({ error: 'Failed to save entry or get AI response' })` (or similar) so the frontend can show a message.
- **GET `/entries` endpoint**
  - Add `app.get('/entries', async (req, res) => { ... })`. Use `prisma.journalEntry.findMany({ orderBy: { createdAt: 'desc' } })` and return `res.json(entries)`. Optionally wrap in try/catch and return 500 on DB errors.
- **CORS and config**
  - We already use `app.use(cors())` so the frontend (e.g. Vite on port 5173 or Vercel domain) can call the API. All config comes from the environment: `PORT`, `DATABASE_URL` (used by Prisma), `ANTHROPIC_API_KEY` (used by the Anthropic helper). No secrets in code.
- **Manual test**
  - Start the backend with `npm run dev` from `backend`. Then use `curl -X POST http://localhost:3000/entries -H "Content-Type: application/json" -d '{"mood":"Today I felt calm"}'` and confirm you get a JSON response with the created entry and an AI reply. Call `curl http://localhost:3000/entries` and confirm the new entry appears in the list. (If you don’t have an API key yet, POST will fail until you add it to `.env`.)

---

## Phase 04 — Frontend with Vite + Vanilla JS

**What this phase does:** Builds the one page users see: a place to type their mood, a button to submit, an area that shows the latest AI reply, and a history list of past entries. The frontend only talks to the backend via `fetch`; it does not touch the database or Claude.

- **HTML layout**
  - In `frontend/index.html`, keep the existing structure but ensure there is a root element (e.g. `<div id="app">`) and that `src/main.js` is loaded as a module. Inside the root, add: a heading (e.g. “Journal”); a `<form>` or a `<textarea>` plus a `<button type="submit">` for the journal input; a `<div>` or `<section>` with an id like `response-area` for the latest AI response; a `<div>` or `<section>` with an id like `history` for the list of past entries. Give the textarea and button clear ids or names so JS can reference them (e.g. `id="mood-input"`, `id="submit-btn"`). The history section can start empty; we fill it from JS.
- **Basic styling**
  - In `frontend/src/style.css`, add styles so the page is readable: a simple font (e.g. system font stack or a Google font), max-width and margin auto to center the content, padding for the textarea and buttons, and card-style blocks for each history item (border or box-shadow, spacing). Make the history container scrollable (e.g. `max-height` and `overflow-y: auto`) if the list can get long.
- **API base URL**
  - In `main.js`, define a constant for the backend base URL, e.g. `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'`. Vite exposes env vars that start with `VITE`_ as `import.meta.env.VITE`_*. In development we don’t set it, so it falls back to localhost:3000; for production we set `VITE_API_BASE_URL` in Vercel to the Railway backend URL.
- **Load entry history on page load**
  - When the page loads, call `fetch(API_BASE + '/entries')`, then `.then(res => res.json())`, then a function that receives the array of entries and **renders** them into the `#history` (or equivalent) element. For each entry show: date (format `createdAt` for readability), user mood text, and AI response. You can build HTML strings and set `innerHTML` or create elements with `createElement` and append. Order is already descending from the API.
- **Handle new submissions**
  - Attach a listener to the form’s `submit` event (or the button’s `click`). Prevent default form submit. Read the current value from the textarea. If empty, optionally show a short message and return. Otherwise call `fetch(API_BASE + '/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood: text }) })`. On success (response ok), get the JSON body, update the “latest response” area with the new entry’s `aiResponse`, prepend the new entry to the history list in the DOM, and clear the textarea. On failure, show an error message (e.g. “Something went wrong. Try again.”).
- **Manual test**
  - Start backend (`npm run dev` in `backend`) and frontend (`npm run dev` in `frontend`). Open the Vite URL (e.g. [http://localhost:5173](http://localhost:5173)). Submit a journal entry and confirm the AI response appears and the entry shows in history; refresh the page and confirm history still loads from the API.

---

## Phase 05 — Docker configuration

**What this phase does:** Puts the backend and PostgreSQL into containers so anyone can run “backend + database” with one command (`docker compose up`) without installing Node or Postgres. The frontend can still run on your machine with Vite and point at the backend on port 3000.

- **Backend Dockerfile**
  - Create `backend/Dockerfile`. Each instruction is a layer. Use `FROM node:20-alpine` so we have Node and npm in a small image. Set `WORKDIR /app` so all following commands run inside `/app` in the container. Copy only `package.json` and `package-lock.json` first, then run `npm install` (or `npm ci` for reproducible installs)—this way dependency install is cached unless those files change. Copy the rest of the app (e.g. `COPY . .` or `COPY src prisma .` as needed). Run `npx prisma generate` so `@prisma/client` is generated for the production environment. Set `ENV NODE_ENV=production` if you want. Expose port 3000 with `EXPOSE 3000`. Set the default command to start the server, e.g. `CMD ["node", "src/server.js"]` or `CMD ["npm", "start"]`. Optionally add a startup script that runs `prisma migrate deploy` before starting the server so migrations apply on first run.
- **docker-compose for backend + Postgres**
  - Create `docker-compose.yml` at the **project root**. Define two services. **db:** image `postgres:16` (or 15), environment: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (e.g. `journal_db`). Expose port `5432:5432` so you can connect from the host if needed. **backend:** build context `./backend`, dockerfile `backend/Dockerfile`. `depends_on: - db` so the db starts first. Environment: pass `DATABASE_URL` (e.g. `postgresql://postgres:postgres@db:5432/journal_db?schema=public`—host is `db`, the service name) and `ANTHROPIC_API_KEY` (from env_file or from the host’s `.env`). Expose `3000:3000`. Both services are on the same Docker network by default, so the backend can reach Postgres at hostname `db`.
- **.dockerignore**
  - Create `backend/.dockerignore` with lines: `node_modules`, `npm-debug.log`, `.env`, `.env.`*, `dist`, `.git`. This keeps local and secret files out of the build context and keeps the image smaller and safer.
- **Local end-to-end test**
  - From project root run `docker compose up --build`. Wait until both services are up. The backend must have `DATABASE_URL` pointing at `db`; if the backend runs migrations on startup, the table will exist. Open [http://localhost:3000/entries](http://localhost:3000/entries) in the browser (or use curl) to confirm the API responds. Run the frontend locally (`cd frontend && npm run dev`) and set the API base to `http://localhost:3000`; submit an entry and check history. No need to install PostgreSQL or run the backend with Node directly for this test.

---

## Phase 06 — Team sharing & testing

**What this phase does:** Puts the code on GitHub so others can clone it, documents how to run the app with one command, and optionally exposes your local run to the internet (ngrok) for demos before production deploy.

- **Initialize git and GitHub repo**
  - In the project root run `git init`. Ensure `.gitignore` is in place (node_modules, .env, dist, etc.) so no secrets or dependencies are committed. Create a new **private** repository on GitHub (no need for a README or .gitignore there if you already have them). Add the remote: `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`. Stage all files (`git add .`), commit (`git commit -m "Initial commit: journal app with backend, frontend, Docker"`), then push (`git push -u origin main` or the branch name your repo uses). From then on, pushes to this repo will be the source for Railway and Vercel.
- **Write README.md**
  - At project root add `README.md`. Include: a short description (“AI-powered journal: write a mood, get a supportive response from Claude, and see history”); **Prerequisites** (Docker installed and running; optionally Node/npm if someone wants to run frontend or backend without Docker); **How to run** — copy `.env.example` to `.env` (if you add an example file with placeholder keys), fill in `ANTHROPIC_API_KEY` and ensure `DATABASE_URL` matches the compose Postgres settings, then run `docker compose up` and open the frontend (either build and serve the frontend separately or document that for now the API is at [http://localhost:3000](http://localhost:3000) and the frontend can be run with `cd frontend && npm install && npm run dev`). Mention that the backend runs on port 3000 and the frontend dev server on 5173.
- **Teammate onboarding test**
  - In a different folder (or on another machine), clone the repo, add a `.env` with the required variables (or use a shared env template), run `docker compose up`, and confirm the backend and DB start. If the teammate runs the frontend with `npm run dev` in `frontend`, they should be able to submit an entry and see history. This validates that “clone + env + docker compose up” is enough to run the app.
- **Stakeholder preview with ngrok**
  - Install ngrok (e.g. from ngrok.com or via Homebrew). Start the full app locally (e.g. `docker compose up` for backend + DB; run the frontend dev server if you want to share the UI, or only the API). Run `ngrok http 3000` to expose port 3000 (backend). Ngrok will print a public URL (e.g. `https://abc123.ngrok.io`). Share that URL: stakeholders can call the API from that base (e.g. `https://abc123.ngrok.io/entries`). If you want them to see the frontend, either deploy the frontend to Vercel first and point it at the ngrok URL temporarily, or run the frontend locally and use ngrok for the backend only and explain that the “app” is the API for now. The ngrok URL is temporary and changes when you restart ngrok (unless you use a reserved domain).

---

## Phase 07 — Production deployment

**What this phase does:** Hosts the backend and database on Railway and the frontend on Vercel so the app is available at permanent public URLs. GitHub is the source; Railway and Vercel deploy from the repo.

- **Prepare for deployment**
  - Ensure the backend reads `PORT` from the environment (Railway injects it). No hardcoded ports or localhost in production code. Prisma should use `DATABASE_URL` everywhere. Run `prisma migrate deploy` against a production-like DB (or the actual Railway DB) once to confirm migrations apply cleanly. The Dockerfile should not rely on local `.env`; all secrets are provided by the platform.
- **Deploy backend + DB to Railway**
  - In Railway: create a new project and choose “Deploy from GitHub repo”; select your repo. Add a **PostgreSQL** service from Railway’s catalog (managed DB). Railway will assign a `DATABASE_URL`; copy it. Add a **service** for the backend: set the root directory to `backend` (or point to the Dockerfile in backend). Configure build: use Docker if you use a Dockerfile, or use Nixpacks/Node and set build command to `npm install && npx prisma generate` and start command to `npx prisma migrate deploy && node src/server.js` (or `npm start`). In the backend service’s **Variables** tab, add `DATABASE_URL` (paste from the Postgres service) and `ANTHROPIC_API_KEY`. Deploy; Railway will build and run the backend and expose a public URL (e.g. `https://your-app.up.railway.app`). Test `https://your-app.up.railway.app/entries` to see if the API responds. If migrations didn’t run automatically, use Railway’s shell or a one-off job to run `npx prisma migrate deploy` from the backend root.
- **Deploy frontend to Vercel**
  - In Vercel: import the same GitHub repo. Set the **Root Directory** to `frontend`. Framework preset: Vite. Add an environment variable: `VITE_API_BASE_URL` = your Railway backend URL (e.g. `https://your-app.up.railway.app`) with no trailing slash. Build command: `npm run build` (default for Vite); output directory: `dist`. Deploy. Vercel will build the frontend and serve it at a URL like `https://your-project.vercel.app`. The built JS will use `VITE_API_BASE_URL` for all API calls.
- **Verify live app**
  - Open the Vercel URL in the browser. Submit a journal entry; you should see the AI response. Refresh the page and confirm the entry appears in history (persisted in Railway’s Postgres). Optionally connect to the production database with Prisma Studio or a SQL client (using the same `DATABASE_URL`) to confirm rows are stored. Check that no mixed content or CORS errors appear in the browser console; if the frontend is on Vercel and the API on Railway, both are HTTPS and CORS should allow the request if you configured `cors()` in Express to allow that origin or all origins.

---

## Simple data flow diagram

```mermaid
flowchart TD
  userBrowser[UserBrowser] --> frontend[ViteFrontend]
  frontend -->|POST /entries| backendApi[ExpressAPI]
  frontend -->|GET /entries| backendApi
  backendApi -->|AI request| claudeApi[ClaudeAPI]
  backendApi -->|read/write| postgresDB[PostgreSQL]
```



We will go through each phase interactively. At each step, I’ll tell you exactly what terminal command to run or what file to create/edit, and explain in very simple terms what and why.