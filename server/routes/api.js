const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const controller = require('../controllers/quizController');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `quiz-${Date.now()}.pdf`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.post('/upload', upload.single('pdf'), controller.uploadPDF);
router.get('/quiz-info', controller.getQuizInfo);
router.get('/question/:index', controller.getQuestion);
router.post('/answer', controller.submitAnswer);
router.post('/complete', controller.completeQuiz);
router.get('/results', controller.getResults);
router.delete('/reset', controller.resetQuiz);

module.exports = router;
