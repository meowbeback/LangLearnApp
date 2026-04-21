import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import TaskRenderer from '../../components/TaskTypes/TaskRenderer';
import { api } from '../../services/api';
import '../Lesson/Lesson.css';

const LessonReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.getWrongTasks(id);
        setTasks(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const currentTask = tasks[idx];
  const needsOption = currentTask && ['translate', 'listen', 'multiple_choice'].includes(currentTask.task_type);
  const needsInput = currentTask && ['input', 'match'].includes(currentTask.task_type);

  const buildAnswer = () => {
    if (!currentTask) return '';
    if (needsOption) return selectedOption || '';
    return inputValue.trim();
  };

  const handleCheck = async () => {
    const answer = buildAnswer();
    if (!answer) return;
    try {
      const res = await api.checkTask(parseInt(id, 10), currentTask.id, answer);
      setIsCorrect(!!res.correct);
      setCorrectAnswerShown(res.correct_answer || null);
      setIsAnswerChecked(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setInputValue('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setCorrectAnswerShown(null);
    if (idx < tasks.length - 1) setIdx(idx + 1);
    else navigate('/dashboard');
  };

  if (loading) return <div className="loading-state">Загрузка...</div>;
  if (!tasks.length) {
    return (
      <div className="lesson-completed-container">
        <div className="completion-card">
          <p>Нет заданий для отработки.</p>
          <Link to="/dashboard">В каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <button type="button" className="close-btn" onClick={() => navigate('/dashboard')}>
          ✕
        </button>
        <div className="task-counter">
          Отработка: {idx + 1} из {tasks.length}
        </div>
      </div>
      <div className="task-container">
        <TaskRenderer
          task={currentTask}
          translateSelection={selectedOption}
          onTranslateSelect={setSelectedOption}
          inputValue={inputValue}
          onInputChange={setInputValue}
          disabled={isAnswerChecked}
          isChecked={isAnswerChecked}
          isCorrect={isCorrect}
          correctAnswerShown={correctAnswerShown}
        />
      </div>
      <div className={`lesson-footer ${isAnswerChecked ? (isCorrect ? 'footer-correct' : 'footer-incorrect') : ''}`}>
        <div className="footer-content">
          {isAnswerChecked ? (
            <>
              <div className="feedback-message">{isCorrect ? 'Верно!' : 'Попробуйте ещё раз'}</div>
              <Button onClick={handleNext}>{idx < tasks.length - 1 ? 'Далее' : 'В каталог'}</Button>
            </>
          ) : (
            <Button
              onClick={handleCheck}
              disabled={(needsOption && !selectedOption) || (needsInput && !inputValue.trim())}
            >
              Проверить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonReview;
