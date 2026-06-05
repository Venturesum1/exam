import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults, resetQuiz } from '../services/api';

function ScoreBadge({ percentage }) {
  if (percentage >= 80) return { color: 'text-green-600', bg: 'bg-green-100', label: 'Excellent' };
  if (percentage >= 60) return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Good' };
  if (percentage >= 40) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Average' };
  return { color: 'text-red-600', bg: 'bg-red-100', label: 'Needs Improvement' };
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleRetry = async () => {
    await resetQuiz();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!results) return null;

  const badge = ScoreBadge({ percentage: results.score });
  // Donut-like circle progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (results.score / 100) * circumference;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Completed!</h1>
          <p className="text-gray-500 mt-1">Here's how you did</p>
        </div>

        <div className="card mb-4">
          {/* Score circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke={results.score >= 80 ? '#16a34a' : results.score >= 60 ? '#2563eb' : results.score >= 40 ? '#d97706' : '#dc2626'}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${badge.color}`}>{results.score}%</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.color} mt-1`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{results.totalQuestions}</div>
              <div className="text-sm text-gray-500 mt-1">Total Questions</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{results.answered}</div>
              <div className="text-sm text-gray-500 mt-1">Answered</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{results.correctAnswers}</div>
              <div className="text-sm text-green-600 mt-1">Correct</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-500">{results.wrongAnswers}</div>
              <div className="text-sm text-red-500 mt-1">Wrong</div>
            </div>
            {results.skipped > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 text-center col-span-2">
                <div className="text-3xl font-bold text-amber-600">{results.skipped}</div>
                <div className="text-sm text-amber-600 mt-1">Skipped</div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/review')}
            className="btn-primary w-full text-base py-4"
          >
            Review Answers
          </button>
          <button
            onClick={handleRetry}
            className="btn-secondary w-full text-base py-4"
          >
            Upload New PDF
          </button>
        </div>
      </div>
    </div>
  );
}
