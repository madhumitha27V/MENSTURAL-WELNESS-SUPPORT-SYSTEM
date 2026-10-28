# Menstrual Wellness Support System

Privacy-first cycle and symptom tracking with a citation-aware Gemini assistant and MySQL-backed RAG retrieval.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![React](https://img.shields.io/badge/React-Client-61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1)
![RAG](https://img.shields.io/badge/RAG-Gemini%20Embeddings-F97316)

## Features

- JWT authentication with bcrypt password hashing
- User-isolated cycle logging, forecasting, symptom logging, and analytics
- Gemini chatbot with vetted-source retrieval, citations, and offline fallback
- Red-flag safety alerts, prompt-injection protection, and medical disclaimers
- Dashboard charts and client-side PDF report export
- Responsive React interface with dark mode and keyboard focus support
- Markdown and PDF knowledge-base ingestion with MySQL vector storage

## Project metrics

| Metric | Value | How it was measured |
|---|---:|---|
| REST route definitions | 20 total / 18 feature endpoints | Counted route calls in `backend/routes/*.js` plus 2 `backend/server.js` status routes (`/` and `/api/health`) |
| Auth route definitions | 3 | `authRoutes.js`: 2 public routes and 1 protected profile route |
| Cycle route definitions | 5 | `cycleRoutes.js`; mounted under both `/api/cycle` and `/api/cycles` |
| Symptom route definitions | 5 | `symptomRoutes.js` |
| Analytics route definitions | 1 | `analyticsRoutes.js` |
| Forecast route definitions | 1 | `forecastRoutes.js` |
| Chat route definitions | 1 | `chatRoutes.js` |
| RAG route definitions | 2 | `ragRoutes.js` |
| Database tables | 6 | Queried live MySQL `information_schema.tables`: `chat_history`, `cycles`, `rag_chunks`, `rag_documents`, `symptoms`, `users` |
| Database columns | 39 total | Queried live MySQL `information_schema.columns`: users 6, cycles 7, symptoms 9, chat_history 5, rag_documents 6, rag_chunks 6 |
| Frontend pages | 6 | Counted files in `frontend/src/pages` |
| Dashboard chart types | 2 | Scanned `Dashboard.js`: `Bar` and `Doughnut` |
| Client source | 18 files / 5,716 lines | Counted `.js`, `.jsx`, `.css`, `.html` under `frontend/src` |
| Server source | 19 files / 1,108 lines | Counted `.js`, `.jsx`, `.css`, `.html` under `backend`, excluding `backend/rag` and dependencies |
| RAG source | 9 files / 428 lines | Counted `.js`, `.jsx`, `.css`, `.html` under `backend/rag` |
| Backend runtime dependencies | 9 | Counted `backend/package.json` dependencies |
| Frontend runtime dependencies | 17 | Counted `frontend/package.json` dependencies |
| Frontend development dependencies | 2 | Counted `frontend/package.json` devDependencies |
| Knowledge-base documents | 9 | Counted Markdown/PDF files and verified persisted rows in `rag_documents` |
| Persisted RAG chunks | 9 | Counted persisted rows in `rag_chunks` |
| Automated tests | 9 | `cd backend; npm test` ran the Node built-in test runner against `backend/tests/core.test.js` |
| Automated test pass rate | 100% (9/9) | All 9 backend tests passed; the frontend test command still reports no frontend tests |
| RAG in-scope hit rate@4 | 1.0000 | `npm run rag:evaluate`, 34 in-scope questions from a 38-question evaluation set, threshold 0.45 |
| RAG average retrieval latency | 575.79 ms | Latest `npm run rag:evaluate` output across 38 questions |
| RAG out-of-scope empty-retrieval rate | 0.5000 | 2 of 4 unrelated questions returned no source matches |
| RAG overall expected-behavior rate | 0.9474 | 36 of 38 expected behaviors matched: source hit for in-scope questions or empty retrieval for out-of-scope questions |
| RAG evaluation errors | 0 | `npm run rag:evaluate` output |
| `GET /` response time | 24.24 ms average | 20 `Invoke-WebRequest` requests; minimum 17.43 ms, maximum 103.02 ms |
| `GET /api/health` response time | 26.41 ms average | 20 `Invoke-WebRequest` requests; minimum 17.31 ms, maximum 111.30 ms |
| PDF report generation time | Not measured | The export runs in the browser and was not instrumented |

### Measurement commands

These are the commands used for the current measurements:

```powershell
# Route definitions, pages, files, lines, dependencies, and knowledge documents
Get-Content backend\routes\*.js | Select-String -Pattern '\.(get|post|put|delete|patch)\s*\('
Get-ChildItem frontend\src\pages -File

# Automated tests
cd backend; npm test
cd ..\frontend; npm test -- --watchAll=false --passWithNoTests

# RAG evaluation
cd backend; npm run rag:evaluate

# Twenty-request endpoint timing
1..20 | ForEach-Object {
  Measure-Command {
    Invoke-WebRequest http://localhost:5000/api/health -UseBasicParsing
  }
}
```

Database table/column and persisted RAG document/chunk counts were queried from the live
MySQL `information_schema`, `rag_documents`, and `rag_chunks` tables.

## Tech stack

| Layer | Technologies |
|---|---|
| Client | React, React Router, Chart.js, jsPDF, html2canvas |
| Server | Node.js, Express, REST, JWT, bcryptjs |
| Data | MySQL, mysql2 |
| AI and RAG | Gemini generation and embeddings, cosine similarity, MySQL JSON vectors |
| Validation and delivery | npm scripts, Create React App build, Markdown/PDF knowledge sources |

## Architecture

```text
frontend/src
  pages, components, context, lib
        |
        | REST + JWT
        v
backend/server.js
  routes -> controllers -> MySQL
                   |
                   +-> Gemini chat and offline fallback
                   +-> rag/ retrieval and citations

knowledge-base -> rag:ingest -> rag_documents + rag_chunks
```

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
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
├── knowledge-base/
├── .gitignore
└── README.md
```

## API

All routes marked **Yes** require a JWT bearer token. RAG ingestion uses its operator token instead.

| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/` | API status | No |
| GET | `/api/health` | Database-backed health check | No |
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Authenticate and issue a JWT | No |
| GET | `/api/auth/me` | Read the authenticated profile | Yes |
| POST | `/api/cycle/log` and `/api/cycles/log` | Log a cycle | Yes |
| GET | `/api/cycle/all` and `/api/cycles/all` | List owned cycles | Yes |
| GET | `/api/cycle/predict` and `/api/cycles/predict` | Forecast cycle dates | Yes |
| PUT | `/api/cycle/:id` and `/api/cycles/:id` | Update an owned cycle | Yes |
| DELETE | `/api/cycle/:id` and `/api/cycles/:id` | Delete an owned cycle | Yes |
| POST | `/api/symptoms/log` | Log symptoms | Yes |
| GET | `/api/symptoms/all` | List owned symptoms | Yes |
| GET | `/api/symptoms/analytics` | Symptom analytics | Yes |
| PUT | `/api/symptoms/:id` | Update an owned symptom entry | Yes |
| DELETE | `/api/symptoms/:id` | Delete an owned symptom entry | Yes |
| GET | `/api/analytics` | Analytics alias | Yes |
| GET | `/api/forecast` | Forecast alias | Yes |
| POST | `/api/chat` | Gemini/RAG assistant with fallback | Yes |
| GET | `/api/rag/search?q=...` | Retrieve cited knowledge chunks | Yes |
| POST | `/api/rag/ingest` | Ingest knowledge-base documents | Operator token |

## Setup

### Install

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

### Environment variables

Create `backend/.env` locally. Never commit it.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wellness_db
JWT_SECRET=your_unique_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_CHAT_MODEL=gemini-3.8-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_TIMEOUT_MS=12000
RAG_INGEST_TOKEN=your_operator_ingest_token
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Database migrations

```powershell
mysql -u root -p < backend\db\migrations\001_initial_schema.sql
mysql -u root -p wellness_db < backend\db\migrations\002_rag_schema.sql
```

### Ingest and evaluate RAG

```powershell
cd backend
npm run rag:ingest
npm run rag:evaluate
```

The evaluator reports in-scope hit rate@4, out-of-scope empty-retrieval rate, overall expected-behavior rate,
average latency, per-question matches, and errors. The in-scope hit rate excludes unrelated questions.
PDF sources require a same-name `.pdf.json` sidecar with `title` and `sourceUrl`.

### Run

In separate terminals:

```powershell
cd backend
npm start
```

```powershell
cd frontend
npm start
```

Open the frontend at `http://localhost:3000`.

## Screenshots

Add product screenshots here:

```text
screenshots/dashboard.png
screenshots/assistant-with-citations.png
screenshots/mobile-layout.png
```

## Privacy and medical disclaimer

User cycle, symptom, and chat data is scoped by authenticated user ID in backend queries.
Use HTTPS, strong secrets, least-privilege database credentials, and appropriate retention
controls before production deployment. The assistant provides general educational
information only. It does not diagnose, prescribe, or replace a qualified healthcare
professional. Red-flag symptoms should receive prompt professional or emergency care.

## Future improvements

- Add authenticated end-to-end API tests and frontend smoke tests
- Add request rate limiting, schema validation middleware, and structured logging
- Add encrypted-at-rest storage and configurable data-retention/deletion workflows
- Add a measured browser performance suite for PDF generation and key user journeys
- Add document versioning and scheduled knowledge-base refreshes
