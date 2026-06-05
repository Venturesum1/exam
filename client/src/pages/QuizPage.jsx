import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestion, submitAnswer, completeQuiz, getQuizInfo } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const fetchQuestion = useCallback(async (index) => {
    setLoading(true);
    setError('');
    setSelected(null);
    try {
      const res = await getQuestion(index);
      setQuestionData(res.data);
      setTotalQuestions(res.data.total);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/');
      } else {
        setError('Failed to load question.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    getQuizInfo()
      .then((res) => {
        if (res.data.totalQuestions === 0) navigate('/');
      })
      .catch(() => navigate('/'));
    fetchQuestion(0);
  }, [fetchQuestion, navigate]);

  const handleNext = async () => {
    if (!selected) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }
    setSubmitting(true);
    try {
      await submitAnswer(questionData.id, selected);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalQuestions) {
        await completeQuiz();
        navigate('/results');
      } else {
        setCurrentIndex(nextIndex);
        await fetchQuestion(nextIndex);
      }
    } catch {
      setError('Failed to save answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!questionData) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-800">PDF MCQ Quiz</h1>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Exit
            </button>
          </div>
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center p-4 pt-6">
        <div className="w-full max-w-2xl">
          <div className="card">
            {/* Question header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Q{currentIndex + 1}
              </span>
              <span className="text-sm text-gray-400">of {totalQuestions}</span>
            </div>

            <QuestionCard
              question={questionData.question}
              options={questionData.options}
              selected={selected}
              onSelect={setSelected}
            />

            {/* Warning */}
            {showWarning && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-medium">
                Please select an answer before continuing.
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Next button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={submitting}
                className="btn-primary min-w-[140px] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {currentIndex + 1 === totalQuestions ? 'Finish Quiz' : 'Next'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
