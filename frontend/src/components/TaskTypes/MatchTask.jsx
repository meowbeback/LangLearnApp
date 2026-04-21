import React, { useMemo } from 'react';
import Input from '../Input/Input';
import { parseMatchPairsFromQuestionText } from './matchUtils';
import './TaskTypes.css';

const MatchTask = ({ task, value, onChange, disabled, isChecked, isCorrect, correctAnswer }) => {
  const opt = task.options && typeof task.options === 'object' && !Array.isArray(task.options) ? task.options : null;
  const hint = opt?.format_hint;

  const { left, right } = useMemo(() => {
    if (Array.isArray(opt?.left) && Array.isArray(opt?.right)) {
      return { left: opt.left, right: opt.right };
    }
    const parsed = parseMatchPairsFromQuestionText(task.question_text);
    if (parsed) return parsed;
    return { left: null, right: null };
  }, [opt, task.question_text]);

  return (
    <div className="match-task">
      <p className="match-goal">
        Соедините каждое <strong>английское</strong> слово с <strong>русским</strong> переводом. Ниже введите
        ответ <strong>одной строкой</strong>: пары через запятую, внутри пары — вертикальная черта{' '}
        <code>|</code>.
      </p>
      {Array.isArray(left) && Array.isArray(right) ? (
        <div className="match-columns">
          <div className="match-col">
            <div className="match-col-title">Слова на английском</div>
            <ul className="match-words">
              {left.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="match-col">
            <div className="match-col-title">Переводы (подберите к каждому слову слева)</div>
            <ul className="match-words">
              {right.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="match-fallback-note">
          В задании нет списка слов в данных курса. Ориентируйтесь на формулировку выше и пример в подсказке;
          либо попросите преподавателя обновить сиды БД.
        </p>
      )}
      <p className="match-instructions">
        {hint ||
          'Формат одной строки: словоEN|переводRU,следующаяПара,... — порядок пар может быть любым, важны верные пары и запятые между ними.'}
      </p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="word|слово,another|другое"
        disabled={disabled}
        error={isChecked && !isCorrect ? 'Проверьте пары и запятую между ними' : ''}
      />
      {isChecked && !isCorrect && correctAnswer ? (
        <div className="correct-answer-hint">
          Эталон: <strong>{correctAnswer}</strong>
        </div>
      ) : null}
    </div>
  );
};

export default MatchTask;
