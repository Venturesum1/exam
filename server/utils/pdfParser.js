const pdfParse = require('pdf-parse');
const fs = require('fs');

async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return extractQuestions(data.text);
}

function extractQuestions(text) {
  const questions = [];

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Split into blocks at each line beginning with Q<number>.
  const blocks = normalized.split(/\n(?=Q\d+\.)/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const qNumMatch = trimmed.match(/^Q(\d+)\.\s*/);
    if (!qNumMatch) continue;

    const rest = trimmed.slice(qNumMatch[0].length);
    const lines = rest.split('\n');

    let questionLines = [];
    const options = {};
    let correctAnswer = '';
    let parsingOptions = false;
    let done = false;

    for (const rawLine of lines) {
      if (done) break;
      const line = rawLine.trim();
      if (!line) continue;

      // Match options: "A. text" or "A) text"
      const optMatch = line.match(/^([A-D])[.)]\s*(.+)/);

      // Match answer line — the ✔ checkmark renders as "4" in pdf-parse output.
      // Handles: "4 Answer: B. Bus", "Answer: B", "Ans: B", "✔ Answer: B"
      // Search anywhere in the line so the leading "4 " prefix is ignored.
      const ansMatch = line.match(/Answer[:.]\s*([A-D])/i);

      // Stop parsing at Explanation
      const expMatch = line.match(/^Explanation[:.]/i);

      if (expMatch) {
        done = true;
      } else if (ansMatch) {
        correctAnswer = ansMatch[1].toUpperCase();
      } else if (optMatch) {
        options[optMatch[1]] = optMatch[2].trim();
        parsingOptions = true;
      } else if (!parsingOptions) {
        questionLines.push(line);
      }
    }

    const questionText = questionLines.join(' ').trim();

    if (questionText && correctAnswer && options.A && options.B && options.C && options.D) {
      // Use sequential ID so Paper 2's Q1-Q80 don't collide with Paper 1's Q1-Q122
      const id = questions.length + 1;
      questions.push({ id, question: questionText, options, correctAnswer });
    }
  }

  return questions; // already in order since we process top-to-bottom
}

module.exports = { parsePDF };
