import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ completedLessons: 0, streak: 0, points: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadStats = async () => {
      try {
        const data = await api.getProfileStats();
        if (cancelled) return;
        setStats({
          completedLessons: data.completed_lessons_count ?? 0,
          streak: data.current_streak ?? 0,
          points: data.total_points ?? 0,
        });
      } catch {
        if (!cancelled) {
          setStats({ completedLessons: 0, streak: 0, points: 0 });
        }
      }
    };
    loadStats();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.login || user.username || user.email;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{String(displayName).charAt(0).toUpperCase()}</div>
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.completedLessons}</span>
            <span className="stat-label">Уроков пройдено</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.streak}</span>
            <span className="stat-label">Дней подряд</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.points}</span>
            <span className="stat-label">Баллы</span>
          </div>
        </div>

        <Button variant="danger" onClick={handleLogout} className="logout-btn-full">
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
};

export default Profile;
