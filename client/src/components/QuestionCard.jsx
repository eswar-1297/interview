import React from "react";

export default function QuestionCard({ question, index, selectedOption, onSelect }) {
  const letters = ["A", "B", "C", "D"];

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">Question {index + 1}</p>
      <h3 className="text-base text-gray-900 leading-relaxed mb-5">
        {question.question}
      </h3>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selectedOption === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-full text-left px-4 py-2.5 rounded border text-sm transition-colors flex items-center gap-3 ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className={`text-xs font-semibold w-5 flex-shrink-0 ${
                isSelected ? "text-gray-400" : "text-gray-400"
              }`}>
                {letters[i]}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
