import React from 'react';
import './TaskTypes.css';

const TranslateTask = ({ options, selectedOption, onSelect, disabled, isChecked, isCorrect, correctAnswer }) => {
  return (
    <div className="options-grid">
      {(options || []).map((option, index) => (
        <button
          key={index}
          type="button"
          className={`option-btn ${selectedOption === option ? 'selected' : ''} ${
            isChecked && option === correctAnswer ? 'correct' : ''
          } ${isChecked && selectedOption === option && !isCorrect ? 'incorrect' : ''}`}
          onClick={() => !disabled && onSelect(option)}
          disabled={disabled}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default TranslateTask;
