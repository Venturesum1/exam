const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all: guide the user to the right URL in dev
app.use((req, res) => {
  res.status(200).send(`
    <html><body style="font-family:sans-serif;padding:2rem;background:#f0f4ff">
      <h2>API Server is running on port ${PORT}</h2>
      <p>Open the frontend at: <a href="http://localhost:5173">http://localhost:5173</a></p>
    </body></html>
  `);
});

const server = app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
  console.log(`Frontend   → http://localhost:5173`);
});

// Graceful shutdown so nodemon restarts don't hit EADDRINUSE
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
