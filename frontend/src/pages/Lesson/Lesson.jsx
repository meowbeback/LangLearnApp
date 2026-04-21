import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import LessonProgressBar from '../../components/LessonProgressBar/LessonProgressBar';
import TaskRenderer from '../../components/TaskTypes/TaskRenderer';
import { api } from '../../services/api';
import './Lesson.css';

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [correctAnswerShown, setCorrectAnswerShown] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  const saveProgress = useCallback(async (index) => {
    try {
      await api.putLessonProgress(id, { current_task_index: index });
    } catch (e) {
      console.error('progress save failed', e);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getLesson(id);
        setLesson(data);
        try {
          const st = await api.getLessonProgressState(id);
          if (st.status !== 'completed' && typeof st.current_task_index === 'number' && data.tasks?.length) {
            const idx = Math.min(st.current_task_index, data.tasks.length - 1);
            setCurrentTaskIndex(idx);
          }
        } catch {
          /* ignore */
        }
      } catch (error) {
        console.error('Failed to fetch lesson', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-state">Загрузка урока...</div>;
  }

  if (!lesson || !lesson.tasks?.length) {
    return <div className="error-state">Урок не найден</div>;
  }

  const currentTask = lesson.tasks[currentTaskIndex];
  const needsOption = ['translate', 'listen', 'multiple_choice'].includes(currentTask.task_type);
  const needsInput = ['input', 'match'].includes(currentTask.task_type);

  const buildAnswer = () => {
    if (needsOption) return selectedOption || '';
    return inputValue.trim();
  };

  const handleCheckAnswer = async () => {
    const answer = buildAnswer();
    if (!answer && needsInput) return;
    if (!answer && needsOption) return;
    try {
      const res = await api.checkTask(parseInt(id, 10), currentTask.id, answer);
      setIsCorrect(!!res.correct);
      setCorrectAnswerShown(res.correct_answer || null);
      setPointsEarned(res.points_earned ?? 0);
      setIsAnswerChecked(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextTask = async () => {
    const nextIndex = currentTaskIndex + 1;
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setInputValue('');
    setIsCorrect(false);
    setCorrectAnswerShown(null);
    setPointsEarned(0);

    if (currentTaskIndex < lesson.tasks.length - 1) {
      await saveProgress(nextIndex);
      setCurrentTaskIndex(nextIndex);
    } else {
      try {
        await saveProgress(currentTaskIndex);
        await api.completeLesson(id);
      } catch (err) {
        console.error('Failed to save lesson completion', err);
      }
      setLessonCompleted(true);
    }
  };

  const handleFinishLesson = () => {
    navigate('/dashboard');
  };

  const handleReplayLesson = async () => {
    try {
      await api.restartLesson(id);
      setLessonCompleted(false);
      setCurrentTaskIndex(0);
      setSelectedOption(null);
      setInputValue('');
      setIsAnswerChecked(false);
      setIsCorrect(false);
      setCorrectAnswerShown(null);
      setPointsEarned(0);
    } catch (e) {
      console.error(e);
    }
  };

  if (lessonCompleted) {
    return (
      <div className="lesson-completed-container">
        <div className="completion-card">
          <h2>Поздравляем!</h2>
          <p>Вы успешно завершили урок &quot;{lesson.title}&quot;.</p>
          <div className="completion-actions">
            <Button variant="secondary" onClick={handleReplayLesson} className="finish-btn">
              Пройти снова
            </Button>
            <Link to={`/lesson/${id}/review`} className="review-link">
              Отработка ошибок
            </Link>
            <Button onClick={handleFinishLesson} className="finish-btn">
              В каталог
            </Button>
          </div>
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
        <LessonProgressBar current={currentTaskIndex} total={lesson.tasks.length} />
        <div className="task-counter">
          Задание {currentTaskIndex + 1} из {lesson.tasks.length}
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

      <div
        className={`lesson-footer ${isAnswerChecked ? (isCorrect ? 'footer-correct' : 'footer-incorrect') : ''}`}
      >
        <div className="footer-content">
          {isAnswerChecked ? (
            <>
              <div className="feedback-message">
                {isCorrect ? `Отлично! +${pointsEarned} баллов` : 'В следующий раз получится!'}
              </div>
              <Button onClick={handleNextTask} variant={isCorrect ? 'primary' : 'danger'}>
                Продолжить
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCheckAnswer}
              disabled={
                (needsOption && !selectedOption) || (needsInput && !inputValue.trim())
              }
              className="check-btn"
            >
              Проверить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
