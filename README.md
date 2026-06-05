# PDF MCQ Quiz System

Upload a PDF containing MCQs and take an interactive quiz with scoring and review.

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Run both server and client together
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Manual Start (two terminals)

**Terminal 1 — Backend (port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

---

## Expected PDF Format

```
Q1. Which topology connects all devices to a single central cable?

A. Star
B. Bus
C. Ring
D. Mesh

Answer: B. Bus

Explanation:
In a Bus topology all devices share one central cable.
```

Rules the parser follows:
- Questions start with `Q<number>.`
- Options are labeled `A.` `B.` `C.` `D.`
- Answer line starts with `Answer:` or `Ans:` followed by the letter
- Explanation is ignored during the quiz

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload PDF (multipart, field: `pdf`) |
| GET | `/api/quiz-info` | Get total questions & session state |
| GET | `/api/question/:index` | Get question by 0-based index |
| POST | `/api/answer` | Submit answer `{ questionId, selectedOption }` |
| POST | `/api/complete` | Mark quiz as finished |
| GET | `/api/results` | Full results with per-question breakdown |
| DELETE | `/api/reset` | Clear questions and session |

---

## Project Structure

```
project/
├── server/
│   ├── index.js              Express entry point
│   ├── routes/api.js         Route definitions + multer upload
│   ├── controllers/
│   │   └── quizController.js Business logic & file storage
│   └── utils/
│       └── pdfParser.js      PDF text extraction & regex parser
├── client/
│   └── src/
│       ├── pages/
│       │   ├── UploadPage.jsx   Drag-drop PDF upload
│       │   ├── QuizPage.jsx     One-question-at-a-time quiz
│       │   ├── ResultsPage.jsx  Score & stats
│       │   └── ReviewPage.jsx   Per-question answer review
│       ├── components/
│       │   ├── ProgressBar.jsx
│       │   └── QuestionCard.jsx
│       └── services/api.js     Axios API helpers
├── uploads/                  Uploaded PDFs (auto-created)
└── server/data/              questions.json + session.json
```
