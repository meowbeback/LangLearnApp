import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import '../Login/Login.css';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [currentLevel, setCurrentLevel] = useState('A1');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.getCourses();
        setCourses(list);
        if (list.length) setCourseId(String(list[0].id));
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.patchStudentMe({
        target_language: targetLanguage,
        current_level: currentLevel,
        id_course: courseId ? parseInt(courseId, 10) : null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Не удалось сохранить профиль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container onboarding-page">
      <div className="auth-card">
        <h2>Настройка обучения</h2>
        <p className="onboarding-lead">Укажите целевой язык и уровень — данные сохранятся в профиле студента.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Целевой язык (код)"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            required
            placeholder="en"
          />
          <Input
            label="Уровень (CEFR)"
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value)}
            required
            placeholder="A1"
          />
          <label className="onboarding-label" htmlFor="course-select">
            Курс
          </label>
          <select
            id="course-select"
            className="onboarding-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.language}, {c.target_level})
              </option>
            ))}
          </select>
          {error && <div className="auth-error">{error}</div>}
          <Button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Сохранение...' : 'Продолжить'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
