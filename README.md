# Interview Assessment Web App

A full-stack web application for conducting interview assessments with aptitude questions and coding challenges.

## Features

- **40 Aptitude Questions** (30-minute timer) — quantitative, logical reasoning, verbal, data interpretation
- **4 Java Coding Problems** (60-minute timer) — junior-level problems with integrated code editor
- **Monaco Code Editor** — VS Code-like editing experience with syntax highlighting
- **Java & Python support** — switch between languages; code runs via Piston API
- **Auto-submit** — tests auto-submit when time expires
- **Results Dashboard** — view scores and submitted code

## Quick Start

### Prerequisites

- Node.js 18+

### 1. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the server

```bash
cd server
npm run dev
```

The API server runs on `http://localhost:5000`.

### 3. Start the client

```bash
cd client
npm start
```

The React app opens on `http://localhost:3000` and proxies API requests to the server.

## Project Structure

```
interview/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       │   ├── LandingPage.jsx
│       │   ├── Dashboard.jsx
│       │   ├── AptitudeTest.jsx
│       │   ├── CodingTest.jsx
│       │   ├── CodeEditor.jsx
│       │   ├── Timer.jsx
│       │   ├── QuestionCard.jsx
│       │   └── Results.jsx
│       ├── App.jsx
│       └── index.js
├── server/          # Express backend
│   ├── data/
│   │   ├── aptitude-questions.json
│   │   └── coding-questions.json
│   ├── routes/
│   │   ├── questions.js
│   │   └── execute.js
│   └── server.js
└── README.md
```

## API Endpoints

| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| GET    | `/api/aptitude`       | Get aptitude questions (no answers) |
| GET    | `/api/aptitude/answers` | Get correct answers            |
| GET    | `/api/coding`         | Get coding problems             |
| POST   | `/api/execute`        | Execute code (Java/Python)      |
| GET    | `/api/health`         | Health check                    |
