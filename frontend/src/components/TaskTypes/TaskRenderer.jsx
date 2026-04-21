import React from 'react';
import Input from '../Input/Input';
import ListenTask from './ListenTask';
import MatchTask from './MatchTask';
import TranslateTask from './TranslateTask';
import './TaskTypes.css';

const TaskRenderer = ({
  task,
  translateSelection,
  onTranslateSelect,
  inputValue,
  onInputChange,
  disabled,
  isChecked,
  isCorrect,
  correctAnswerShown,
}) => {
  const type = task.task_type;
  const options = task.options;
  const q = task.question_text;
  const choiceList = Array.isArray(options) ? options : options?.choices ?? [];

  if (type === 'translate' || type === 'multiple_choice') {
    return (
      <>
        <h2 className="task-question">{q}</h2>
        <TranslateTask
          options={choiceList}
          selectedOption={translateSelection}
          onSelect={onTranslateSelect}
          disabled={disabled}
          isChecked={isChecked}
          isCorrect={isCorrect}
          correctAnswer={correctAnswerShown}
        />
      </>
    );
  }

  if (type === 'input') {
    return (
      <>
        <h2 className="task-question">{q}</h2>
        <div className="input-task">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Введите ответ..."
            disabled={disabled}
            error={isChecked && !isCorrect ? 'Неверный ответ' : ''}
          />
          {isChecked && isCorrect ? <div className="success-message">Правильно!</div> : null}
          {isChecked && !isCorrect && correctAnswerShown ? (
            <div className="correct-answer-hint">
              Правильный ответ: <strong>{correctAnswerShown}</strong>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  if (type === 'listen') {
    const speakText = options && typeof options === 'object' && !Array.isArray(options) ? options.speak : null;
    return (
      <>
        <h2 className="task-question">{q}</h2>
        <ListenTask
          audio_url={task.audio_url}
          choiceOptions={choiceList}
          speakText={speakText}
          selectedOption={translateSelection}
          onSelect={onTranslateSelect}
          disabled={disabled}
          isChecked={isChecked}
          isCorrect={isCorrect}
          correctAnswer={correctAnswerShown}
        />
      </>
    );
  }

  if (type === 'match') {
    return (
      <>
        <h2 className="task-question match-task-title">{q}</h2>
        <MatchTask
          task={task}
          value={inputValue}
          onChange={onInputChange}
          disabled={disabled}
          isChecked={isChecked}
          isCorrect={isCorrect}
          correctAnswer={correctAnswerShown}
        />
      </>
    );
  }

  return (
    <div className="task-unknown">
      <p>Неподдерживаемый тип задания: {type}</p>
    </div>
  );
};

export default TaskRenderer;
