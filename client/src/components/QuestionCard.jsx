const OPTION_COLORS = {
  A: 'bg-purple-100 text-purple-700 border-purple-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-green-100 text-green-700 border-green-200',
  D: 'bg-orange-100 text-orange-700 border-orange-200'
};

const OPTION_COLORS_SELECTED = {
  A: 'bg-purple-500 text-white border-purple-500',
  B: 'bg-blue-500 text-white border-blue-500',
  C: 'bg-green-500 text-white border-green-500',
  D: 'bg-orange-500 text-white border-orange-500'
};

export default function QuestionCard({ question, options, selected, onSelect }) {
  return (
    <div>
      <p className="text-lg font-semibold text-gray-800 leading-relaxed mb-6">
        {question}
      </p>
      <div className="space-y-3">
        {['A', 'B', 'C', 'D'].map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 font-medium
              ${selected === key
                ? OPTION_COLORS_SELECTED[key]
                : `${OPTION_COLORS[key]} hover:brightness-95 hover:scale-[1.01]`
              }`}
          >
            <span className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold
              ${selected === key ? 'bg-white/30 border-white/60' : 'bg-white border-current'}`}>
              {key}
            </span>
            <span className="text-base">{options[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
