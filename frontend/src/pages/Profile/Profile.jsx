import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user.username}</h2>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Уроков пройдено</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">0</span>
            <span className="stat-label">Дней подряд</span>
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