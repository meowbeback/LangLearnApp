import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await api.getLessons();
        setLessons(data);
      } catch (error) {
        console.error('Failed to fetch lessons', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const handleStartLesson = (id) => {
    navigate(`/lesson/${id}`);
  };

  if (loading) {
    return <div className="loading-state">Загрузка уроков...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Каталог уроков</h1>
      <p className="dashboard-subtitle">Выберите урок для изучения</p>

      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
            <div className="lesson-header">
              <span className="lesson-level">{lesson.level}</span>
              {lesson.completed && <span className="lesson-badge">Пройден</span>}
            </div>
            <h3 className="lesson-title">{lesson.title}</h3>
            <p className="lesson-tasks">Заданий: {lesson.tasks.length}</p>
            <Button 
              variant={lesson.completed ? 'secondary' : 'primary'} 
              onClick={() => handleStartLesson(lesson.id)}
              className="start-lesson-btn"
            >
              {lesson.completed ? 'Повторить' : 'Начать урок'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;