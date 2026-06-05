const path = require('path');
const fs = require('fs');
const { parsePDF } = require('../utils/pdfParser');

const DATA_DIR = path.join(__dirname, '..', 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const SESSION_FILE = path.join(DATA_DIR, 'session.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadQuestions() {
  if (!fs.existsSync(QUESTIONS_FILE)) return [];
  return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
}

function saveQuestions(questions) {
  ensureDataDir();
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

function loadSession() {
  if (!fs.existsSync(SESSION_FILE)) return { answers: {}, completed: false };
  return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
}

function saveSession(session) {
  ensureDataDir();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
}

// POST /api/upload
async function uploadPDF(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });
    }

    const questions = await parsePDF(req.file.path);

    if (questions.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'Could not extract any questions from this PDF. Please check the format.'
      });
    }

    saveQuestions(questions);
    // Reset session on new upload
    saveSession({ answers: {}, completed: false });

    res.json({ success: true, totalQuestions: questions.length });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/question/:index  (0-based index)
function getQuestion(req, res) {
  const questions = loadQuestions();
  const index = parseInt(req.params.index, 10);

  if (isNaN(index) || index < 0 || index >= questions.length) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  const q = questions[index];
  // Send question without leaking correctAnswer
  res.json({
    id: q.id,
    index,
    total: questions.length,
    question: q.question,
    options: q.options
  });
}

// POST /api/answer  { questionId, selectedOption }
function submitAnswer(req, res) {
  const { questionId, selectedOption } = req.body;

  if (!questionId || !selectedOption) {
    return res.status(400).json({ error: 'questionId and selectedOption are required.' });
  }

  const session = loadSession();
  session.answers[String(questionId)] = selectedOption.toUpperCase();
  saveSession(session);

  res.json({ success: true });
}

// GET /api/quiz-info
function getQuizInfo(req, res) {
  const questions = loadQuestions();
  const session = loadSession();
  res.json({
    totalQuestions: questions.length,
    answeredCount: Object.keys(session.answers).length,
    completed: session.completed
  });
}

// POST /api/complete
function completeQuiz(req, res) {
  const session = loadSession();
  session.completed = true;
  saveSession(session);
  res.json({ success: true });
}

// GET /api/results
function getResults(req, res) {
  const questions = loadQuestions();
  const session = loadSession();

  let correct = 0;
  let wrong = 0;
  const details = [];

  for (const q of questions) {
    const userAnswer = session.answers[String(q.id)] || null;
    const isCorrect = userAnswer === q.correctAnswer;
    if (userAnswer) {
      if (isCorrect) correct++;
      else wrong++;
    }
    details.push({
      id: q.id,
      question: q.question,
      options: q.options,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect
    });
  }

  const total = questions.length;
  const answered = correct + wrong;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  res.json({
    totalQuestions: total,
    answered,
    correctAnswers: correct,
    wrongAnswers: wrong,
    skipped: total - answered,
    score: percentage,
    details
  });
}

// DELETE /api/reset
function resetQuiz(req, res) {
  if (fs.existsSync(QUESTIONS_FILE)) fs.unlinkSync(QUESTIONS_FILE);
  if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
  res.json({ success: true });
}

module.exports = {
  uploadPDF,
  getQuestion,
  submitAnswer,
  getQuizInfo,
  completeQuiz,
  getResults,
  resetQuiz
};
