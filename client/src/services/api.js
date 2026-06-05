import axios from 'axios';

// Development: Vite proxy handles '/api' → localhost:4000
// Production:  VITE_API_URL = https://your-backend.railway.app/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export const uploadPDF = (file, onProgress) => {
  const form = new FormData();
  form.append('pdf', file);
  return api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  });
};

export const getQuizInfo = () => api.get('/quiz-info');
export const getQuestion = (index) => api.get(`/question/${index}`);
export const submitAnswer = (questionId, selectedOption) =>
  api.post('/answer', { questionId, selectedOption });
export const completeQuiz = () => api.post('/complete');
export const getResults = () => api.get('/results');
export const resetQuiz = () => api.delete('/reset');
