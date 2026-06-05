import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults } from '../services/api';

function AnswerBadge({ letter, label, variant }) {
  const styles = {
    correct: 'bg-green-100 text-green-700 border border-green-300',
    wrong: 'bg-red-100 text-red-700 border border-red-300',
    neutral: 'bg-gray-100 text-gray-600 border border-gray-200'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${styles[variant]}`}>
      <span className="font-bold">{letter}.</span> {label}
    </span>
  );
}

export default function ReviewPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getResults()
      .then((res) => setResults(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!results) return null;

  const filtered = results.details.filter((d) => {
    if (filter === 'wrong') return !d.isCorrect;
    if (filter === 'correct') return d.isCorrect && d.userAnswer;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Review Answers</h1>
            <p className="text-sm text-gray-500">
              {results.correctAnswers} correct · {results.wrongAnswers} wrong
            </p>
          </div>
          <button
            onClick={() => navigate('/results')}
            className="btn-secondary py-2 px-4 text-sm"
          >
            Back to Results
          </button>
        </div>

        {/* Filter tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {['all', 'wrong', 'correct'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f === 'all' ? `All (${results.details.length})`
                : f === 'wrong' ? `Wrong (${results.wrongAnswers})`
                : `Correct (${results.correctAnswers})`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {/* Summary table for compact view */}
        {filter === 'all' && (
          <div className="card overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-4 font-semibold">Q No</th>
                  <th className="pb-2 pr-4 font-semibold">Your Answer</th>
                  <th className="pb-2 pr-4 font-semibold">Correct Answer</th>
                  <th className="pb-2 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {results.details.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                    className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-medium text-gray-700">Q{d.id}</td>
                    <td className="py-2.5 pr-4 text-gray-600">
                      {d.userAnswer || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600">{d.correctAnswer}</td>
                    <td className="py-2.5">
                      {!d.userAnswer ? (
                        <span className="text-gray-400 text-xs">Skipped</span>
                      ) : d.isCorrect ? (
                        <span className="text-green-500 text-lg">✅</span>
                      ) : (
                        <span className="text-red-500 text-lg">❌</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail cards for wrong/correct filter or expanded row */}
        {(filter !== 'all' ? filtered : filtered.filter((d) => d.id === expandedId)).map((d) => (
          <div
            key={d.id}
            className={`card border-l-4 ${d.isCorrect ? 'border-l-green-400' : 'border-l-red-400'}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Question {d.id}
              </span>
              {d.isCorrect
                ? <span className="text-green-500 font-semibold text-sm">✅ Correct</span>
                : <span className="text-red-500 font-semibold text-sm">❌ Wrong</span>}
            </div>

            <p className="text-base font-medium text-gray-800 mb-4 leading-relaxed">
              {d.question}
            </p>

            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((key) => {
                const isUser = d.userAnswer === key;
                const isCorrect = d.correctAnswer === key;
                let style = 'bg-gray-50 border-gray-200 text-gray-600';
                if (isCorrect) style = 'bg-green-50 border-green-400 text-green-800';
                else if (isUser && !isCorrect) style = 'bg-red-50 border-red-400 text-red-700 line-through';

                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${style}`}>
                    <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs font-bold shrink-0">
                      {key}
                    </span>
                    <span className="text-sm">{d.options[key]}</span>
                    {isCorrect && <span className="ml-auto text-green-500 text-xs font-bold">CORRECT</span>}
                    {isUser && !isCorrect && <span className="ml-auto text-red-400 text-xs font-bold">YOUR ANSWER</span>}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
              {d.userAnswer && (
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Your Answer</span>
                  <AnswerBadge
                    letter={d.userAnswer}
                    label={d.options[d.userAnswer]}
                    variant={d.isCorrect ? 'correct' : 'wrong'}
                  />
                </div>
              )}
              {!d.isCorrect && (
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">Correct Answer</span>
                  <AnswerBadge
                    letter={d.correctAnswer}
                    label={d.options[d.correctAnswer]}
                    variant="correct"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No questions in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
