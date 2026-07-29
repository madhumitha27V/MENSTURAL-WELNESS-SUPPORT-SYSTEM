# Menstrual Wellness Support System

A full-stack web application for tracking menstrual health, logging symptoms, viewing cycle insights, and receiving AI-powered wellness guidance.

## Overview

This project combines a Node.js/Express backend with a React frontend to help users:

- log menstrual cycle details and flow intensity
- track daily symptoms, pain levels, sleep, and water intake
- view predictive insights for upcoming periods and fertile windows
- chat with an AI assistant powered by Google Gemini
- explore analytics through a dashboard experience

## Tech Stack

### Backend
- Node.js
- Express
- MySQL with mysql2
- JWT authentication with bcryptjs
- Google Generative AI integration
- dotenv for environment configuration

### Frontend
- React
- React Router
- Axios
- Chart.js and react-chartjs-2
- react-calendar
- Custom styling and UI components

## Features

- Secure registration and login
- Protected routes for authenticated users
- Cycle logging with start/end dates and flow intensity
- Symptom check-ins with mood and pain tracking
- Predictive cycle insights based on logged history
- AI chatbot with fallback guidance when the API is unavailable
- Dashboard analytics for trends and activity summaries

## Prerequisites

- Node.js 18+ recommended
- MySQL server running locally
- A Google Gemini API key

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
PORT=5000
```

Create the MySQL database:

```sql
CREATE DATABASE wellness_db;
```

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

- `POST /api/auth/register` — register a user
- `POST /api/auth/login` — login and receive a JWT
- `POST /api/cycle/log` — log a cycle entry
- `GET /api/cycle/all` — fetch cycle history
- `GET /api/cycle/predict` — get period predictions
- `POST /api/symptoms/log` — log symptom data
- `GET /api/symptoms/all` — fetch symptom entries
- `GET /api/symptoms/analytics` — fetch analytics summary
- `POST /api/chat` — send a message to the AI assistant
- `GET /api/health` — health check

## Project Structure

```text
MENSTURAL-WELLNESS-SUPPORT-SYSTEM/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
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

- The backend expects a working MySQL connection and valid Gemini credentials for full AI features.
- If the AI service is unavailable, the chatbot still provides offline-style guidance.
