# Menstrual Wellness Support System

A full-stack wellness application that helps users track menstrual cycles, log symptoms, monitor daily habits, and receive AI-guided support in a calm and supportive experience.

## Overview

This project combines a Node.js/Express backend with a React frontend to provide:

- cycle logging with flow intensity and notes
- symptom check-ins for mood, pain, water intake, and sleep
- predictive insights for upcoming periods, ovulation, and fertile windows
- a personalized dashboard with trends and activity summaries
- an AI chatbot powered by Google Gemini with offline fallback support
- optional YouTube-based music recommendations for wellness-related requests

## Tech Stack

### Backend
- Node.js
- Express.js
- MySQL with mysql2
- JWT-based authentication with bcryptjs
- Google Generative AI integration
- Axios and dotenv
- CORS-enabled REST API

### Frontend
- React 19
- React Router
- Axios
- Chart.js and react-chartjs-2
- react-calendar
- react-circular-progressbar
- jsPDF and html2canvas for export features
- canvas-confetti for interactive UI feedback
- React Scripts for development and build tooling

## Key Features

- Secure user registration and login
- Protected routes for authenticated users
- Cycle tracker for recording cycle start/end dates and flow intensity
- Symptom logging with mood, pain, hydration, and sleep tracking
- Analytics for recurring symptoms and wellness patterns
- Dashboard experience with cycle phase insights and recent activity
- AI chatbot for wellness questions and conversational guidance
- Offline fallback guidance when the AI service is unavailable
- YouTube video search support for music-related chatbot requests

## Prerequisites

- Node.js 18+ recommended
- MySQL server running locally
- A Google Gemini API key (optional, but required for full AI chatbot functionality)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/madhumitha27V/MENSTURAL-WELLNESS-SUPPORT-SYSTEM.git
cd MENSTURAL-WELLNESS-SUPPORT-SYSTEM
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wellness_db
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

Create the MySQL database:

```sql
CREATE DATABASE wellness_db;
```

Initialize the application tables (users, cycles, symptoms, and chat history):

```bash
mysql -u root -p < backend/db/migrations/001_initial_schema.sql
```

The migration is safe to run on a new database because it uses `IF NOT EXISTS`.
Keep `backend/.env` out of source control and use a unique `JWT_SECRET` in each
environment.

Initialize the RAG tables:

```bash
mysql -u root -p wellness_db < backend/db/migrations/002_rag_schema.sql
```

Set `RAG_INGEST_TOKEN` in `backend/.env`, then ingest the vetted documents in
`knowledge-base/` after setting `GEMINI_API_KEY`:

```bash
cd backend
npm run rag:ingest
```

RAG uses Gemini's `gemini-embedding-001` model by default. Override it with
`GEMINI_EMBEDDING_MODEL` only when the configured Gemini API supports another
embedding model.

RAG search is available at `GET /api/rag/search?q=your-question` for authenticated
users. Ingestion is also available to an operator with
`POST /api/rag/ingest` and the `x-rag-ingest-token` header. Results are limited to
the four highest-scoring chunks above the configured similarity threshold.
PDF files are supported when accompanied by a same-name `.pdf.json` sidecar
containing `{"title":"...", "sourceUrl":"..."}`.

After ingestion, run the 30-question retrieval evaluation:

```bash
npm run rag:evaluate
```

The command prints JSON containing `hitRateAtK`, `averageLatencyMs`, per-question
matches, and any errors. Set `RAG_EVAL_TOP_K` and `RAG_EVAL_THRESHOLD` to compare
retrieval configurations.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start the backend

```bash
cd backend
npm start
```

The API will run at `http://localhost:5000`.

### Start the frontend

```bash
cd frontend
npm start
```

The app will be available at `http://localhost:3000`.

## API Endpoints

- `POST /api/auth/register` — create a new account
- `POST /api/auth/login` — authenticate a user and return a JWT
- `GET /api/auth/me` — return the authenticated user's profile
- `POST /api/cycle` or `POST /api/cycle/log` — log a new cycle entry
- `GET /api/cycle/all` — fetch cycle history
- `GET /api/cycle/predict` — get next period and fertile window predictions
- `PUT`/`DELETE /api/cycle/:id` — update or delete an owned cycle entry
- `/api/cycles` — plural alias for the cycle routes
- `POST /api/symptoms` or `POST /api/symptoms/log` — log symptom data
- `GET /api/symptoms/all` — fetch symptom entries
- `GET /api/symptoms/analytics` — fetch analytics summary
- `PUT`/`DELETE /api/symptoms/:id` — update or delete an owned symptom entry
- `GET /api/analytics` — analytics route alias
- `GET /api/forecast` — forecast route alias
- `GET /api/rag/search?q=...` — authenticated knowledge-base retrieval
- `POST /api/rag/ingest` — token-protected knowledge-base ingestion

Chat responses include `citations`, `safetyAlert`, `requiresMedicalCare`, and a
medical `disclaimer`. The assistant uses only retrieved vetted context when the
RAG index is available and falls back to conservative offline guidance when an
AI or retrieval service is unavailable.
- `POST /api/chat` — send a message to the AI assistant
- `GET /api/health` — health check

## Project Structure

```text
MENSTURAL-WELLNESS-SUPPORT-SYSTEM/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── db/migrations/
│   ├── middleware/
│   ├── rag/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── knowledge-base/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Notes

- The backend expects a working MySQL connection and valid Gemini credentials for full AI chatbot functionality.
- If the AI service is unavailable, the chatbot still provides supportive offline-style guidance.
- The application is designed to be a personal wellness companion rather than a substitute for medical advice.
