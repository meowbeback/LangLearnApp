/**
 * @file Lesson.jsx
 * @brief Компонент для прохождения интерактивного урока.
 * 
 * Отвечает за отображение заданий, проверку ответов пользователя
 * и переключение между вопросами. Поддерживает типы заданий 'translate' и 'input'.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { api } from '../../services/api';
import './Lesson.css';

/**
 * @brief Главный компонент страницы урока.
 * 
 * @return {JSX.Element} Отрендеренный интерфейс урока.
 */
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

  /**
   * @brief Загружает данные урока при монтировании компонента.
   */
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await api.getLesson(id);
        setLesson(data);
      } catch (error) {
        console.error('Failed to fetch lesson', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading-state">Загрузка урока...</div>;
  }

  if (!lesson) {
    return <div className="error-state">Урок не найден</div>;
  }

  const currentTask = lesson.tasks[currentTaskIndex];

  /**
   * @brief Проверяет правильность введенного или выбранного ответа.
   * Устанавливает флаги `isCorrect` и `isAnswerChecked`.
   */
  const handleCheckAnswer = () => {
    let correct = false;
    
    if (currentTask.type === 'translate') {
      correct = selectedOption === currentTask.correctAnswer;
    } else if (currentTask.type === 'input') {
      correct = inputValue.trim().toLowerCase() === currentTask.correctAnswer.toLowerCase();
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);
  };

  /**
   * @brief Переключает на следующее задание или завершает урок.
   * Сбрасывает состояние текущего ответа.
   */
  const handleNextTask = () => {
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setInputValue('');
    setIsCorrect(false);

    if (currentTaskIndex < lesson.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    } else {
      setLessonCompleted(true);
    }
  };

  /**
   * @brief Возвращает пользователя обратно в каталог.
   */
  const handleFinishLesson = () => {
    navigate('/dashboard');
  };

  if (lessonCompleted) {
    return (
      <div className="lesson-completed-container">
        <div className="completion-card">
          <h2>Поздравляем!</h2>
          <p>Вы успешно завершили урок "{lesson.title}".</p>
          <Button onClick={handleFinishLesson} className="finish-btn">
            Вернуться в каталог
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <button className="close-btn" onClick={() => navigate('/dashboard')}>
          ✕
        </button>
        <div className="task-counter">
          Задание {currentTaskIndex + 1} из {lesson.tasks.length}
        </div>
      </div>

      <div className="task-container">
        <h2 className="task-question">{currentTask.question}</h2>

        {currentTask.type === 'translate' && (
          <div className="options-grid">
            {currentTask.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn 
                  ${selectedOption === option ? 'selected' : ''} 
                  ${isAnswerChecked && option === currentTask.correctAnswer ? 'correct' : ''}
                  ${isAnswerChecked && selectedOption === option && !isCorrect ? 'incorrect' : ''}
                `}
                onClick={() => !isAnswerChecked && setSelectedOption(option)}
                disabled={isAnswerChecked}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentTask.type === 'input' && (
          <div className="input-task">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите ответ..."
              disabled={isAnswerChecked}
              error={isAnswerChecked && !isCorrect ? 'Неверный ответ' : ''}
            />
            {isAnswerChecked && isCorrect && (
              <div className="success-message">Правильно!</div>
            )}
            {isAnswerChecked && !isCorrect && (
              <div className="correct-answer-hint">
                Правильный ответ: <strong>{currentTask.correctAnswer}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`lesson-footer ${isAnswerChecked ? (isCorrect ? 'footer-correct' : 'footer-incorrect') : ''}`}>
        <div className="footer-content">
          {isAnswerChecked ? (
            <>
              <div className="feedback-message">
                {isCorrect ? 'Отлично!' : 'В следующий раз получится!'}
              </div>
              <Button onClick={handleNextTask} variant={isCorrect ? 'primary' : 'danger'}>
                Продолжить
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleCheckAnswer} 
              disabled={(currentTask.type === 'translate' && !selectedOption) || (currentTask.type === 'input' && !inputValue.trim())}
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