import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { api } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const [firstLessonListLoaded, setFirstLessonListLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('');
  const [language, setLanguage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const gate = async () => {
      try {
        const me = await api.getStudentMe();
        if (cancelled) return;
        if (!me.onboarding_complete) {
          navigate('/onboarding');
          return;
        }
        setReady(true);
      } catch {
        navigate('/login');
      }
    };
    gate();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const fetchLessons = async () => {
      try {
        const params = {};
        if (q.trim()) params.q = q.trim();
        if (language.trim()) params.language = language.trim();
        if (targetLevel.trim()) params.target_level = targetLevel.trim();
        const data = await api.getLessons(params);
        if (!cancelled) setLessons(data);
      } catch (error) {
        console.error('Failed to fetch lessons', error);
      } finally {
        if (!cancelled) {
          setFirstLessonListLoaded(true);
        }
      }
    };
    fetchLessons();
    return () => {
      cancelled = true;
    };
  }, [ready, q, language, targetLevel]);

  const grouped = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      const key = lesson.course_title || 'Курс';
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson);
      return acc;
    }, {});
  }, [lessons]);

  const handleStartLesson = async (lessonId, completed) => {
    if (completed) {
      try {
        await api.restartLesson(lessonId);
      } catch (e) {
        console.error(e);
      }
    }
    navigate(`/lesson/${lessonId}`);
  };

  if (!ready || !firstLessonListLoaded) {
    return <div className="loading-state">Загрузка уроков...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Каталог уроков</h1>
      <div className="dashboard-filters">
        <Input label="Поиск по теме" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Глагол to be" />
        <Input
          label="Язык курса"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="en"
        />
        <Input label="Уровень" value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} placeholder="A1" />
      </div>
      <p className="filter-count">Найдено: {lessons.length}</p>

      {Object.entries(grouped).map(([courseTitle, items]) => (
        <section key={courseTitle} className="course-section">
          <h2 className="course-section-title">{courseTitle}</h2>
          <div className="lessons-grid">
            {items.map((lesson) => (
              <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
                <div className="lesson-card-top">
                  <span className="lesson-level">{lesson.target_level}</span>
                  {lesson.completed && <span className="lesson-badge">Пройден</span>}
                  {lesson.in_progress && !lesson.completed && (
                    <span className="lesson-badge in-progress">В процессе</span>
                  )}
                </div>
                <h3 className="lesson-title">{lesson.title}</h3>
                <p className="lesson-tasks">Заданий: {lesson.tasks_count ?? 0}</p>
                <div className="lesson-card-actions">
                  <Button
                    variant={lesson.completed ? 'secondary' : 'primary'}
                    onClick={() => handleStartLesson(lesson.id, lesson.completed)}
                    className="start-lesson-btn"
                  >
                    {lesson.completed ? 'Повторить' : lesson.in_progress ? 'Продолжить' : 'Начать урок'}
                  </Button>
                  <Link to={`/lesson/${lesson.id}/review`} className="review-mini-link">
                    Ошибки
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Dashboard;
